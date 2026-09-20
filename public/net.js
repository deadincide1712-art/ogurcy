// ================= Огуречные Шокеры — мультиплеер =================
// Схема: сервер только пересылает сообщения внутри лобби. Хост (создатель лобби) — главный:
// он считает здоровье, убийства, очки, точку захвата и управляет ботами.
// Каждый игрок сам двигает своего огурца и сам проверяет свои попадания, а урон присылает хосту.
const NET = { ws: null, lobby: null, me: null, isHost: false, inGame: false, tSt: 0, tBots: 0, tScore: 0 };
const authority = () => !NET.inGame || NET.isHost;
const r2 = x => Math.round(x * 100) / 100;
const entById = id => ents.find(e => e.id === id);
function netSend(o) { if (NET.ws && NET.ws.readyState === 1) NET.ws.send(JSON.stringify(o)); }
function relay(d, to) { if (NET.inGame) netSend({ t: 'relay', to, d }); }

// ---------- серверы по регионам ----------
// на сайте — три сервера в разных частях света; при запуске через npm start — только этот компьютер
const ON_RENDER = /\.onrender\.com$/.test(location.hostname);
const REGIONS = ON_RENDER ? [
  { id: 'eu', name: 'Европа', city: 'Франкфурт', host: 'ogurcy.onrender.com' },
  { id: 'us', name: 'США', city: 'Вирджиния', host: 'ogurcy-us.onrender.com' },
  { id: 'asia', name: 'Азия', city: 'Сингапур', host: 'ogurcy-asia.onrender.com' },
] : [{ id: 'here', name: 'Этот сервер', city: location.host, host: location.host }];
const REG = { id: null, auto: true, ping: {}, busy: {} };
try { const r = localStorage.getItem('ogurcy-region'); if (REGIONS.some(x => x.id === r)) { REG.id = r; REG.auto = false; } } catch (e) {}
const wsUrl = host => (location.protocol === 'https:' ? 'wss://' : 'ws://') + host + '/ws';
const curRegion = () => REGIONS.find(r => r.id === REG.id) || REGIONS[0];

// пинг: отдельное соединение, три замера, берём лучший. Спящий бесплатный сервер просыпается до минуты
function measurePing(r) {
  return new Promise(res => {
    let ws, done = false, t0 = 0, n = 0, best = Infinity;
    const fin = v => { if (done) return; done = true; clearTimeout(to); clearTimeout(slow); try { ws.close(); } catch (e) {} res(v); };
    const to = setTimeout(() => fin(best < Infinity ? Math.round(best) : null), 75000);
    const slow = setTimeout(() => { if (!n) { REG.busy[r.id] = 'wake'; renderRegions(); } }, 2500);
    const ping = () => { t0 = performance.now(); ws.send('{"t":"ping"}'); };
    try { ws = new WebSocket(wsUrl(r.host)); } catch (e) { return fin(null); }
    ws.onopen = ping;
    ws.onmessage = ev => {
      if (!/"pong"/.test(ev.data)) return;
      best = Math.min(best, performance.now() - t0);
      if (++n >= 3) fin(Math.round(best)); else ping();
    };
    ws.onerror = () => fin(null);
  });
}
async function pingRegions() {
  await Promise.all(REGIONS.map(async r => {
    if (REG.busy[r.id]) return;
    REG.busy[r.id] = 'ping'; renderRegions();
    REG.ping[r.id] = await measurePing(r);
    REG.busy[r.id] = null; renderRegions();
  }));
  if (REG.auto) {                                  // сами не выбирали — берём самый быстрый
    const ok = REGIONS.filter(r => REG.ping[r.id] != null).sort((a, b) => REG.ping[a.id] - REG.ping[b.id]);
    if (ok.length && ok[0].id !== curRegion().id && !NET.lobby) switchRegion(ok[0].id, true);
  }
}
function renderRegions() {
  const box = $('regionPick'); if (!box) return;
  $('regionBox').hidden = REGIONS.length < 2;
  box.textContent = '';
  const cur = curRegion();
  for (const r of REGIONS) {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(r.id === cur.id));
    b.disabled = !!NET.lobby;
    const nm = document.createElement('span'); nm.textContent = r.name;
    const city = document.createElement('small'); city.textContent = r.city;
    const pg = document.createElement('span'); pg.className = 'ping';
    const ms = REG.ping[r.id], busy = REG.busy[r.id];
    if (busy === 'wake') pg.textContent = 'просыпается…';
    else if (busy) pg.textContent = 'меряем пинг…';
    else if (ms == null) pg.textContent = r.id in REG.ping ? 'нет связи' : '—';
    else { pg.textContent = ms + ' мс'; pg.classList.add(ms < 80 ? 'good' : ms < 160 ? 'ok' : 'bad'); }
    b.append(nm, city, pg);
    b.addEventListener('click', () => { REG.auto = false; try { localStorage.setItem('ogurcy-region', r.id); } catch (e) {} switchRegion(r.id); });
    box.append(b);
  }
  $('regionNote').textContent = NET.lobby ? 'Сервер можно сменить, когда выйдешь из матча.'
    : (REG.auto ? 'Выбран автоматически — самый быстрый. ' : '') + 'Друзья должны выбрать тот же сервер, иначе не увидят твоё лобби.';
}
function switchRegion(id, auto) {
  if (NET.lobby) return;
  if (!auto) REG.auto = false;
  const was = curRegion().id; REG.id = id;
  if (curRegion().id !== was && NET.ws) { const old = NET.ws; NET.ws = null; NET.connecting = null; try { old.close(); } catch (e) {} }
  $('pubRooms').textContent = 'Загружаем список…';
  renderRegions(); requestRooms();
}

