// ================= Огуречные Шокеры — сервер лобби =================
// Раздаёт игру из папки public и пересылает сообщения между игроками одного лобби.
// Вся игровая логика живёт у хоста (создателя лобби) — сервер только ретранслятор.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

const PORT = +process.env.PORT || 3000;
const ADMIN_PASS = (process.env.ADMIN_PASS || '').trim();   // задаётся на Render в разделе Environment; в коде пароля нет
const MAX_PLAYERS = 10;
const PUBLIC = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon' };

// ---------- защитные заголовки ----------
// Страница может грузить только свои скрипты, шрифты Google и подключаться к нашим серверам.
// Встроить игру в чужой сайт (для обмана игроков) нельзя, камера/микрофон/геолокация выключены.
const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' wss://ogurcy.onrender.com wss://ogurcy-us.onrender.com wss://ogurcy-asia.onrender.com ws://localhost:* ws://127.0.0.1:*",
    "object-src 'none'", "base-uri 'none'", "form-action 'none'", "frame-ancestors 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000',
};
function deny(res, code, text) { res.writeHead(code, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' }); res.end(text || ''); }

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return deny(res, 405);       // сайт только отдаёт файлы
  let p;
  try { p = decodeURIComponent(req.url.split('?')[0]); } catch (e) { return deny(res, 400); }   // кривой адрес больше не роняет сервер
  if (p === '/') p = '/index.html';
  if (p.includes('\0') || /(^|\/)\./.test(p)) return deny(res, 404);            // скрытые файлы (.git, .env) не отдаём
  const file = path.normalize(path.join(PUBLIC, p));
  if (file !== PUBLIC && !file.startsWith(PUBLIC + path.sep)) return deny(res, 403); // только папка public, без соседних
  fs.readFile(file, (err, data) => {
    if (err) return deny(res, 404, 'Не найдено');
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : data);
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
  { code: 'PUB06', name: 'Нашествие', mode: 'horde', maps: ['factory', 'garden', 'kitchen', 'greenhouse'] },
];
for (const r of PUBLIC_ROOMS) lobbies.set(r.code, {
  code: r.code, name: r.name, public: true, host: null, players: new Map(), inGame: false, curMap: r.maps[0],
  settings: { mode: r.mode, maps: r.maps, diff: 1, fill: 6 },
});
const MODES_OK = ['ffa', 'tdm', 'koth', 'gungame', 'seeds', 'knives', 'horde'], MAPS_OK = ['garden', 'kitchen', 'greenhouse', 'factory'];
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
const INVISIBLE = /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/g;
const cleanName = n => String(n || '').replace(INVISIBLE, '').replace(/[<>&"'`]/g, '').trim().slice(0, 16) || 'Огурчик';
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

// адрес игрока нужен только для лимитов — он не пишется в логи и никому не пересылается
const clientIp = req => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '?';
const ALLOWED_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\d{1,3}(\.\d{1,3}){3}|ogurcy(-us|-asia)?\.onrender\.com)(:\d+)?$/;
const MAX_CONN_PER_IP = 20;          // компания друзей за одним роутером влезает
const conns = new Map();             // ip -> число открытых соединений
const adminTries = new Map();        // ip -> { n, until } — защита от подбора пароля админки
const MAX_CUSTOM_PER_IP = 2;
const wss = new WebSocketServer({
  server, path: '/ws',
  maxPayload: 64 * 1024,             // огромные сообщения отбрасываются сразу
  verifyClient: ({ origin, req }) => {
    if (origin && !ALLOWED_ORIGIN.test(origin)) return false;           // чужие сайты к серверу не подключатся
    return (conns.get(clientIp(req)) || 0) < MAX_CONN_PER_IP;
  },
});
// сравнение паролей за одинаковое время — по скорости ответа ничего не угадать
function samePass(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
wss.on('error', () => {}); // ошибки порта разбирает обработчик server.on('error') ниже
wss.on('connection', (ws, req) => {
  ws.pid = 'p' + (nextId++);
  ws.isAlive = true;
  ws.ip = clientIp(req);
  conns.set(ws.ip, (conns.get(ws.ip) || 0) + 1);
  // не больше ~200 сообщений в секунду: игре хватает с запасом, спам отсекается
  ws.tokens = 400; ws.lastRefill = Date.now(); ws.strikes = 0;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', raw => {
    const nowMs = Date.now();
    ws.tokens = Math.min(400, ws.tokens + (nowMs - ws.lastRefill) * .2); ws.lastRefill = nowMs;
    if (ws.tokens < 1) { if (++ws.strikes > 200) ws.terminate(); return; }
    ws.tokens -= 1;
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m !== 'object' || typeof m.t !== 'string') return;
    const l = ws.lobby;
    switch (m.t) {
      case 'create': {
        leave(ws);
        if (m.public) {                                    // свой публичный сервер
          const custom = [...lobbies.values()].filter(x => x.custom).length;
          if (custom >= MAX_CUSTOM) return send(ws, { t: 'error', msg: 'Серверов уже слишком много — зайди в один из списка' });
          if ([...lobbies.values()].filter(x => x.custom && x.ownerIp === ws.ip).length >= MAX_CUSTOM_PER_IP) return send(ws, { t: 'error', msg: 'С одного адреса можно держать не больше двух серверов' });
          const st = m.settings || {}, mode = MODES_OK.includes(st.mode) ? st.mode : 'ffa', first = MAPS_OK.includes(st.map) ? st.map : 'garden';
          const maps = [first, ...MAPS_OK.filter(x => x !== first)];
          const name = String(m.srvName || '').replace(INVISIBLE, '').replace(/[<>&"'`]/g, '').trim().slice(0, 24) || 'Сервер ' + cleanName(m.name);
          const code = makeCode();
          const lobby = { code, name, public: true, custom: true, ownerIp: ws.ip, host: ws.pid, players: new Map(), inGame: false, curMap: first, settings: { mode, maps, diff: 1, fill: 6 } };
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
        const lobby = lobbies.get(String(m.code || '').toUpperCase().trim().slice(0, 8));
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
      case 'admin': {                                   // права админа: пароль знает только сервер
        if (!ADMIN_PASS) return send(ws, { t: 'adminfail', msg: 'На сервере не задан ADMIN_PASS — панель выключена' });
        const tr = adminTries.get(ws.ip) || { n: 0, until: 0 };
        if (tr.until > Date.now()) return send(ws, { t: 'adminfail', msg: 'Слишком много попыток — подожди 15 минут.' });
        if (!samePass(String(m.pass || '').trim().slice(0, 200), ADMIN_PASS)) {
          tr.n++; if (tr.n >= 5) { tr.n = 0; tr.until = Date.now() + 15 * 60 * 1000; }
          adminTries.set(ws.ip, tr);
          return send(ws, { t: 'adminfail', msg: 'Пароль не подошёл.' });
        }
        adminTries.delete(ws.ip);
        ws.admin = true; send(ws, { t: 'adminok' });
        console.log(`Игрок ${ws.pid} получил права админа`);
        break;
      }
      case 'ping': send(ws, { t: 'pong' }); break;
      case 'settings': if (l && ws.pid === l.host && !l.public) { l.settings = m.settings || {}; broadcastLobby(l); } break;
      case 'state': if (l && ws.pid === l.host) { l.inGame = !!m.inGame; if (m.map) l.curMap = m.map; broadcastLobby(l); } break;
      case 'relay': {
        if (!l || !m.d || typeof m.d !== 'object') return;
        if (m.to !== undefined && m.to !== 'host' && !(typeof m.to === 'string' && /^p\d{1,9}$/.test(m.to))) return;
        const out = JSON.stringify({ t: 'msg', from: ws.pid, adm: ws.admin || undefined, d: m.d });
        const to = m.to === 'host' ? l.host : m.to;
        if (to) { const p = l.players.get(to); if (p && p.ws.readyState === 1) p.ws.send(out); }
        else for (const p of l.players.values()) if (p.id !== ws.pid && p.ws.readyState === 1) p.ws.send(out);
        break;
      }
    }
  });
  ws.on('close', () => {
    leave(ws);
    const c = (conns.get(ws.ip) || 1) - 1; if (c > 0) conns.set(ws.ip, c); else conns.delete(ws.ip);
  });
  ws.on('error', () => {});
});
// отключаем «зависшие» соединения
setInterval(() => { for (const ws of wss.clients) { if (!ws.isAlive) { ws.terminate(); continue; } ws.isAlive = false; ws.ping(); } }, 15000);

process.on('uncaughtException', err => console.error('Ошибка (сервер продолжает работу):', err && err.message));
process.on('unhandledRejection', err => console.error('Ошибка (сервер продолжает работу):', err && err.message));

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
