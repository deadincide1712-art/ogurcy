// ================= Огуречные Шокеры — режимы игры =================
const MODES = {
  ffa:  { name: 'Каждый сам за себя', teams: false, goal: 20, hint: 'Все против всех. Первый, кто нарежет 20 огурцов, забирает грядку.' },
  tdm:  { name: 'Командный бой', teams: true, goal: 40, hint: 'Укроп против Чеснока, 4 на 4. Команда, первой набравшая 40 нарезок, побеждает.' },
  koth: { name: 'Захват точки', teams: true, goal: 100, hint: 'Захвати банку в центре грядки и удерживай её. Каждая секунда владения — очко, до 100.' },
};
const TEAMS = [
  { name: 'Укроп', color: 0xc6f04a, css: '#c6f04a', side: 1 },
  { name: 'Чеснок', color: 0xc79bff, css: '#c79bff', side: -1 },
];
let mode = 'ffa';          // режим текущего матча (заставка в меню — всегда ffa)
let menuMode = 'ffa';      // что выбрано в меню
const teamScore = [0, 0];
const isTeamMode = () => MODES[mode].teams;
const isEnemy = (a, b) => a !== b && (!isTeamMode() || a.team !== b.team);

// ---------- точка захвата: огромная крышка от банки в центре ----------
const ZONE_R = 7;
const point = { prog: 0, owner: -1, inZone: [0, 0] };
const pointG = new THREE.Group(); pointG.visible = false; scene.add(pointG);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false });
const ring = new THREE.Mesh(new THREE.RingGeometry(ZONE_R - .35, ZONE_R, 72), ringMat);
ring.rotation.x = -Math.PI / 2; ring.position.y = .05; pointG.add(ring);
const progMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .75, side: THREE.DoubleSide, depthWrite: false });
const progRing = new THREE.Mesh(new THREE.RingGeometry(ZONE_R - .9, ZONE_R - .45, 72, 1, 0, .01), progMat);
progRing.rotation.x = -Math.PI / 2; progRing.position.y = .06; pointG.add(progRing);
const floorMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .12, depthWrite: false });
const zoneFloor = new THREE.Mesh(new THREE.CircleGeometry(ZONE_R - .35, 72), floorMat);
zoneFloor.rotation.x = -Math.PI / 2; zoneFloor.position.y = .04; pointG.add(zoneFloor);
const beamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .1, side: THREE.DoubleSide, depthWrite: false, fog: false });
const beam = new THREE.Mesh(new THREE.CylinderGeometry(ZONE_R, ZONE_R, 7, 72, 1, true), beamMat);
beam.position.y = 3.5; pointG.add(beam);
// флагшток на вершине крепости из ящиков
const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 3.4, 10), new THREE.MeshStandardMaterial({ color: 0xb8c0c4, metalness: .8, roughness: .3 }));
pole.position.set(0, 5.7, 0); pole.castShadow = true; pointG.add(pole);
const flagMat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: .8 });
const flagGeo = new THREE.PlaneGeometry(1.6, 1, 12, 1); flagGeo.translate(.8, 0, 0);
const flag = new THREE.Mesh(flagGeo, flagMat); flag.position.set(.06, 4 + 2.8, 0); flag.castShadow = true; pointG.add(flag);
const flagBase = flagGeo.attributes.position.array.slice();
const cap = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .18, 24), lidMat); cap.position.set(0, 7.45, 0); pointG.add(cap);
// флаг ставится на вершину центрального укрытия текущей карты
function placePointFlag(y) { pole.position.y = y + 1.7; flag.position.y = y + 2.8; cap.position.y = y + 3.45; }