// ---------- подключение ----------
function netConnect() {
  if (NET.ws && NET.ws.readyState === 1) return Promise.resolve();
  if (NET.connecting) return NET.connecting;         // спящий сервер отвечает долго — не плодим соединения
  if (!/^https?:$/.test(location.protocol)) return Promise.reject(new Error('Открой игру через сервер (npm start), а не как файл'));
  const p = new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl(curRegion().host));
    NET.ws = ws;
    ws.onopen = () => { if (NET.connecting === p) NET.connecting = null; res(); };
    ws.onerror = () => { if (NET.connecting === p) NET.connecting = null; rej(new Error('Не удалось подключиться к серверу')); };
    ws.onmessage = ev => { if (NET.ws !== ws) return; let m; try { m = JSON.parse(ev.data); } catch (e) { return; } onServer(m); };
    ws.onclose = () => { if (NET.ws !== ws) return; if (NET.lobby) leaveOnline('Соединение с сервером потеряно'); NET.ws = null; NET.connecting = null; };
  });
  NET.connecting = p;
  return p;
}
function netMsg(text) { $('netMsg').textContent = text; }

function onServer(m) {
  switch (m.t) {
    case 'lobby': {
      const wasHost = NET.isHost;
      NET.lobby = m; NET.me = m.you; NET.isHost = m.host === m.you;
      if (m.public) {
        if (NET.isHost && NET.inGame && !wasHost) becomeHost();   // прежний хост ушёл — матч ведём мы
        else if (NET.isHost && !NET.inGame) publicStart(false);       // пустая комната — запускаем матч сами
        else if (!NET.inGame) netMsg(`Подключаемся к «${m.name}»…`);
        break;
      }
      renderLobby();
      if (!NET.inGame) showLobby();
      break;
    }
    case 'list': renderRooms(m.rooms); break;
    case 'error': netMsg(m.msg); break;
    case 'adminok': if (typeof ADMIN === 'object') { ADMIN.server = true; if (typeof adminGrant === 'function') adminGrant(); if (typeof adminFlash === 'function') adminFlash('Права админа подтверждены сервером'); } break;
    case 'adminfail': if (typeof adminFail === 'function') adminFail(m.msg); break;
    case 'closed': leaveOnline(m.reason); break;
    case 'left': {
      const e = entById(m.id);
      if (e && NET.inGame) { scene.remove(e.mesh); scene.remove(e.tag); ents.splice(ents.indexOf(e), 1); announce(`${e.name} вышел из игры`, '#eef4c4'); }
      break;
    }
    case 'late': if (NET.isHost && NET.inGame) hostAddLate(m); break;
    case 'msg': onGame(m.from, m.d, m.adm); break;
  }
}

