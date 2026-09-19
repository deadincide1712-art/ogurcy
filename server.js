// ================= Огуречные Шокеры — сервер лобби =================
// Раздаёт игру из папки public и пересылает сообщения между игроками одного лобби.
// Вся игровая логика живёт у хоста (создателя лобби) — сервер только ретранслятор.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { WebSocketServer } = require('ws');

const PORT = +process.env.PORT || 3000;
const MAX_PLAYERS = 10;
const PUBLIC = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Не найдено'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

// ---------- лобби ----------
const lobbies = new Map();          // code -> { code, host, players: Map(id -> player), settings, inGame }
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let nextId = 1;

// ---------- публичные серверы: всегда открыты, заходит кто угодно ----------
const PUBLIC_ROOMS = [
  { code: 'PUB01', name: 'Огород для всех', mode: 'ffa', maps: ['garden', 'kitchen', 'greenhouse', 'factory'] },
  { code: 'PUB02', name: 'Укроп против Чеснока', mode: 'tdm', maps: ['kitchen', 'factory', 'garden', 'greenhouse'] },
  { code: 'PUB03', name: 'Битва за банку', mode: 'koth', maps: ['greenhouse', 'garden', 'factory', 'kitchen'] },
  { code: 'PUB04', name: 'Гонка вооружений', mode: 'gungame', maps: ['factory', 'garden', 'kitchen', 'greenhouse'] },
  { code: 'PUB05', name: 'Сбор семечек', mode: 'seeds', maps: ['garden', 'greenhouse', 'kitchen', 'factory'] },
];
for (const r of PUBLIC_ROOMS) lobbies.set(r.code, {
  code: r.code, name: r.name, public: true, host: null, players: new Map(), inGame: false, curMap: r.maps[0],
  settings: { mode: r.mode, maps: r.maps, diff: 1, fill: 6 },
});
const MODES_OK = ['ffa', 'tdm', 'koth', 'gungame', 'seeds', 'knives'], MAPS_OK = ['garden', 'kitchen', 'greenhouse', 'factory'];
const MAX_CUSTOM = 20;
// сначала встроенные серверы, потом созданные игроками
function roomList() {
  return [...lobbies.values()].filter(l => l.public).sort((a, b) => (a.custom ? 1 : 0) - (b.custom ? 1 : 0))
    .map(l => ({ code: l.code, name: l.name, mode: l.settings.mode, map: l.curMap, players: l.players.size, max: MAX_PLAYERS, custom: !!l.custom }));
}

