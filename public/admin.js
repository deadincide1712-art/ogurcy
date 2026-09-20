// ================= Огуречные Шокеры — служебная панель (читы для админа) =================
// Пароля здесь нет вообще: на сайте его проверяет сервер (переменная ADMIN_PASS), а браузер
// только отправляет введённое и ждёт ответа. Поэтому из кода страницы пароль не вытащить.
const ADMIN_HASH = '';   // локальная проверка — только для версии без сервера
const ADMIN = { on: false, wall: false, aim: false, god: false, hp: 500, server: false };

async function sha256hex(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function adminUnlock(pass) {
  const msg = document.getElementById('admMsg');
  pass = String(pass || '').trim();                       // лишние пробелы при вводе не мешают
  if (!pass) { if (msg) msg.textContent = 'Введи пароль.'; return; }
  // на сайте пароль проверяет сервер — в браузере его нет
  if (typeof netSend === 'function' && typeof netConnect === 'function' && /^https?:$/.test(location.protocol)) {
    if (msg) msg.textContent = 'Проверяем…';
    netConnect().then(() => netSend({ t: 'admin', pass }))
      .catch(() => { if (msg) msg.textContent = 'Сервер недоступен — попробуй ещё раз.'; });
    return;
  }
  // игра без сервера: сверяем отпечаток пароля прямо здесь
  let ok = false;
  try { ok = !!ADMIN_HASH && (await sha256hex(pass)) === ADMIN_HASH; } catch (e) { ok = false; }
  if (!ok) return adminFail('Пароль не подошёл.');
  adminGrant();
}
// права выданы: открываем панель
function adminGrant() {
  ADMIN.on = true;
  document.getElementById('admBox').hidden = false;
  document.getElementById('admLogin').hidden = true;
  const msg = document.getElementById('admMsg'); if (msg) msg.textContent = '';
  adminHud();
}
function adminFail(text) {
  const msg = document.getElementById('admMsg'); if (msg) msg.textContent = text || 'Пароль не подошёл.';
}
function adminSet(key, val) { ADMIN[key] = val; adminHud(); if (key === 'wall') adminWallClear(); }

// ---------- сквозь стены ----------
function adminWallClear() {
  for (const e of ents) if (e.mesh && e.mesh.userData.xray) { e.mesh.remove(e.mesh.userData.xray); e.mesh.userData.xray = null; }
}
function adminWallUpdate() {
  if (!ADMIN.on) return;
  for (const e of ents) {
    if (e.isPlayer || !e.mesh) continue;
    const want = ADMIN.wall && e.alive;
    const cur = e.mesh.userData.xray;
    if (want && !cur) {
      const body = e.mesh.userData.body;
      const col = (typeof isEnemy === 'function' && isEnemy(player, e)) ? 0xff5a4a : 0x5fd8ff;
      const x = new THREE.Mesh(body.geometry, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .45, depthTest: false, depthWrite: false }));
      x.position.copy(body.position); x.scale.set(1.04, 1.02, 1.04); x.renderOrder = 20;
      e.mesh.add(x); e.mesh.userData.xray = x;
    } else if (!want && cur) { e.mesh.remove(cur); e.mesh.userData.xray = null; }
  }
}

// ---------- аим ----------
// доводит прицел до ближайшего видимого соперника; чем ближе к центру экрана, тем важнее цель
function adminAimTarget() {
  if (!player || !player.alive) return null;
  const o = eyeOf(player, new THREE.Vector3()), d = dirOf(player.yaw, player.pitch, new THREE.Vector3());
  let best = null, bestScore = .55;
  for (const e of ents) {
    if (e === player || !e.alive || !isEnemy(player, e)) continue;
    const c = new THREE.Vector3(e.pos.x, e.pos.y + 1.15, e.pos.z), to = c.clone().sub(o), dist = to.length();
    if (dist > 140) continue;
    to.normalize();
    const dot = to.dot(d);
    if (dot < bestScore) continue;
    if (rayWorld(o, to, dist) < dist - .6) continue;      // за стеной — пропускаем
    bestScore = dot; best = { e, c };
  }
  return best;
}
function adminAim(dt) {
  if (!ADMIN.on || !ADMIN.aim || !player || !player.alive || paused) return;
  const t = adminAimTarget(); if (!t) return;
  const o = eyeOf(player, new THREE.Vector3()), to = t.c.clone().sub(o).normalize();
  const yaw = Math.atan2(-to.x, -to.z), pitch = Math.asin(THREE.MathUtils.clamp(to.y, -1, 1));
  const k = Math.min(1, dt * 14);
  player.yaw += Math.atan2(Math.sin(yaw - player.yaw), Math.cos(yaw - player.yaw)) * k;
  player.pitch += (pitch - player.pitch) * k;
}