// ---------- экран лобби ----------
function showLobby() {
  if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock();
  $('menu').hidden = false; $('mainPanel').hidden = true; $('lobbyPanel').hidden = false;
  $('charHostLobby').hidden = false;
  if (typeof charViewMoveTo === 'function') charViewMoveTo('charHostLobby');
}
function showMain() {
  $('menu').hidden = false; $('mainPanel').hidden = false; $('lobbyPanel').hidden = true;
  $('charHostLobby').hidden = true;
  if (typeof charViewMoveTo === 'function') charViewMoveTo('charHost');
}
function lobbySettings() {
  return { map: $('lMap').value, mode: $('lMode').value, diff: +$('lDiff').value, bots: +$('lBots').value };
}
function renderLobby() {
  const L = NET.lobby; if (!L) return;
  const s = Object.assign({ map: 'garden', mode: 'tdm', diff: 1, bots: 0 }, L.settings);
  $('lobbyCode').textContent = L.code;
  $('pcount').textContent = `${L.players.length} / ${L.max}`;
  const teamMode = !!(MODES[s.mode] && MODES[s.mode].teams);
  const ul = $('plist'); ul.textContent = '';
  for (const p of L.players) {
    const li = document.createElement('li');
    const dot = document.createElement('span'); dot.className = 'pdot';
    dot.style.background = teamMode ? TEAMS[p.team].css : '#eef4c4';
    const nm = document.createElement('span'); nm.textContent = p.name;
    li.append(dot, nm);
    if (p.id === L.host) { const b = document.createElement('em'); b.textContent = 'хост'; li.append(b); }
    if (p.id === NET.me) { const b = document.createElement('em'); b.className = 'you'; b.textContent = 'ты'; li.append(b); }
    if (teamMode) { const t = document.createElement('small'); t.textContent = TEAMS[p.team].name; t.style.color = TEAMS[p.team].css; li.append(t); }
    ul.append(li);
  }
  for (const [id, v] of [['lMap', s.map], ['lMode', s.mode], ['lDiff', s.diff], ['lBots', s.bots]]) { $(id).value = String(v); $(id).disabled = !NET.isHost; }
  $('teamPick').hidden = !teamMode;
  const mine = L.players.find(p => p.id === NET.me);
  $('teamPick').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(mine && +b.dataset.team === mine.team)));
  $('startMatch').hidden = !NET.isHost;
  $('waitHost').hidden = NET.isHost;
  $('waitHost').textContent = L.inGame ? 'Матч уже идёт — подключаемся…' : 'Ждём, пока хост начнёт матч…';
}
function leaveOnline(reason) {
  const wasIn = NET.inGame;
  NET.inGame = false; NET.lobby = null; NET.isHost = false;
  if (wasIn) { gameOver = true; running = false; mouseDown = false; if (document.exitPointerLock) document.exitPointerLock(); $('hud').hidden = true; }
  showMain(); netMsg(reason || '');
}

// кнопки
$('createLobby').addEventListener('click', async () => {
  netMsg('Подключаемся…');
  try { await netConnect(); netSend({ t: 'create', name: myName(), settings: { map: menuMap, mode: menuMode, diff: difficulty, bots: 0 } }); netMsg(''); }
  catch (e) { netMsg(e.message); }
});
$('joinLobby').addEventListener('click', joinByCode);
$('joinCode').addEventListener('keydown', e => { if (e.key === 'Enter') joinByCode(); });
async function joinByCode() {
  const code = $('joinCode').value.trim().toUpperCase();
  if (code.length !== 5) return netMsg('Код лобби — 5 символов, например K7MQ2');
  netMsg('Подключаемся…');
  try { await netConnect(); netSend({ t: 'join', name: myName(), code }); netMsg(''); }
  catch (e) { netMsg(e.message); }
}
function myName() { const n = ($('nick').value.trim() || 'Огурчик').slice(0, 16); try { localStorage.setItem('ogurcy-nick', n); } catch (e) {} return n; }
$('leaveLobby').addEventListener('click', () => { netSend({ t: 'leave' }); });
$('copyCode').addEventListener('click', () => {
  const code = $('lobbyCode').textContent;
  (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => { $('copyCode').textContent = 'Скопировано'; setTimeout(() => $('copyCode').textContent = 'Скопировать', 1500); }, () => {});
});
['lMap', 'lMode', 'lDiff', 'lBots'].forEach(id => $(id).addEventListener('change', () => { if (NET.isHost) netSend({ t: 'settings', settings: lobbySettings() }); }));
$('teamPick').addEventListener('click', e => { const b = e.target.closest('button'); if (b) netSend({ t: 'team', team: +b.dataset.team }); });
$('startMatch').addEventListener('click', () => hostStart());

