// ================= Огуречные Шокеры — режим «Нашествие» =================
// Кооператив: все игроки в одной команде против волн огурцов-захватчиков.
// Волна за волной врагов больше и они крепче, каждая пятая — с боссом, Огурцом-мутантом.
// Погибшие ждут передышки между волнами; если нарезали всех — грядку захватили.
// Волнами управляет хост (или сам игрок, если играет один), остальным он рассылает состояние.

MODES.horde = {
  name: 'Нашествие', teams: true, goal: 0, coop: true,
  hint: 'Кооператив: вы против волн огурцов-захватчиков. Каждая волна сильнее, каждая пятая — с боссом. Погибшие возвращаются в передышке между волнами.',
};
const HORDE_POOL = 16;                       // сколько захватчиков заготовлено на матч
const HORDE_BREAK = 10, HORDE_FIRST = 6;     // секунды передышки
const HORDE_NAMES = ['Гнилушка', 'Переросток', 'Плесень', 'Желтяк', 'Кислятина', 'Вялый', 'Горчак', 'Пустоцвет'];
const HORDE = { st: 'break', wave: 0, t: HORDE_FIRST, left: 0, boss: null, bhp: 0, bmax: 1, sync: 0 };
let hordeBest = 0;
try { hordeBest = +localStorage.getItem('ogurcy-horde-best') || 0; } catch (e) {}

const hordeHumans = () => ents.filter(e => e.isPlayer || e.kind === 'remote');
const hordeInvaders = () => ents.filter(e => e.kind === 'bot');
const hordeName = i => HORDE_NAMES[i % HORDE_NAMES.length] + (i >= HORDE_NAMES.length ? ' ' + (Math.floor(i / HORDE_NAMES.length) + 1) : '');

// начало матча: захватчики стоят в запасе и ждут первой волны
function hordeStart() {
  Object.assign(HORDE, { st: 'break', wave: 0, t: HORDE_FIRST, left: 0, boss: null, bhp: 0, bmax: 1, sync: 0 });
  for (const e of hordeInvaders()) { e.alive = false; e.respawn = Infinity; if (e.mesh) { e.mesh.visible = false; e.tag.visible = false; } hordeUnboss(e); }
  announce('Нашествие! Первая волна через ' + HORDE_FIRST + ' с', '#ff9a7a');
  hordeBar();
}

// ---------- босс ----------
function hordeMakeBoss(e) {
  e.boss = true; e.scale = 2.3; e.speedMul = .72; e.dmgBoost = 1.6;
  hordeRename(e, 'Огурец-мутант', 0xff5236);
  if (e.mesh) {
    e.mesh.scale.setScalar(2.3);
    const b = e.mesh.userData.body;
    if (b && !b.userData.bossTint) { b.userData.origMat = b.material; b.material = b.material.clone(); b.material.emissive = new THREE.Color(0x5a0a00); b.material.emissiveIntensity = .9; b.userData.bossTint = true; }
  }
}
// у босса своё имя и красная табличка; после волны возвращаем обычное
function hordeRename(e, name, color) {
  if (e.baseName === undefined) e.baseName = e.name;
  e.name = name;
  if (e.tag && typeof makeTag === 'function') { const vis = e.tag.visible; scene.remove(e.tag); e.tag = makeTag(name, color); e.tag.visible = vis; scene.add(e.tag); }
}
function hordeUnboss(e) {
  if (!e.boss && e.scale === undefined) return;
  if (e.baseName !== undefined && e.name !== e.baseName) hordeRename(e, e.baseName, e.color);
  e.boss = false; e.scale = 1; e.speedMul = 1; e.dmgBoost = 1;
  if (e.mesh) {
    e.mesh.scale.setScalar(1);
    const b = e.mesh.userData.body;
    if (b && b.userData.bossTint) { b.material = b.userData.origMat; b.userData.bossTint = false; }   // снимаем красное свечение
  }
}