// ---------- свои и чужие ----------
const ALLY = 0x5fd8ff, FOE = 0xff5a4a;
const ALLY_CSS = '#5fd8ff', FOE_CSS = '#ff5a4a';
function applyRelationLook(e) {
  if (!isTeamMode() || e.isPlayer || !player) return;
  const ally = e.team === player.team, col = ally ? ALLY : FOE;
  const body = e.mesh.userData.body;
  // контур: чуть увеличенная копия тела, вывернутая наизнанку
  const ol = new THREE.Mesh(body.geometry, new THREE.MeshBasicMaterial({ color: col, side: THREE.BackSide }));
  ol.position.copy(body.position); ol.scale.set(1.1, 1.05, 1.1); e.mesh.add(ol);
  if (ally) {
    // полупрозрачный силуэт союзника виден даже сквозь стены
    const xr = new THREE.Mesh(body.geometry, new THREE.MeshBasicMaterial({ color: ALLY, transparent: true, opacity: .22, depthTest: false, depthWrite: false }));
    xr.position.copy(body.position); xr.renderOrder = 9; e.mesh.add(xr);
    const mk = new THREE.Mesh(new THREE.OctahedronGeometry(.17), new THREE.MeshBasicMaterial({ color: ALLY, depthTest: false, transparent: true }));
    mk.scale.y = 1.5; mk.position.y = 3.05; mk.renderOrder = 11; e.mesh.add(mk); e.mesh.userData.marker = mk;
  }
  scene.remove(e.tag);
  e.tag = makeTag((ally ? 'свой · ' : '') + e.name, col);
  if (ally) { e.tag.material.depthTest = false; e.tag.renderOrder = 10; }
  scene.add(e.tag);
}
// на кого смотрит прицел: союзник, враг или никто
const _ao = new THREE.Vector3(), _ad = new THREE.Vector3();
function aimRelation() {
  if (!player || !player.alive) return '';
  eyeOf(player, _ao); dirOf(player.yaw, player.pitch, _ad);
  let t = rayWorld(_ao, _ad, 150), hit = null;
  for (const v of ents) { if (v === player || !v.alive) continue; const tc = rayCyl(_ao, _ad, v.pos, RADIUS, HEIGHT); if (tc < t) { t = tc; hit = v; } }
  if (!hit) return '';
  return isEnemy(player, hit) ? 'foe' : 'ally';
}

function inZone(e) { return e.alive && Math.hypot(e.pos.x, e.pos.z) < ZONE_R && e.pos.y < 6; }
function zoneWaypoint() { const a = Math.random() * Math.PI * 2, r = 3.2 + Math.random() * 3; return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r); }

function resetMode() {
  teamScore[0] = teamScore[1] = 0;
  point.prog = 0; point.owner = -1; point.inZone = [0, 0];
  pointG.visible = mode === 'koth';
  resetPickups(); clearRockets();
  paintPoint();
}
function paintPoint() {
  const col = point.owner >= 0 ? TEAMS[point.owner].color : 0xffffff;
  ringMat.color.set(col); floorMat.color.set(col); beamMat.color.set(col); flagMat.color.set(col);
  const pc = point.prog >= 0 ? TEAMS[0].color : TEAMS[1].color;
  progMat.color.set(pc);
  progRing.geometry.dispose();
  progRing.geometry = new THREE.RingGeometry(ZONE_R - .9, ZONE_R - .45, 72, 1, Math.PI / 2, Math.max(.01, Math.abs(point.prog) * Math.PI * 2));
}