// ---------- старт матча ----------
function hostStart(over) {
  const s = over || lobbySettings(), team = !!(MODES[s.mode] && MODES[s.mode].teams);
  const roster = NET.lobby.players.map(p => ({ id: p.id, name: p.name, team: team ? p.team : null }));
  for (let i = 0; i < s.bots; i++) {
    let t = null;
    if (team) { const c0 = roster.filter(r => r.team === 0).length, c1 = roster.filter(r => r.team === 1).length; t = c0 <= c1 ? 0 : 1; }
    roster.push({ id: 'b' + i, name: BOT_NAMES[i % BOT_NAMES.length], team: t, bot: true, i });
  }
  const d = { k: 'start', map: s.map, mode: s.mode, diff: s.diff, roster };
  netSend({ t: 'state', inGame: true, map: s.map });
  netSend({ t: 'relay', d });
  startOnline(d);
}
function startOnline(d) {
  audioInit();
  NET.inGame = true;
  mode = d.mode; difficulty = d.diff;
  if (currentMap !== d.map) buildMap(d.map);
  resetMode();
  jars.forEach(j => scene.remove(j.m)); jars.length = 0;
  ents.forEach(e => { if (e.mesh) { scene.remove(e.mesh); scene.remove(e.tag); } });
  ents.length = 0;
  const meR = d.roster.find(r => r.id === NET.me);
  player = null;
  player = makeEnt(meR.name, true, 7, meR.team); player.id = meR.id; player.kind = 'local';
  d.roster.forEach((r, idx) => {
    if (r.id === NET.me) return;
    const e = makeEnt(r.name, false, r.bot ? r.i : idx, r.team);
    e.id = r.id; e.kind = r.bot ? 'bot' : 'remote';
    e.alive = false; e.mesh.visible = e.tag.visible = false;
    if (r.alive && r.p) { e.alive = true; e.pos.set(...r.p); e.net = { x: r.p[0], y: r.p[1], z: r.p[2], yaw: 0, pitch: 0 }; e.mesh.visible = e.tag.visible = true; }
    if (r.k != null) { e.kills = r.k; e.deaths = r.dd; }
  });
  if (d.ts) { teamScore[0] = d.ts[0]; teamScore[1] = d.ts[1]; }
  if (NET.isHost) ents.forEach(e => { if (e.kind === 'bot') spawn(e); });
  spawn(player); buildViewmodel();
  running = true; gameOver = false; paused = true; now = 0;
  ents.forEach(e => e.lastHurt = -10);
  $('menu').hidden = true; $('hud').hidden = false; $('board').style.display = 'none';
  $('feed').innerHTML = ''; hideCenter();
  if (isTeamMode()) announce(`Ты за команду ${TEAMS[player.team].name}` + (mode === 'koth' ? ' · захвати банку!' : ''), TEAMS[player.team].css);
  lockPointer();
}
// игрок зашёл во время матча
function hostAddLate(m) {
  const team = isTeamMode() ? m.team : null;
  const e = makeEnt(m.name, false, ents.length, team); e.id = m.id; e.kind = 'remote';
  e.alive = false; e.mesh.visible = e.tag.visible = false;
  const roster = ents.map((x, idx) => ({
    id: x.id, name: x.name, team: x.team, bot: x.kind === 'bot', i: x.kind === 'bot' ? +x.id.slice(1) : idx,
    alive: x.alive, p: [r2(x.pos.x), r2(x.pos.y), r2(x.pos.z)], k: x.kills, dd: x.deaths,
  }));
  relay({ k: 'start', map: currentMap, mode, diff: difficulty, roster, ts: teamScore.slice() }, m.id);
  relay({ k: 'add', id: m.id, name: m.name, team });
}
function backToLobby() {
  NET.inGame = false;
  if (NET.isHost) netSend({ t: 'state', inGame: false });
  $('hud').hidden = true;
  if (NET.lobby) { renderLobby(); showLobby(); } else showMain();
}