// ---------- волны (хост) ----------
function hordeStartWave(n) {
  const humans = Math.max(1, hordeHumans().length);
  const count = Math.min(HORDE_POOL, 3 + n * 2 + (humans - 1) * 2);
  const bossWave = n % 5 === 0;
  const hpMul = 1 + (n - 1) * .12, dmg = 1 + (n - 1) * .06;
  HORDE.st = 'wave'; HORDE.wave = n; HORDE.boss = null;
  const pool = hordeInvaders();
  pool.forEach(hordeUnboss);
  for (let i = 0; i < count && i < pool.length; i++) {
    const e = pool[i];
    spawn(e); e.hp = Math.round(100 * hpMul); e.dmgBoost = dmg; e.respawn = Infinity;
    if (bossWave && i === 0) {
      hordeMakeBoss(e);
      e.hp = e.hpMax = 1200 + 600 * (humans - 1) + n * 60;
      HORDE.boss = e.id; HORDE.bmax = e.hp;
      if (typeof setGunModel === 'function') { e.weapon = 'shotgun'; e.pref = 'shotgun'; setGunModel(e, 'shotgun'); }
    }
  }
  HORDE.left = count;
  hordeAutoRespawn();   // хост тоже возвращается в бой, если так и не нажал «Играть»
  announce(bossWave ? `Волна ${n} · БОСС: Огурец-мутант!` : `Волна ${n}`, bossWave ? '#ff5236' : '#ff9a7a');
  if (bossWave && typeof fanfare === 'function') fanfare();
  hordeRelay(true);
}
function hordeWaveCleared() {
  HORDE.st = 'break'; HORDE.t = HORDE_BREAK; HORDE.boss = null;
  hordeRelay(true);
  hordeOnBreak();
}
// передышка у каждого своя: патроны, возрождение, монеты
function hordeOnBreak() {
  if (HORDE.wave > 0) {
    if (typeof addCoins === 'function') addCoins(25, 'за волну');
    if (HORDE.wave > hordeBest) { hordeBest = HORDE.wave; try { localStorage.setItem('ogurcy-horde-best', hordeBest); } catch (e) {} }
    announce(`Волна ${HORDE.wave} отбита! Передышка ${HORDE_BREAK} с`, '#c6f04a');
  }
  if (player && player.alive) { for (const k of Object.keys(player.reserve)) if (WEAPONS[k] && isFinite(WEAPONS[k].max)) player.reserve[k] = WEAPONS[k].max; player.jars = Math.max(player.jars, 2); player.hp = Math.max(player.hp, 100); }
  if (player && !player.alive) player.respawn = 0;   // можно вернуться в бой
}
function hordeOver() {
  if (gameOver) return;
  if (NET.inGame && NET.isHost) relay({ k: 'horde', st: 'over', w: HORDE.wave });
  hordeShowOver();
}
function hordeShowOver() {
  gameOver = true; mouseDown = false; scoped = false;
  HORDE.st = 'over';
  if (document.exitPointerLock) document.exitPointerLock();
  const survived = Math.max(0, HORDE.wave - 1);
  if (survived > hordeBest) { hordeBest = survived; try { localStorage.setItem('ogurcy-horde-best', hordeBest); } catch (e) {} }
  renderBoard(); $('board').style.display = 'block';
  showCenter('Грядку захватили!', `Отбито волн: ${survived} · рекорд: ${hordeBest}`);
  if (typeof caseOnMatchEnd === 'function') caseOnMatchEnd(false);
  hordeBar();
  finishMatch();
}