function makeCode() {
  let c;
  do { c = Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join(''); } while (lobbies.has(c));
  return c;
}
const cleanName = n => String(n || '').replace(/[<>&"]/g, '').trim().slice(0, 16) || 'Огурчик';
function send(ws, o) { if (ws.readyState === 1) ws.send(JSON.stringify(o)); }
function lobbyInfo(l) {
  return {
    t: 'lobby', code: l.code, host: l.host, inGame: l.inGame, settings: l.settings, max: MAX_PLAYERS, public: !!l.public, name: l.name, curMap: l.curMap,
    players: [...l.players.values()].map(p => ({ id: p.id, name: p.name, team: p.team })),
  };
}
function broadcastLobby(l) { const info = lobbyInfo(l); for (const p of l.players.values()) send(p.ws, { ...info, you: p.id }); }
function balancedTeam(l) {
  let a = 0, b = 0; for (const p of l.players.values()) p.team === 0 ? a++ : b++;
  return a <= b ? 0 : 1;
}

function leave(ws) {
  const l = ws.lobby; if (!l) return;
  l.players.delete(ws.pid); ws.lobby = null;
  if (l.public) {
    for (const p of l.players.values()) send(p.ws, { t: 'left', id: ws.pid });
    if (!l.players.size) {
      if (l.custom) { lobbies.delete(l.code); console.log(`Публичный сервер «${l.name}» удалён`); return; }
      l.host = null; l.inGame = false; return;   // встроенная комната опустела — ждёт новых игроков
    }
    if (ws.pid === l.host) l.host = l.players.keys().next().value;       // новый хост продолжает матч
    broadcastLobby(l);
    return;
  }
  if (ws.pid === l.host) {
    for (const p of l.players.values()) { send(p.ws, { t: 'closed', reason: 'Хост закрыл лобби' }); p.ws.lobby = null; }
    lobbies.delete(l.code);
    console.log(`Лобби ${l.code} закрыто`);
    return;
  }
  for (const p of l.players.values()) send(p.ws, { t: 'left', id: ws.pid });
  broadcastLobby(l);
}

const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('error', () => {}); // ошибки порта разбирает обработчик server.on('error') ниже
wss.on('connection', ws => {
  ws.pid = 'p' + (nextId++);
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    const l = ws.lobby;
    switch (m.t) {
      case 'create': {
        leave(ws);
        if (m.public) {                                    // свой публичный сервер
          const custom = [...lobbies.values()].filter(x => x.custom).length;
          if (custom >= MAX_CUSTOM) return send(ws, { t: 'error', msg: 'Серверов уже слишком много — зайди в один из списка' });
          const st = m.settings || {}, mode = MODES_OK.includes(st.mode) ? st.mode : 'ffa', first = MAPS_OK.includes(st.map) ? st.map : 'garden';
          const maps = [first, ...MAPS_OK.filter(x => x !== first)];
          const name = String(m.srvName || '').replace(/[<>&"]/g, '').trim().slice(0, 24) || 'Сервер ' + cleanName(m.name);
          const code = makeCode();
          const lobby = { code, name, public: true, custom: true, host: ws.pid, players: new Map(), inGame: false, curMap: first, settings: { mode, maps, diff: 1, fill: 6 } };
          lobby.players.set(ws.pid, { id: ws.pid, name: cleanName(m.name), team: 0, ws });
          lobbies.set(code, lobby); ws.lobby = lobby;
          console.log(`Публичный сервер «${name}» (${code}) создан`);
          broadcastLobby(lobby);
          break;
        }
        const code = makeCode();
        const lobby = { code, host: ws.pid, players: new Map(), settings: m.settings || {}, inGame: false };
        lobby.players.set(ws.pid, { id: ws.pid, name: cleanName(m.name), team: 0, ws });
        lobbies.set(code, lobby); ws.lobby = lobby;
        console.log(`Лобби ${code} создано`);
        broadcastLobby(lobby);
        break;
      }
      case 'join': {
        const lobby = lobbies.get(String(m.code || '').toUpperCase().trim());
        if (!lobby) return send(ws, { t: 'error', msg: 'Лобби с таким кодом не найдено' });
        if (lobby.players.size >= MAX_PLAYERS) return send(ws, { t: 'error', msg: `Лобби заполнено: уже ${MAX_PLAYERS} игроков` });
        leave(ws);
        const pl = { id: ws.pid, name: cleanName(m.name), team: balancedTeam(lobby), ws };
        lobby.players.set(ws.pid, pl); ws.lobby = lobby;
        if (!lobby.host) lobby.host = ws.pid;                 // в пустой публичной комнате первый зашедший — хост
        broadcastLobby(lobby);
        if (lobby.inGame && lobby.host !== ws.pid) send(lobby.players.get(lobby.host).ws, { t: 'late', id: pl.id, name: pl.name, team: pl.team });
        break;
      }
      case 'leave': leave(ws); send(ws, { t: 'closed', reason: '' }); break;
      case 'team': {
        if (!l || l.inGame) return;
        const p = l.players.get(ws.pid); if (p) { p.team = m.team ? 1 : 0; broadcastLobby(l); }
        break;
      }
      case 'list': send(ws, { t: 'list', rooms: roomList() }); break;
      case 'settings': if (l && ws.pid === l.host && !l.public) { l.settings = m.settings || {}; broadcastLobby(l); } break;
      case 'state': if (l && ws.pid === l.host) { l.inGame = !!m.inGame; if (m.map) l.curMap = m.map; broadcastLobby(l); } break;
      case 'relay': {
        if (!l) return;
        const out = JSON.stringify({ t: 'msg', from: ws.pid, d: m.d });
        const to = m.to === 'host' ? l.host : m.to;
        if (to) { const p = l.players.get(to); if (p && p.ws.readyState === 1) p.ws.send(out); }
        else for (const p of l.players.values()) if (p.id !== ws.pid && p.ws.readyState === 1) p.ws.send(out);
        break;
      }
    }
  });
  ws.on('close', () => leave(ws));
});
// отключаем «зависшие» соединения
setInterval(() => { for (const ws of wss.clients) { if (!ws.isAlive) { ws.terminate(); continue; } ws.isAlive = false; ws.ping(); } }, 15000);

server.on('error', err => {
  if (err.code === 'EADDRINUSE') console.error(`
Порт ${PORT} уже занят — скорее всего, игра уже запущена в другом окне.
Закрой его или запусти на другом порту: set PORT=3001 && npm start
`);
  else console.error(err);
  process.exit(1);
});
server.listen(PORT, () => {
  console.log(`\n🥒 Огуречные Шокеры запущены!`);
  console.log(`   На этом компьютере:     http://localhost:${PORT}`);
  for (const list of Object.values(os.networkInterfaces())) for (const a of list || [])
    if (a.family === 'IPv4' && !a.internal) console.log(`   Для друзей в той же сети: http://${a.address}:${PORT}`);
  console.log(`\n   Для друзей через интернет — см. README.md (туннель или хостинг).\n`);
});