// ---------- игровые сообщения ----------
function onGame(from, d, isAdmin) {
  if (!d || !d.k) return;
  if (d.k === 'adm') { if (isAdmin && NET.isHost && typeof adminApply === 'function') adminApply(d); return; }  // команда админа — только с правами от сервера
  if (d.k === 'start') { if (!NET.isHost) startOnline(d); return; }
  if (!NET.inGame) return;
  switch (d.k) {
    case 'st': {
      const e = entById(from); if (!e || e.isPlayer) return;
      e.net = d;
      const skinChanged = (d.ks && d.ks !== e.knifeSkin) || (d.kf && d.kf !== e.knifeFin);
      if (d.ks) e.knifeSkin = d.ks; if (d.kf) e.knifeFin = d.kf;
      const gsChanged = d.gs && d.gs !== e.gunSkin; if (gsChanged) e.gunSkin = d.gs;
      if (d.cs && d.cs !== e.charSkin) { e.charSkin = d.cs; rebuildCharMesh(e); }   // сменил скин огурца
      if (d.w && WEAPONS[d.w] && (d.w !== e.weapon || (d.w === 'knife' && skinChanged) || (d.w !== 'knife' && gsChanged))) { e.weapon = d.w; setGunModel(e, d.w); }
      break;
    }
    case 'bots': if (!NET.isHost) for (const b of d.b) { const e = entById(b[0]); if (e) { e.net = { x: b[1], y: b[2], z: b[3], yaw: b[4], pitch: b[5], vx: b[6], vz: b[7] }; const wk = WKEYS[b[8]]; if (wk && wk !== e.weapon) { e.weapon = wk; setGunModel(e, wk); } } } break;
    case 'spawn': {
      const e = entById(d.id); if (!e || e.isPlayer) return;
      e.alive = true; e.hp = 100; e.lastHurt = now; e.pos.set(d.x, d.y, d.z); e.yaw = d.yaw;
      e.net = { x: d.x, y: d.y, z: d.z, yaw: d.yaw, pitch: 0 };
      e.mesh.visible = e.tag.visible = true;
      break;
    }
    case 'shot': {
      const e = entById(d.id); if (!e || e.isPlayer) return;
      const m = new THREE.Vector3(...d.m);
      for (const p of d.pts) { const v = new THREE.Vector3(...p); addTracer(m, v); burst(v, 0x9b7a4c, 3, 2.5, .3); }
      e.flashT = .05; e.gunKick = 1;
      sfx(d.w, Math.max(0, 1 - e.pos.distanceTo(player.pos) / 70) * .6);
      break;
    }
    case 'hit': {
      if (!NET.isHost) return;
      const by = entById(from), v = entById(d.v);
      if (!by || !v || !by.alive || !v.alive || !isEnemy(by, v)) return;
      if (WEAPONS[d.w]) by.weapon = d.w;
      const w = WEAPONS[by.weapon];
      const dmg = Math.min(+d.dmg || 0, w.dmg * w.head);
      damage(v, dmg, by, !!d.h, new THREE.Vector3(d.dx || 0, 0, d.dz || 0));
      break;
    }
    case 'hp': {
      if (d.hp < player.hp) { hurtFlash = Math.min(1, hurtFlash + (player.hp - d.hp) / 45); player.lastHurt = now; }
      player.hp = d.hp;
      break;
    }
    case 'kill': {
      if (NET.isHost) return;
      const v = entById(d.v), by = d.by ? entById(d.by) : null;
      if (v && v.alive) kill(v, by, d.h, new THREE.Vector3(d.dx || 0, 0, d.dz || 0), true);
      break;
    }
    case 'jar': {
      const e = entById(d.id); if (!e || e.isPlayer) return;
      launchJar(e, new THREE.Vector3(...d.p), new THREE.Vector3(...d.v));
      break;
    }
    case 'score': {
      if (NET.isHost) return;
      for (const [id, k, dd] of d.e) { const e = entById(id); if (e) { e.kills = k; e.deaths = dd; } }
      teamScore[0] = d.ts[0]; teamScore[1] = d.ts[1];
      if (mode === 'koth' && d.p) {
        const [pr, ow] = d.p;
        if (ow !== point.owner) { point.owner = ow; announce(ow >= 0 ? `${TEAMS[ow].name} захватил банку!` : 'Банка снова ничья', ow >= 0 ? TEAMS[ow].css : '#eef4c4'); }
        point.prog = pr; paintPoint();
      }
      break;
    }
    case 'end': {
      if (NET.isHost) return;
      if (d.t != null) endGameTeam(d.t); else { const w = entById(d.w); if (w) endGame(w); }
      break;
    }
    case 'pick': remotePick(d.id, from); break;
    case 'swing': { const e = entById(d.id); if (e && !e.isPlayer) { e.gunKick = d.h ? 1.6 : 1.2; whoosh(Math.max(0, 1 - e.pos.distanceTo(player.pos) / 30)); } break; }
    case 'rocket': {
      const e = entById(d.id); if (!e || e.isPlayer) return;
      launchRocket(e, new THREE.Vector3(...d.p), new THREE.Vector3(...d.v)); e.flashT = .08; e.gunKick = 1.6;
      sfx('boom', Math.max(0, 1 - e.pos.distanceTo(player.pos) / 70) * .35);
      break;
    }
    case 'add': {
      if (entById(d.id)) return;
      const e = makeEnt(d.name, false, ents.length, d.team); e.id = d.id; e.kind = 'remote';
      e.alive = false; e.mesh.visible = e.tag.visible = false;
      announce(`${d.name} присоединился`, '#eef4c4');
      break;
    }
  }
}