function updatePoint(dt) {
  if (mode !== 'koth') return;
  const c = [0, 0];
  for (const e of ents) if (e.team != null && inZone(e)) c[e.team]++;
  point.inZone = c;
  if (!authority()) { waveFlag(c); return; }
  const before = point.owner, prevProg = point.prog;
  const rate = n => .2 * (1 + .35 * (Math.min(n, 3) - 1));
  if (c[0] > 0 && c[1] === 0) point.prog = Math.min(1, point.prog + rate(c[0]) * dt);
  else if (c[1] > 0 && c[0] === 0) point.prog = Math.max(-1, point.prog - rate(c[1]) * dt);
  else if (c[0] === 0 && c[1] === 0 && point.owner < 0) point.prog *= Math.pow(.7, dt); // ничья точка остывает
  if (point.prog >= 1) point.owner = 0;
  else if (point.prog <= -1) point.owner = 1;
  else if ((point.owner === 0 && point.prog <= 0) || (point.owner === 1 && point.prog >= 0)) point.owner = -1;
  if (point.owner !== before) {
    if (point.owner >= 0) announce(`${TEAMS[point.owner].name} захватил банку!`, TEAMS[point.owner].css);
    else announce('Банка снова ничья', '#eef4c4');
  }
  if (point.owner !== before || Math.abs(point.prog - prevProg) > .002) paintPoint();
  if (point.owner >= 0) {
    teamScore[point.owner] += dt;
    if (teamScore[point.owner] >= MODES.koth.goal) { teamScore[point.owner] = MODES.koth.goal; endGameTeam(point.owner); }
  }
  waveFlag(c);
}
function waveFlag(c) {
  const p = flag.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = flagBase[i * 3];
    p.array[i * 3 + 2] = Math.sin(x * 3 - now * 5) * .12 * x;
  }
  p.needsUpdate = true;
  beamMat.opacity = .08 + (c[0] && c[1] ? .06 * (1 + Math.sin(now * 10)) : 0);
}

function announce(text, color) {
  const s = $('streak'); s.textContent = text; s.style.color = color; s.style.opacity = 1; streakT = 2.2;
  const d = document.createElement('div'); d.innerHTML = `<span style="color:${color}">${text}</span>`;
  $('feed').prepend(d); setTimeout(() => d.remove(), 6000);
}

// ---------- счёт наверху экрана ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function teamName(t, me) { return `<span class="tname" style="color:${TEAMS[t].css}">${TEAMS[t].name}${me ? ' · ты' : ''}</span>`; }
function scoreHTML() {
  const M = MODES[mode];
  if (mode === 'gungame') {
    const lv = Math.min(player.level || 0, LADDER.length - 1), lead = ents.reduce((a, b) => (b.level || 0) > (a.level || 0) ? b : a);
    return `<span class="tag">ступень</span> <b>${(player.level || 0) + 1}</b> <span class="tag">/ ${LADDER.length} · ${esc(WEAPONS[LADDER[lv]].name)} · лидер</span> ${esc(lead.name)} (${(lead.level || 0) + 1})`;
  }
  if (!M.teams) {
    const lead = ents.reduce((a, b) => b.kills > a.kills ? b : a);
    return `<span class="tag">нарезано</span> <b>${player.kills}</b> <span class="tag">/ ${M.goal}</span> · <span class="tag">лидер</span> ${lead.kills ? `${esc(lead.name)} (${lead.kills})` : '—'}`;
  }
  const s0 = Math.floor(teamScore[0]), s1 = Math.floor(teamScore[1]);
  let html = `<div class="teams">${teamName(0, player.team === 0)} <b>${s0}</b><span class="tag">:</span><b>${s1}</b> ${teamName(1, player.team === 1)}</div>`;
  if (mode === 'tdm') return html + `<div class="tag">нарезок до победы: ${M.goal}</div>`;
  if (mode === 'seeds') return html + `<div class="tag">семечек до победы: ${M.goal}</div>`;
  const pct = Math.round(Math.abs(point.prog) * 100);
  const c = point.inZone, contested = c[0] && c[1];
  let st;
  if (contested) st = '<span style="color:#ff8f7a">Банку делят!</span>';
  else if (point.owner >= 0 && (point.owner === 0 ? c[1] : c[0])) st = `${TEAMS[point.owner === 0 ? 1 : 0].name} отбивает банку · ${pct}%`;
  else if (point.owner >= 0) st = `Банку держит ${TEAMS[point.owner].name}`;
  else if (pct > 0) st = `Захват: ${TEAMS[point.prog > 0 ? 0 : 1].name} ${pct}%`;
  else st = 'Банка ничья';
  html += `<div class="bars"><i style="width:${s0}%;background:${TEAMS[0].css}"></i></div><div class="bars rev"><i style="width:${s1}%;background:${TEAMS[1].css}"></i></div>`;
  return html + `<div class="pstat">${st}${inZone(player) ? ' · <b class="onpt">ты на точке</b>' : ''}</div>`;
}