// ---------- каждый кадр ----------
function hordeTick(dt) {
  if (mode !== 'horde' || !running || gameOver) return;
  if (HORDE.st === 'break') HORDE.t = Math.max(0, HORDE.t - dt);
  if (!authority()) { hordeBar(); return; }
  if (HORDE.st === 'break' && HORDE.t <= 0) hordeStartWave(HORDE.wave + 1);
  else if (HORDE.st === 'wave') {
    const inv = hordeInvaders().filter(e => e.alive);
    HORDE.left = inv.length;
    const boss = HORDE.boss ? entById(HORDE.boss) : null;
    HORDE.bhp = boss && boss.alive ? Math.max(0, boss.hp) : 0;
    if (!inv.length) hordeWaveCleared();
    else if (!hordeHumans().some(e => e.alive)) hordeOver();   // нарезали всех — конец
  }
  HORDE.sync -= dt; if (HORDE.sync <= 0) hordeRelay(false);
  hordeBar();
}
function hordeRelay(now) {
  HORDE.sync = .4;
  if (!NET.inGame || !NET.isHost) return;
  relay({ k: 'horde', st: HORDE.st, w: HORDE.wave, t: Math.round(HORDE.t * 10) / 10, left: HORDE.left, boss: HORDE.boss, bhp: Math.round(HORDE.bhp), bmax: HORDE.bmax });
}
// у остальных игроков: применяем то, что прислал хост
function hordeApply(d) {
  if (d.st === 'over') { HORDE.wave = d.w; hordeShowOver(); return; }
  const was = HORDE.st;
  HORDE.st = d.st; HORDE.wave = d.w; HORDE.t = d.t; HORDE.left = d.left; HORDE.bhp = d.bhp; HORDE.bmax = d.bmax || 1;
  if (HORDE.boss !== d.boss) {
    for (const e of hordeInvaders()) if (e.id !== d.boss) hordeUnboss(e);
    const b = d.boss ? entById(d.boss) : null; if (b) hordeMakeBoss(b);
    HORDE.boss = d.boss;
  }
  if (was === 'wave' && d.st === 'break') hordeOnBreak();
  if (was === 'break' && d.st === 'wave') {
    announce(d.boss ? `Волна ${d.w} · БОСС: Огурец-мутант!` : `Волна ${d.w}`, d.boss ? '#ff5236' : '#ff9a7a');
    hordeAutoRespawn();
  }
  hordeBar();
}
// волна пошла, а ты так и не нажал «Играть» — возвращаем сами
function hordeAutoRespawn() {
  if (!player || player.alive || gameOver) return;
  spawn(player); hideCenter();
  const lo = document.getElementById('loadout'); if (lo) lo.hidden = true;
}

// ---------- ИИ захватчиков: идут прямо к ближайшему игроку ----------
function hordeWaypoint(e) {
  let best = null, bd = Infinity;
  for (const h of hordeHumans()) { if (!h.alive) continue; const d = h.pos.distanceTo(e.pos); if (d < bd) { bd = d; best = h; } }
  if (!best) return spawnPoint();
  return new THREE.Vector3(best.pos.x + (Math.random() - .5) * 6, 0, best.pos.z + (Math.random() - .5) * 6);
}

// ---------- счёт наверху и полоска босса ----------
function hordeScoreHTML() {
  const st = HORDE.st === 'wave'
    ? `<span class="tag">волна</span> <b>${HORDE.wave}</b> <span class="tag">· захватчиков: ${HORDE.left}</span>`
    : HORDE.st === 'over' ? `<span class="tag">отбито волн</span> <b>${Math.max(0, HORDE.wave - 1)}</b>`
    : `<span class="tag">передышка · волна ${HORDE.wave + 1} через</span> <b>${Math.ceil(HORDE.t)}</b>`;
  return `<div>${st}</div><div class="tag">рекорд: ${hordeBest} · каждая пятая волна — с боссом</div>`;
}
function hordeBar() {
  const bar = document.getElementById('bossBar'); if (!bar) return;
  const on = mode === 'horde' && HORDE.st === 'wave' && HORDE.boss && HORDE.bhp > 0;
  bar.hidden = !on;
  if (on) bar.querySelector('i').style.width = Math.max(0, Math.min(100, HORDE.bhp / HORDE.bmax * 100)) + '%';
}
// босса нарезали — всем награда
function hordeBossDown() {
  if (typeof addCoins === 'function') addCoins(150, 'за босса');
  announce('Огурец-мутант нарезан!', '#ffd24a');
  if (typeof fanfare === 'function') fanfare();
}