// ---------- отправка своего состояния ----------
function netTick(dt) {
  NET.tSt -= dt; NET.tBots -= dt; NET.tScore -= dt;
  if (NET.tSt <= 0 && player.alive) {
    NET.tSt = .05;
    relay({ k: 'st', x: r2(player.pos.x), y: r2(player.pos.y), z: r2(player.pos.z), yaw: r2(player.yaw), pitch: r2(player.pitch), w: player.weapon, ks: knifeSkin, kf: knifeFinOf(knifeSkin), cs: charSkin, gs: player.weapon === 'knife' ? undefined : gunSkinOf(player.weapon), vx: r2(player.vel.x), vz: r2(player.vel.z) });
  }
  if (!NET.isHost) return;
  if (NET.tBots <= 0) {
    NET.tBots = .066;
    const b = ents.filter(e => e.kind === 'bot' && e.alive).map(e => [e.id, r2(e.pos.x), r2(e.pos.y), r2(e.pos.z), r2(e.yaw), r2(e.pitch), r2(e.vel.x), r2(e.vel.z), WKEYS.indexOf(e.weapon)]);
    if (b.length) relay({ k: 'bots', b });
  }
  if (NET.tScore <= 0) {
    NET.tScore = .25;
    relay({ k: 'score', e: ents.map(e => [e.id, e.kills, e.deaths]), ts: teamScore.map(x => Math.round(x * 10) / 10), p: [r2(point.prog), point.owner] });
  }
}

// ---------- чужие огурцы: плавно догоняем присланное положение ----------
function updateRemote(e, dt) {
  const n = e.net;
  if (n) {
    const dx = n.x - e.pos.x, dz = n.z - e.pos.z;
    if (dx * dx + dz * dz > 36) e.pos.set(n.x, n.y, n.z);
    const k = Math.min(1, dt * 14);
    e.pos.x += (n.x - e.pos.x) * k; e.pos.y += (n.y - e.pos.y) * k; e.pos.z += (n.z - e.pos.z) * k;
    e.yaw += angleDiff(e.yaw, n.yaw) * k; e.pitch += (n.pitch - e.pitch) * k;
    e.vel.set(n.vx || 0, 0, n.vz || 0);
  }
  drawEnt(e, dt);
}