// ================= новые режимы: гонка вооружений, сбор семечек, ножевой бой =================
Object.assign(MODES, {
  gungame: { name: 'Гонка вооружений', teams: false, goal: 7, hint: 'Каждая нарезка — следующий ствол: пистолет → шинковка → дробовик → автомат → снайперка → огурцомёт → нож. Побеждает тот, кто первым нарежет ножом. Удар ножом отбрасывает жертву на ступень назад.' },
  seeds:   { name: 'Сбор семечек', teams: true, goal: 30, hint: 'Нарезанный огурец роняет семечко. Подбери семечко врага — очко твоей команде. Подбери своё — очко врагу не засчитают. До 30 очков.' },
  knives:  { name: 'Ножевой бой', teams: false, goal: 15, hint: 'Только ножи! Бегаешь быстрее, удар в спину нарезает сразу. Первый, кто нарежет 15 огурцов, побеждает.' },
});
const LADDER = ['pistol', 'smg', 'shotgun', 'rifle', 'sniper', 'rocket', 'knife'];
// оружие, которое режим выдаёт сам (тогда выбора после смерти нет)
function modeWeaponFor(e) {
  if (mode === 'knives') return 'knife';
  if (mode === 'gungame') return LADDER[Math.min(e.level || 0, LADDER.length - 1)];
  return null;
}
function armForMode(e) {
  const w = modeWeaponFor(e); if (!w) return false;
  e.weapon = w; e.owned = w === 'knife' ? ['knife'] : [w, 'knife'];
  if (e.isPlayer) e.primary = w;
  e.ammo[w] = WEAPONS[w].mag; e.reserve[w] = Infinity; e.reloading = 0;   // в режимах с выданным оружием патроны не кончаются
  if (e.mesh) setGunModel(e, w);
  if (e === player && vmW) buildViewmodel();
  return true;
}
// гонка вооружений: ступень вверх за нарезку, вниз — если тебя нарезали ножом
function gunGameKill(by, v) {
  if (mode !== 'gungame') return;
  if (v && by && by !== v && by.weapon === 'knife' && (v.level || 0) > 0) v.level--;
  if (!by || by === v) return;
  by.level = (by.level || 0) + 1;
  if (by.level >= LADDER.length) return;              // победа — проверит kill()
  armForMode(by);
  if (by.isPlayer) announce(`Ступень ${by.level + 1}/${LADDER.length}: ${WEAPONS[LADDER[by.level]].name}`, '#ffe27a');
}

// ---------- сбор семечек ----------
function dropSeed(v, by) {
  if (mode !== 'seeds' || !by || by === v || by.team == null) return;
  const id = `seed:${v.id || v.name}:${v.deaths}`;
  if (pickups.some(p => p.id === id)) return;
  const pk = addPickup(id, 'seed', new THREE.Vector3(v.pos.x, Math.max(0, v.pos.y), v.pos.z), 20);
  pk.team = by.team;
  pk.mesh.children.forEach(c => { if (c.geometry && c.geometry.type === 'RingGeometry') c.material.color.set(TEAMS[by.team].color); });
}
function seedTaken(pk, picker) {
  if (!picker || picker.team == null) return;
  const mine = picker.team === pk.team;
  if (picker.isPlayer) announce(mine ? 'Семечко засчитано! +1' : 'Семечко перехвачено — очко врагу не достанется', mine ? TEAMS[pk.team].css : '#eef4c4');
  if (!knifeAuth() || !mine || gameOver) return;       // очки считает хост
  teamScore[pk.team]++;
  if (teamScore[pk.team] >= MODES.seeds.goal) endGameTeam(pk.team);
}
function nearestSeed(e, maxD = 35) {
  let best = null, bd = maxD;
  for (const pk of pickups) { if (!pk.active || pk.type !== 'seed') continue; const d = Math.hypot(pk.pos.x - e.pos.x, pk.pos.z - e.pos.z); if (d < bd) { bd = d; best = pk; } }
  return best;
}