// ---------- кнопки: обнулить соперника, подлечить своего ----------
function adminPickTarget(enemy) {
  const o = eyeOf(player, new THREE.Vector3()), d = dirOf(player.yaw, player.pitch, new THREE.Vector3());
  let best = null, bestScore = enemy ? .2 : .1;
  for (const e of ents) {
    if (e === player || !e.alive) continue;
    if (enemy !== isEnemy(player, e)) continue;
    const c = new THREE.Vector3(e.pos.x, e.pos.y + 1.15, e.pos.z).sub(o), dist = c.length();
    c.normalize();
    const dot = c.dot(d);
    if (dot > bestScore) { bestScore = dot; best = e; }
  }
  return best;
}
function adminKill() {
  if (!ADMIN.on || !player || !player.alive) return;
  const v = adminPickTarget(true);
  if (!v) return adminFlash('Наведись на соперника');
  if (typeof authority === 'function' && authority()) damage(v, 9999, player, false, dirOf(player.yaw, 0, new THREE.Vector3()));
  else relay({ k: 'adm', act: 'kill', id: v.id }, 'host');
  adminFlash(`${v.name} — в салат`);
}
function adminHeal() {
  if (!ADMIN.on || !player) return;
  const t = adminPickTarget(false) || player;
  const hp = Math.max(1, Math.min(9999, ADMIN.hp));
  if (t === player) { player.hp = hp; adminFlash(`Себе ${hp} свежести`); return; }
  if (typeof authority === 'function' && authority()) { t.hp = hp; if (NET.inGame && t.kind === 'remote') relay({ k: 'hp', hp: Math.round(hp) }, t.id); }
  else relay({ k: 'adm', act: 'heal', id: t.id, hp }, 'host');
  adminFlash(`${t.name}: ${hp} свежести`);
}
// хост выполняет команду админа — сервер подтверждает права флагом adm
function adminApply(d) {
  const t = typeof entById === 'function' ? entById(d.id) : null; if (!t) return;
  if (d.act === 'kill') damage(t, 9999, null, false, new THREE.Vector3());
  else if (d.act === 'heal') { t.hp = Math.max(1, Math.min(9999, d.hp || 100)); if (t.kind === 'remote') relay({ k: 'hp', hp: Math.round(t.hp) }, t.id); }
}

let admFlashT = 0;
function adminFlash(text) {
  const el = document.getElementById('admFlash'); if (!el) return;
  el.textContent = text; el.hidden = false; admFlashT = 1.6;
}
function adminHud() {
  const el = document.getElementById('admHud'); if (!el) return;
  el.hidden = !ADMIN.on;
  if (!ADMIN.on) return;
  el.textContent = `АДМИН · стены ${ADMIN.wall ? 'вкл' : 'выкл'} [V] · аим ${ADMIN.aim ? 'вкл' : 'выкл'} [B] · неуязвимость ${ADMIN.god ? 'вкл' : 'выкл'} [N] · K — обнулить · H — вылечить`;
}
function adminTick(dt) {
  adminWallUpdate();
  adminAim(dt);
  if (admFlashT > 0) { admFlashT -= dt; if (admFlashT <= 0) { const el = document.getElementById('admFlash'); if (el) el.hidden = true; } }
}

// ---------- горячие клавиши и меню ----------
addEventListener('keydown', e => {
  if (!ADMIN.on || !running || e.repeat) return;
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
  const k = e.code;
  if (k === 'KeyV') { ADMIN.wall = !ADMIN.wall; adminSet('wall', ADMIN.wall); }
  else if (k === 'KeyB') adminSet('aim', !ADMIN.aim);
  else if (k === 'KeyN') adminSet('god', !ADMIN.god);
  else if (k === 'KeyK') adminKill();
  else if (k === 'KeyH') adminHeal();
});
addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('admLogin');
  const inp = document.getElementById('admPass');
  const go = document.getElementById('admGo');
  if (go && inp) {
    go.addEventListener('click', () => adminUnlock(inp.value));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') adminUnlock(inp.value); });
  }
  for (const [id, key] of [['admWall', 'wall'], ['admAim', 'aim'], ['admGod', 'god']]) {
    const c = document.getElementById(id); if (c) c.addEventListener('change', () => adminSet(key, c.checked));
  }
  const hp = document.getElementById('admHp');
  if (hp) hp.addEventListener('input', () => { ADMIN.hp = +hp.value || 100; });
  const kb = document.getElementById('admKill'), hb = document.getElementById('admHeal');
  if (kb) kb.addEventListener('click', adminKill);
  if (hb) hb.addEventListener('click', adminHeal);
});