// онлайн-блок есть только когда игра открыта через сервер
if (!/^https?:$/.test(location.protocol)) { $('onlineBox').hidden = true; }

// ---------- публичные серверы ----------
// карта берётся от сервера: новый матч в пустой комнате — текущая карта, следующий матч — следующая по кругу
function publicStart(next) {
  const L = NET.lobby, st = L.settings, i = Math.max(0, st.maps.indexOf(L.curMap));
  const map = st.maps[(i + (next ? 1 : 0)) % st.maps.length];
  hostStart({ map, mode: st.mode, diff: st.diff == null ? 1 : st.diff, bots: Math.max(0, (st.fill || 6) - L.players.length) });
}
// хост ушёл, и хостом стали мы: берём на себя ботов, здоровье игроков и продолжение матчей
function becomeHost() {
  for (const e of ents) {
    if (e.kind === 'bot') { if (!e.alive) e.respawn = 1.5; e.ai.wp = null; e.ai.target = null; e.net = null; }
    if (e.kind === 'remote') e.hp = e.alive ? 100 : 0;
  }
  announce('Хост вышел — теперь матч ведёшь ты', '#eef4c4');
  if (gameOver) setTimeout(() => { if (NET.isHost && NET.lobby) publicStart(true); }, 3000);
}
function renderRooms(rooms) {
  const box = $('pubRooms'); if (!box) return;
  box.textContent = '';
  for (const r of rooms) {
    const row = document.createElement('div'); row.className = 'pubRow';
    const info = document.createElement('div'); info.className = 'pubInfo';
    const nm = document.createElement('b'); nm.textContent = r.name;
    const sub = document.createElement('small'); sub.textContent = `${MODES[r.mode] ? MODES[r.mode].name : r.mode} · ${MAPS[r.map] ? MAPS[r.map].name : ''}`;
    if (r.custom) { const own = document.createElement('span'); own.className = 'own'; own.textContent = 'от игрока'; nm.append(own); }
    info.append(nm, sub);
    const cnt = document.createElement('span'); cnt.className = 'pubCnt'; cnt.textContent = `${r.players} / ${r.max}`;
    const full = r.players >= r.max;
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ghost';
    btn.textContent = full ? 'Полный' : 'Играть'; btn.disabled = full;
    btn.addEventListener('click', () => joinPublic(r.code));
    row.append(info, cnt, btn); box.append(row);
  }
}
$('createServer').addEventListener('click', async () => {
  netMsg('Создаём сервер…');
  try {
    await netConnect();
    netSend({ t: 'create', public: true, name: myName(), srvName: $('srvName').value.trim(), settings: { mode: $('srvMode').value, map: $('srvMap').value } });
    netMsg('');
  } catch (e) { netMsg(e.message); }
});
async function joinPublic(code) {
  netMsg('Подключаемся…');
  try { await netConnect(); netSend({ t: 'join', name: myName(), code }); }
  catch (e) { netMsg(e.message); }
}
function requestRooms() {
  if (NET.lobby || $('menu').hidden) return;
  if (NET.ws && NET.ws.readyState === 1) netSend({ t: 'list' });
  else netConnect().then(() => netSend({ t: 'list' })).catch(() => { if (NET.ws && NET.ws.readyState < 2) return; $('pubRooms').textContent = REGIONS.length > 1 ? 'Этот сервер сейчас недоступен — выбери другой.' : 'Список серверов недоступен — игра открыта без сервера.'; });
}
if (/^https?:$/.test(location.protocol)) {
  renderRegions(); requestRooms(); setInterval(requestRooms, 4000);
  if (REGIONS.length > 1) { pingRegions(); setInterval(() => { if (!NET.lobby && !$('menu').hidden && !$('pane-online').hidden) pingRegions(); }, 30000); }
  setInterval(() => { const box = $('regionPick'); if (box && [...box.children].some(b => b.disabled !== !!NET.lobby)) renderRegions(); }, 1000);
}

bootGame();
