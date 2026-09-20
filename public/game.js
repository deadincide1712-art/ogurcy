// ================= Огуречные Шокеры — игра =================
const GOAL = 20, RADIUS = .45, HEIGHT = 1.85, EYE = 1.55, STEP = .45;
const WEAPONS = {
  rifle:   { name: 'Рассол-47', dmg: 20, head: 2, rate: .1, mag: 30, reload: 1.6, spread: .014, pellets: 1, range: 140, auto: true, kick: .012 },
  shotgun: { name: 'Укроп-12', dmg: 12, head: 1.5, rate: .8, mag: 6, reload: 2.1, spread: .075, pellets: 9, range: 45, auto: false, kick: .05 },
  sniper:  { name: 'Кабачок-М', dmg: 85, head: 2, rate: 1.2, mag: 5, reload: 2.4, spread: .06, pellets: 1, range: 250, auto: false, kick: .07, scope: true },
  smg:     { name: 'Шинковка-3000', dmg: 11, head: 1.8, rate: .062, mag: 40, reload: 1.5, spread: .032, pellets: 1, range: 70, auto: true, kick: .007 },
  rocket:  { name: 'Огурцомёт', dmg: 115, head: 1, rate: 1.1, mag: 1, reload: 2.3, spread: 0, pellets: 1, range: 200, auto: false, kick: .09, rocket: true, speed: 48, radius: 5.5 },
  knife:   { name: 'Нож', melee: true, dmg: 40, head: 2.5, rate: .42, mag: 1, reload: 0, spread: 0, pellets: 1, range: 2.6, auto: false, kick: .01 },
  pistol:  { name: 'Корнишон-9', dmg: 18, head: 2, rate: .17, mag: 12, reload: 1.1, spread: .012, pellets: 1, range: 90, auto: false, kick: .02 },
};
const WKEYS = ['rifle', 'shotgun', 'sniper', 'smg', 'rocket', 'pistol', 'knife'];
Object.assign(WEAPONS.rifle, { start: 150, max: 270 }); Object.assign(WEAPONS.shotgun, { start: 40, max: 64 }); Object.assign(WEAPONS.sniper, { start: 30, max: 45 });
Object.assign(WEAPONS.smg, { start: 200, max: 320 }); Object.assign(WEAPONS.rocket, { start: 5, max: 10 }); Object.assign(WEAPONS.pistol, { start: Infinity, max: Infinity }); Object.assign(WEAPONS.knife, { start: Infinity, max: Infinity });
const BOT_GUNS = ['rifle', 'smg', 'shotgun', 'rifle', 'sniper', 'smg', 'shotgun', 'rifle'];
const BOT_NAMES = ['Малосол', 'Корнишон', 'Пупырка', 'Засолка', 'Огурчелло', 'Хрустик', 'Зеленяш', 'Рассольник'];
const DIFF = [
  { react: .6, spread: .07, turn: 3, dmgMul: .6 },
  { react: .35, spread: .045, turn: 5, dmgMul: .85 },
  { react: .18, spread: .025, turn: 8, dmgMul: 1 },
];
const BANDS = [0xff5236, 0x3a8dff, 0xffd23a, 0xb45cff, 0xff8fc7, 0x31d6c4, 0xff9a2e, 0xffffff];

const $ = id => document.getElementById(id);
let difficulty = 1, running = false, paused = true, gameOver = false;
const ents = [];
let player;

// ---------- сущность ----------
function makeEnt(name, isPlayer, i, team) {
  const hue = isPlayer ? .27 : .2 + (i * .037) % .16;
  const e = {
    name, isPlayer, hue, team, id: null, kind: isPlayer ? 'local' : 'bot', color: team != null && isTeamMode() ? TEAMS[team].color : BANDS[i % BANDS.length],
    pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, pitch: 0,
    hp: 100, alive: false, respawn: 0, kills: 0, deaths: 0, streak: 0, lastHurt: 0,
    weapon: isPlayer ? 'rifle' : BOT_GUNS[i % BOT_GUNS.length], pref: isPlayer ? null : BOT_GUNS[i % BOT_GUNS.length],
    ammo: {}, reserve: {}, cool: 0, reloading: 0, jars: 2, onGround: false,
    ai: { wp: null, stuck: 0, target: null, seen: 0, strafe: 1, strafeT: 0, lastPos: new THREE.Vector3() },
  };
  giveLoadout(e);
  if (!isPlayer) {
    e.mesh = makeCucumber(hue, e.color, e.weapon); scene.add(e.mesh);
    e.tag = makeTag(name, e.color); scene.add(e.tag);
    applyRelationLook(e); // подсветка своих и чужих в командных режимах
  }
  ents.push(e); return e;
}
function makeTag(text, color) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.font = '600 30px Rubik, sans-serif'; g.textAlign = 'center';
  g.fillStyle = 'rgba(20,33,15,.7)'; const w = g.measureText(text).width + 30;
  g.beginPath(); g.roundRect ? g.roundRect(128 - w / 2, 8, w, 46, 20) : g.rect(128 - w / 2, 8, w, 46); g.fill();
  g.fillStyle = '#' + color.toString(16).padStart(6, '0'); g.fillText(text, 128, 42);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: true, transparent: true }));
  s.scale.set(2, .5, 1); return s;
}

function spawnPoint(who) {
  let best = null, bestD = -1;
  const side = who && who.team != null && isTeamMode() ? TEAMS[who.team].side : 0;
  for (let k = 0; k < 16; k++) {
    const p = side
      ? new THREE.Vector3((Math.random() * 2 - 1) * (ARENA - 4), 0, side * (ARENA - 4 - Math.random() * 9))
      : new THREE.Vector3((Math.random() * 2 - 1) * (ARENA - 3), 0, (Math.random() * 2 - 1) * (ARENA - 3));
    if (collidesAt(p)) continue;
    let d = 999; for (const o of ents) if (o.alive && (!who || isEnemy(who, o))) d = Math.min(d, o.pos.distanceTo(p));
    if (d > bestD) { bestD = d; best = p; }
  }
  return best || new THREE.Vector3(0, 0, ARENA - 5);
}
function collidesAt(p) {
  return boxes.some(b => p.x + RADIUS > b.min.x && p.x - RADIUS < b.max.x && p.z + RADIUS > b.min.z && p.z - RADIUS < b.max.z && b.max.y > .5);
}
function spawn(e) {
  e.pos.copy(spawnPoint(e)); e.vel.set(0, 0, 0);
  e.hp = 100; e.alive = true; e.jars = 2; e.reloading = 0; e.cool = .5; e.streak = 0;
  giveLoadout(e);
  e.yaw = Math.atan2(-e.pos.x, -e.pos.z) + Math.PI; e.pitch = 0;
  if (e.mesh) { e.mesh.visible = e.tag.visible = true; }
  e.ai.wp = null; e.ai.target = null;
  if (NET.inGame && (e.isPlayer || (e.kind === 'bot' && NET.isHost))) relay({ k: 'spawn', id: e.id, x: r2(e.pos.x), y: r2(e.pos.y), z: r2(e.pos.z), yaw: r2(e.yaw) });
}

// ---------- физика движения ----------
function moveEnt(e, wish, speed, dt, jump) {
  const accel = e.onGround ? 14 : 3;
  e.vel.x += (wish.x * speed - e.vel.x) * Math.min(1, accel * dt);
  e.vel.z += (wish.z * speed - e.vel.z) * Math.min(1, accel * dt);
  if (jump && e.onGround) { e.vel.y = 8.8; e.onGround = false; }
  e.vel.y -= GRAV * dt;
  // по осям: X, затем Z, затем Y
  for (const ax of ['x', 'z']) {
    e.pos[ax] += e.vel[ax] * dt;
    for (const b of boxes) {
      if (e.pos.y >= b.max.y - STEP || e.pos.y + HEIGHT <= b.min.y || b.min.y > e.pos.y + 1.2) continue; // высоко висящее — это потолок, не стена
      if (e.pos.x + RADIUS > b.min.x && e.pos.x - RADIUS < b.max.x && e.pos.z + RADIUS > b.min.z && e.pos.z - RADIUS < b.max.z) {
        e.pos[ax] = e.vel[ax] > 0 ? b.min[ax] - RADIUS - 1e-3 : b.max[ax] + RADIUS + 1e-3;
        e.vel[ax] = 0; e.ai.blocked = true;
      }
    }
  }
  e.pos.y += e.vel.y * dt;
  let floor = 0;
  for (const b of boxes) {
    if (e.pos.x + RADIUS * .8 > b.min.x && e.pos.x - RADIUS * .8 < b.max.x && e.pos.z + RADIUS * .8 > b.min.z && e.pos.z - RADIUS * .8 < b.max.z) {
      if (e.pos.y >= b.max.y - STEP - .01) floor = Math.max(floor, b.max.y);
      else if (e.vel.y > 0 && e.pos.y + HEIGHT > b.min.y && e.pos.y < b.min.y) { e.vel.y = 0; e.pos.y = Math.max(0, b.min.y - HEIGHT - .01); }
    }
  }
  e.onGround = false;
  if (e.pos.y <= floor) { e.pos.y = floor; e.vel.y = 0; e.onGround = true; }
  e.pos.x = THREE.MathUtils.clamp(e.pos.x, -ARENA + RADIUS, ARENA - RADIUS);
  e.pos.z = THREE.MathUtils.clamp(e.pos.z, -ARENA + RADIUS, ARENA - RADIUS);
}

// ---------- стрельба ----------
const _o = new THREE.Vector3(), _d = new THREE.Vector3();
function eyeOf(e, out) { return out.set(e.pos.x, e.pos.y + EYE, e.pos.z); }
function dirOf(yaw, pitch, out) { return out.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)); }

function fire(e, extraSpread) {
  const w = WEAPONS[e.weapon];
  if (w.melee) return meleeAttack(e, false);
  if (e.cool > 0 || e.reloading > 0 || !e.alive) return false;
  if (e.ammo[e.weapon] <= 0) { if (!startReload(e) && e.isPlayer) { sfx('click'); noAmmoHint(); e.cool = .3; } return false; }
  e.ammo[e.weapon]--; e.cool = w.rate;
  if (w.rocket) { fireRocket(e); if (e.ammo[e.weapon] === 0) startReload(e); return true; }
  const o = eyeOf(e, new THREE.Vector3());
  const base = dirOf(e.yaw, e.pitch, new THREE.Vector3());
  let spread = w.spread + extraSpread;
  if (e.isPlayer && w.scope && scoped) spread = .002;
  else if (e.isPlayer && ads > .5) spread *= .35;      // по мушке бьём заметно точнее
  const muzzle = e.isPlayer
    ? o.clone().add(base.clone().multiplyScalar(.9)).add(new THREE.Vector3(Math.cos(e.yaw) * .22, -.22, -Math.sin(e.yaw) * .22))
    : o.clone().add(base.clone().multiplyScalar(.8)).add(new THREE.Vector3(Math.cos(e.yaw) * .38, -.6, -Math.sin(e.yaw) * .38));
  const pts = [];
  for (let p = 0; p < w.pellets; p++) {
    const d = base.clone().add(new THREE.Vector3((Math.random() - .5) * 2 * spread, (Math.random() - .5) * 2 * spread, (Math.random() - .5) * 2 * spread)).normalize();
    let t = rayWorld(o, d, w.range), hitEnt = null;
    for (const v of ents) {
      if (v === e || !v.alive || !isEnemy(e, v)) continue;
      const tc = rayCyl(o, d, v.pos, RADIUS, HEIGHT);
      if (tc < t) { t = tc; hitEnt = v; }
    }
    const hp = o.clone().addScaledVector(d, t);
    if (p < 3) { addTracer(muzzle, hp); pts.push([r2(hp.x), r2(hp.y), r2(hp.z)]); }
    if (hitEnt) {
      const head = hp.y - hitEnt.pos.y > 1.3;
      let dmg = w.dmg * (head ? w.head : 1);
      if (!e.isPlayer) dmg *= DIFF[difficulty].dmgMul;
      if (authority()) damage(hitEnt, dmg, e, head, d);
      else if (e.isPlayer) { relay({ k: 'hit', v: hitEnt.id, dmg, h: head, w: e.weapon, dx: r2(d.x), dz: r2(d.z) }, 'host'); hitMarker(head); sfx('hit', .8); }
      burst(hp, 0xcfe38a, 5, 3, .4);
    } else if (t < w.range) burst(hp, 0x9b7a4c, 4, 2.5, .35);
  }
  if (NET.inGame && (e.isPlayer || e.kind === 'bot')) relay({ k: 'shot', id: e.id, w: e.weapon, m: [r2(muzzle.x), r2(muzzle.y), r2(muzzle.z)], pts });
  const dist = e.isPlayer ? 0 : e.pos.distanceTo(player.pos);
  sfx(e.weapon, e.isPlayer ? 1 : Math.max(0, 1 - dist / 70) * .6);
  if (e.isPlayer) { recoil += w.kick; e.pitch = Math.min(1.5, e.pitch + w.kick * .6); flash = .05; vmKick(e.weapon); }
  else { e.flashT = .05; e.gunKick = 1; }
  if (e.ammo[e.weapon] === 0) startReload(e);
  return true;
}
function startReload(e) {
  const w = WEAPONS[e.weapon];
  if (e.reloading > 0 || e.ammo[e.weapon] === w.mag || !(e.reserve[e.weapon] > 0)) return false;
  e.reloading = w.reload; return true;
}

function damage(v, dmg, by, head, dir) {
  if (!v.alive) return;
  v.hp -= dmg; v.lastHurt = now;
  if (NET.inGame && v.kind === 'remote') relay({ k: 'hp', hp: Math.max(0, Math.round(v.hp)) }, v.id);
  if (v.isPlayer) { hurtFlash = Math.min(1, hurtFlash + dmg / 45); }
  if (by && by.isPlayer) { hitMarker(head); sfx('hit', .8); }
  if (!v.isPlayer && by && by !== v) { v.ai.target = by; v.ai.seen = Math.max(v.ai.seen, .2); }
  if (v.hp <= 0) kill(v, by, head, dir || new THREE.Vector3());
}
function kill(v, by, head, dir, fromNet) {
  if (NET.inGame && NET.isHost && !fromNet) relay({ k: 'kill', v: v.id, by: by ? by.id : null, h: head, dx: r2(dir.x), dz: r2(dir.z) });
  v.alive = false; v.hp = 0; v.deaths++; v.respawn = v.isPlayer ? 5 : 3; v.streak = 0; // игроку — время выбрать оружие
  if (v.mesh) { v.mesh.visible = false; v.tag.visible = false; }
  sliceCucumber(v.pos, v.hue, dir);
  spawnDrop(v); dropSeed(v, by); gunGameKill(by, v);
  sfx('chop', v.isPlayer ? 1 : Math.max(.15, 1 - v.pos.distanceTo(player.pos) / 60));
  if (by && by !== v) {
    by.kills++; by.streak++;
    if (by.isPlayer) { showStreak(by.streak, head); recordKill(by.weapon); recordGunKill(by.weapon); }
  }
  feed(by, v, head);
  if (v.isPlayer) {
    scoped = false;
    showCenter('Тебя нарезали!', by && by !== v ? `${by.name} сделал из тебя салат` : 'Самонарезка');
    mouseDown = false; if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock(); // курсор — чтобы выбрать оружие и нажать «Играть»
    deathCam = by && by !== v ? by : null;
  }
  if (!running || gameOver || !by || by === v || !authority()) return;
  if ((mode === 'ffa' || mode === 'knives') && by.kills >= MODES[mode].goal) endGame(by);
  if (mode === 'gungame' && by.level >= LADDER.length) endGame(by);
  if (mode === 'tdm') { teamScore[by.team]++; if (teamScore[by.team] >= MODES.tdm.goal) endGameTeam(by.team); }
}

// ---------- банки-гранаты ----------
const jars = [];
const jarProjGeo = new THREE.CylinderGeometry(.16, .16, .36, 12);
function throwJar(e) {
  if (!e.alive || e.jars <= 0) return;
  e.jars--;
  const d = dirOf(e.yaw, e.pitch + .25, new THREE.Vector3());
  const pos = eyeOf(e, new THREE.Vector3()).addScaledVector(d, .6);
  const vel = d.multiplyScalar(17).add(new THREE.Vector3(e.vel.x * .5, 0, e.vel.z * .5));
  launchJar(e, pos, vel);
  if (NET.inGame && (e.isPlayer || e.kind === 'bot')) relay({ k: 'jar', id: e.id, p: pos.toArray().map(r2), v: vel.toArray().map(r2) });
}
function launchJar(owner, pos, vel) {
  const m = new THREE.Group();
  const glass = new THREE.Mesh(jarProjGeo, jarBrine); const lid = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .07, 12), lidMat); lid.position.y = .2;
  m.add(glass, lid); m.position.copy(pos); scene.add(m);
  jars.push({ m, vel, t: 1.6, owner });
}
function updateJars(dt) {
  for (let i = jars.length - 1; i >= 0; i--) {
    const j = jars[i]; j.t -= dt;
    j.vel.y -= GRAV * dt;
    const p = j.m.position, prev = p.clone();
    p.addScaledVector(j.vel, dt);
    j.m.rotation.x += dt * 8; j.m.rotation.z += dt * 5;
    for (const b of boxes) {
      if (p.x > b.min.x - .15 && p.x < b.max.x + .15 && p.z > b.min.z - .15 && p.z < b.max.z + .15 && p.y > b.min.y && p.y < b.max.y + .15) {
        if (prev.y >= b.max.y + .1) { p.y = b.max.y + .16; j.vel.y *= -.4; j.vel.x *= .7; j.vel.z *= .7; }
        else { p.x = prev.x; p.z = prev.z; if (prev.x <= b.min.x - .15 || prev.x >= b.max.x + .15) j.vel.x *= -.5; else j.vel.z *= -.5; }
      }
    }
    if (p.y < .16) { p.y = .16; j.vel.y *= -.4; j.vel.x *= .7; j.vel.z *= .7; }
    if (j.t <= 0) { explode(p.clone(), j.owner); scene.remove(j.m); jars.splice(i, 1); }
  }
}
const booms = [];
function explode(p, owner, R = 7, D = 105) {
  const s = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xe2ec7a, transparent: true, opacity: .8 }));
  s.position.copy(p); scene.add(s); booms.push({ s, t: 0 });
  burst(p, 0xd7f0ff, 30, 11, .9); burst(p, 0xc9d56a, 30, 8, 1);
  sfx('boom', Math.max(.2, 1 - p.distanceTo(player.pos) / 80));
  if (player.alive) shake = Math.max(shake, Math.max(0, 1 - p.distanceTo(player.pos) / 25) * .6);
  for (const v of ents) {
    if (!v.alive || (owner && v !== owner && !isEnemy(owner, v))) continue;
    const c = v.pos.clone().setY(v.pos.y + .9), d = c.distanceTo(p);
    if (d < R) {
      const dir = c.clone().sub(p).normalize();
      if (rayWorld(p, dir, d) < d - .3) continue; // спрятался за укрытием
      if (v.isPlayer || (v.kind === 'bot' && authority())) { v.vel.addScaledVector(dir, 10 * (1 - d / R)); v.vel.y += 4 * (1 - d / R); }
      if (authority()) damage(v, D * (1 - d / R), owner, false, dir);
    }
  }
}
function updateBooms(dt) {
  for (let i = booms.length - 1; i >= 0; i--) {
    const b = booms[i]; b.t += dt;
    b.s.scale.setScalar(1 + b.t * 16); b.s.material.opacity = Math.max(0, .8 - b.t * 2.4);
    if (b.t > .35) { scene.remove(b.s); booms.splice(i, 1); }
  }
}

// ---------- ИИ ботов ----------
function lineOfSight(a, b) {
  const o = eyeOf(a, new THREE.Vector3()), t = eyeOf(b, new THREE.Vector3()).setY(b.pos.y + 1.2);
  const d = t.clone().sub(o), len = d.length(); d.normalize();
  return rayWorld(o, d, len) >= len - .05;
}
function angleDiff(a, b) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }

function updateBot(e, dt) {
  const ai = e.ai, D = DIFF[difficulty];
  botGrab(e);
  if (!modeWeaponFor(e) && (!hasAmmo(e, e.weapon) || (e.weapon !== e.pref && hasAmmo(e, e.pref)))) botPickWeapon(e);
  if (ai.goal && (!ai.goal.active || !canUse(e, ai.goal.type))) { ai.goal = null; ai.wp = null; }
  // выбор цели
  ai.scan = (ai.scan || 0) - dt;
  if (ai.scan <= 0) {
    ai.scan = .25;
    let best = null, bd = 60;
    for (const o of ents) {
      if (o === e || !o.alive || !isEnemy(e, o)) continue;
      const d = o.pos.distanceTo(e.pos);
      const facing = Math.abs(angleDiff(e.yaw, Math.atan2(-(o.pos.x - e.pos.x), -(o.pos.z - e.pos.z)))) < 1.6 || d < 8 || o === ai.target;
      if (d < bd && facing && lineOfSight(e, o)) { bd = d; best = o; }
    }
    if (best !== ai.target) ai.seen = 0;
    ai.target = best;
    if (!best) ai.seen = 0;
  }
  const wish = new THREE.Vector3();
  let speed = 5.2, jump = false;
  const t = ai.target;
  if (t && t.alive) {
    ai.seen += dt;
    const to = t.pos.clone().sub(e.pos);
    const dist = to.length();
    const wantYaw = Math.atan2(-to.x, -to.z);
    const wantPitch = Math.atan2(t.pos.y + 1.1 - (e.pos.y + EYE), Math.hypot(to.x, to.z));
    e.yaw += THREE.MathUtils.clamp(angleDiff(e.yaw, wantYaw), -D.turn * dt, D.turn * dt);
    e.pitch += (wantPitch - e.pitch) * Math.min(1, D.turn * dt);
    // дистанция по оружию + стрейф
    const ideal = { shotgun: 6, smg: 9, sniper: 28, knife: 1.2, rocket: 18 }[e.weapon] || 14;
    to.y = 0; to.normalize();
    if (dist > ideal + 3) wish.add(to); else if (dist < ideal - 3) wish.sub(to);
    ai.strafeT -= dt; if (ai.strafeT <= 0) { ai.strafe = Math.random() < .5 ? -1 : 1; ai.strafeT = .6 + Math.random() * 1.2; if (Math.random() < .15) jump = true; }
    wish.add(new THREE.Vector3(-to.z, 0, to.x).multiplyScalar(ai.strafe * .9));
    if (e.weapon === 'sniper') speed = 3;
    const aimed = Math.abs(angleDiff(e.yaw, wantYaw)) < .12;
    if (ai.seen > D.react && aimed && e.cool <= 0) {
      const moving = Math.hypot(e.vel.x, e.vel.z) / 6;
      fire(e, D.spread * (1 + moving * .5) + Math.min(.03, dist * .0006));
    }
    if (e.jars > 0 && dist > 9 && dist < 20 && Math.random() < dt * .08) throwJar(e);
  } else {
    // патруль
    if (!ai.goal && mode === 'seeds') { const sd = nearestSeed(e); if (sd) { ai.goal = sd; ai.wp = sd.pos.clone(); ai.stuck = 0; } } // бегут за семечками
    if (!ai.goal && botNeedsLoot(e)) { const pk = nearestLoot(e); if (pk) { ai.goal = pk; ai.wp = pk.pos.clone(); ai.stuck = 0; } }
    if (!ai.wp || (!ai.goal && e.pos.distanceTo(ai.wp) < 2) || ai.stuck > 1.5) {
      if (ai.goal && ai.stuck > 1.5) ai.avoid = ai.goal; // застрял по пути — этот ящик пока не трогаем
      ai.goal = null;
      const holdOk = point.owner === e.team && point.inZone[e.team] >= 2;
      ai.wp = mode === 'koth' && (!holdOk || Math.random() < .5) && Math.random() < .85 ? zoneWaypoint() : spawnPoint();
      ai.stuck = 0;
    }
    const to = ai.wp.clone().sub(e.pos); to.y = 0; to.normalize();
    wish.copy(to);
    const wantYaw = Math.atan2(-to.x, -to.z);
    e.yaw += THREE.MathUtils.clamp(angleDiff(e.yaw, wantYaw), -3 * dt, 3 * dt);
    e.pitch *= .9;
  }
  if (e.reloading <= 0 && !t && e.ammo[e.weapon] < WEAPONS[e.weapon].mag * .5) startReload(e);
  if (wish.lengthSq() > 0) wish.normalize();
  ai.blocked = false;
  moveEnt(e, wish, speed, dt, jump);
  if (ai.blocked) { ai.stuck += dt; if (e.onGround && Math.random() < .08) e.vel.y = 8.8; }
  drawEnt(e, dt);
}
function drawEnt(e, dt) {
  e.mesh.position.copy(e.pos);
  e.mesh.rotation.y = e.yaw + Math.PI;
  const moving = Math.hypot(e.vel.x, e.vel.z);
  e.mesh.rotation.z = Math.sin(now * 12) * .06 * Math.min(1, moving / 4);
  e.gunKick = Math.max(0, (e.gunKick || 0) - dt * 7);
  const gun = e.mesh.userData.gun, gk = Math.sin(Math.min(1, e.gunKick) * Math.PI / 2);
  gun.rotation.x = -e.pitch - gk * .3; gun.position.z = .4 - gk * .14;
  e.flashT = Math.max(0, (e.flashT || 0) - dt);
  const fl = e.mesh.userData.flash; fl.visible = e.flashT > 0; if (fl.visible) fl.rotation.z = Math.random() * 6.3;
  const mk = e.mesh.userData.marker; if (mk) { mk.rotation.y += dt * 3; mk.position.y = 3.05 + Math.sin(now * 3) * .08; }
  e.tag.position.set(e.pos.x, e.pos.y + 2.55, e.pos.z);
}

// ---------- игрок: ввод ----------
const keys = {};
let mouseDown = false, scoped = false, adsOn = false, ads = 0, locked = false, recoil = 0, flash = 0, hurtFlash = 0, shake = 0, deathCam = null, now = 0;
addEventListener('keydown', e => {
  if (!running) return;
  keys[e.code] = true;
  if (e.code === 'Escape' && !locked && !paused && !gameOver) { paused = true; mouseDown = false; showCenter('Пауза', 'Кликни, чтобы вернуться на грядку'); }
  // пока ждёшь возрождения, 1–6 выбирают ствол даже на паузе
  if (player && player.isPlayer && !player.alive) { const k = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].indexOf(e.code); if (k >= 0) { setNextPrimary(GUNS[k]); return; } if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') { e.preventDefault(); respawnPlayer(); return; } }
  if (e.code === 'Tab') { e.preventDefault(); $('board').style.display = 'block'; renderBoard(); }
  if (paused) return;
  if (e.code === 'KeyR') startReload(player);
  if (e.code === 'KeyF') startInspect();
  if (e.code === 'KeyG' || e.code === 'KeyQ') throwJar(player);
  let n = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].indexOf(e.code);
  if (n < 0) n = ['1', '2', '3', '4', '5', '6'].indexOf(e.key);
  if (n >= 0) {
    if (!player.alive) setNextPrimary(GUNS[n]);                 // после смерти — ствол на следующую жизнь
    else if (n === 0) switchWeapon(player.primary || 'rifle');
    else if (n === 1) switchWeapon('knife');
  }
});
addEventListener('keyup', e => { keys[e.code] = false; if (e.code === 'Tab') $('board').style.display = 'none'; });
addEventListener('mousedown', e => {
  if (!running || gameOver) return;
  if (player && player.isPlayer && !player.alive) return; // на экране смерти кликают по карточкам и «Играть»
  if (paused) { lockPointer(); return; }
  if (!locked) { try { const r = renderer.domElement.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (err) {} }
  if (e.button === 0) { mouseDown = true; if (!WEAPONS[player.weapon].auto) fire(player, moveSpread()); }
  if (e.button === 2 && WEAPONS[player.weapon].scope && player.alive) scoped = !scoped;
  else if (e.button === 2 && player.alive && vmW && vmW.sight) adsOn = true;   // прицеливание по мушке — пока держишь ПКМ
  if (e.button === 2 && WEAPONS[player.weapon].melee) meleeAttack(player, true);
});
addEventListener('mouseup', e => { if (e.button === 0) mouseDown = false; if (e.button === 2) adsOn = false; });
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('wheel', e => { if (!paused && running && player.alive) switchWeapon(player.weapon === 'knife' ? (player.primary || 'rifle') : 'knife'); });
addEventListener('mousemove', e => {
  if (paused || !running || !player.alive) return;
  if (Math.abs(e.movementX) > 350 || Math.abs(e.movementY) > 350) return;
  const sens = .0023 * (scoped ? .35 : 1 - ads * .4);
  player.yaw -= e.movementX * sens;
  player.pitch = THREE.MathUtils.clamp(player.pitch - e.movementY * sens, -1.5, 1.5);
  swayX = THREE.MathUtils.clamp(swayX + e.movementX * .00025, -.04, .04);
  swayY = THREE.MathUtils.clamp(swayY + e.movementY * .00025, -.04, .04);
});
function switchWeapon(k) {
  if (k === player.weapon) return;
  if (player.owned && !player.owned.includes(k)) return; // в руках только основной ствол и нож
  player.weapon = k; player.reloading = 0; player.cool = .35; scoped = false; adsOn = false; ads = 0; cancelInspect(); buildViewmodel();
}
function moveSpread() { const sp = Math.hypot(player.vel.x, player.vel.z); return (player.onGround ? sp * .004 : .05); }

function lockPointer() {
  audioInit();
  const c = renderer.domElement;
  try {
    const r = c.requestPointerLock && c.requestPointerLock();
    if (r && r.catch) r.catch(() => unpauseWithoutLock());
  } catch (err) { unpauseWithoutLock(); }
  setTimeout(() => { if (!locked && paused) unpauseWithoutLock(); }, 400);
}
function unpauseWithoutLock() { paused = false; hideCenter(); }   // запасной режим, если браузер не даёт захват мыши
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === renderer.domElement;
  if (locked) { paused = false; if (player.alive) hideCenter(); }
  else if (running && !gameOver && player.alive) { paused = true; mouseDown = false; showCenter('Пауза', 'Кликни, чтобы вернуться на грядку'); }
});

// ---------- вьюмодель ----------
const vm = new THREE.Group(); vmScene.add(vm);
const VM_POS = { knife: [.15, -.15, -.28], rifle: [.15, -.14, -.3], shotgun: [.16, -.14, -.3], sniper: [.24, -.15, -.52], smg: [.15, -.14, -.27], rocket: [.24, -.19, -.66], pistol: [.11, -.1, -.3] };
const VM_ROT = { knife: [.35, .15, -.35], rifle: [.02, .1, -.4], shotgun: [.02, .1, -.4], sniper: [0, .12, -.45], smg: [.02, .1, -.35], rocket: [.02, .1, -.22], pistol: [.03, .25, -.25] };
const vmBase = new THREE.Vector3(), ADS_POS = new THREE.Vector3();
const vmHandMat = new THREE.MeshStandardMaterial({ color: 0x3a7420, map: texSkin, roughness: .55 });
let vmW = null, swayX = 0, swayY = 0, drawT = 0;
function buildViewmodel() {
  while (vm.children.length) vm.remove(vm.children[0]);
  vmW = buildWeapon(player.weapon, vmHandMat, true, player.weapon === 'knife' ? knifeSkin : gunSkinOf(player.weapon), player.weapon === 'knife' ? knifeFinOf(knifeSkin) : null);
  const pose = player.weapon === 'knife' ? KNIFE_POSE[knifeSkin] : { pos: VM_POS[player.weapon], rot: VM_ROT[player.weapon] }; // у каждого ножа своя поза
  vmW.g.rotation.set(...pose.rot);
  vm.add(vmW.g);
  vmBase.set(...pose.pos);
  drawT = .35;
}

// ---------- отдача: ствол отскакивает назад и вверх на пружинке, вылетают гильзы ----------
// [назад, вверх, крен, тряска экрана, гильза]
const KICK = { rifle: [.045, .1, .025, 0, 1], shotgun: [.11, .32, .06, .08, 0], sniper: [.12, .34, .03, .06, 1], smg: [.025, .05, .035, 0, 1], rocket: [.2, .42, .03, .2, 0], pistol: [.05, .22, .04, 0, 1] };
const kick = { z: 0, rx: 0, rz: 0, vz: 0, vrx: 0, vrz: 0 };
function vmKick(k) {
  const K = KICK[k] || KICK.rifle;
  kick.vz += K[0] * 38; kick.vrx += K[1] * 38; kick.vrz += (Math.random() - .5) * K[2] * 76;
  if (K[3]) shake = Math.max(shake, K[3]);
  if (K[4]) ejectCasing();
}
function updateKick(dt) {
  const k = 260, c = 22, s = Math.min(dt, .03); // жёсткая пружина с демпфером — быстрый «щелчок» и возврат
  for (const [x, v] of [['z', 'vz'], ['rx', 'vrx'], ['rz', 'vrz']]) {
    kick[v] += (-k * kick[x] - c * kick[v]) * s; kick[x] += kick[v] * s;
  }
  for (let i = casings.length - 1; i >= 0; i--) {
    const c2 = casings[i]; c2.t += dt;
    c2.v.y -= 9 * dt; c2.m.position.addScaledVector(c2.v, dt);
    c2.m.rotation.x += dt * 18; c2.m.rotation.z += dt * 11;
    if (c2.t > .7) { vmScene.remove(c2.m); casings.splice(i, 1); }
  }
}
const casings = [];
const casingGeo = new THREE.CylinderGeometry(.006, .006, .024, 8);
function ejectCasing() {
  if (!vmW) return;
  const m = new THREE.Mesh(casingGeo, WM.brass);
  vmW.g.updateMatrixWorld(true);
  m.position.copy(vmW.g.localToWorld(new THREE.Vector3(.035, .06, -.05)));
  vmScene.add(m);
  casings.push({ m, t: 0, v: new THREE.Vector3(1.1 + Math.random() * .6, 1.2 + Math.random() * .6, .3 + Math.random() * .3) });
}

// ---------- HUD ----------
let hitT = 0, streakT = 0;
function hitMarker(head) { const h = $('hit'); h.className = head ? 'head' : ''; h.style.opacity = 1; hitT = .15; }
function showCenter(a, b) { $('bigMsg').textContent = a; $('subMsg').textContent = b || ''; }
function hideCenter() { showCenter('', ''); }
function showStreak(n, head) {
  const txt = { 2: 'Двойная нарезка!', 3: 'Оливье!', 5: 'Банка закатана!', 8: 'Огуречный бог!' }[n] || (head ? 'В макушку!' : '');
  if (!txt) return;
  $('streak').textContent = txt; $('streak').style.opacity = 1; streakT = 1.6;
}
function feed(by, v, head) {
  const d = document.createElement('div');
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const col = x => isTeamMode() ? ` style="color:${TEAMS[x.team].css}"` : '';
  if (by && by !== v) d.innerHTML = `<span class="k"${col(by)}>${esc(by.name)}</span> нарезал <span class="v"${col(v)}>${esc(v.name)}</span> <span class="w">${WEAPONS[by.weapon].name}${head ? ' · в голову' : ''}</span>`;
  else d.innerHTML = `<span class="v"${col(v)}>${esc(v.name)}</span> <span class="w">закатал сам себя</span>`;
  if (by === player || v === player) d.className = 'me';
  $('feed').prepend(d);
  while ($('feed').children.length > 5) $('feed').lastChild.remove();
  setTimeout(() => d.remove(), 6000);
}
function renderBoard() {
  const row = e => `<tr class="${e.isPlayer ? 'me' : ''}"><td><span class="swatch" style="background:#${e.color.toString(16).padStart(6, '0')}"></span>${e.name.replace(/</g, '&lt;')}</td><td>${e.kills}</td><td>${e.deaths}</td></tr>`;
  const byKills = (a, b) => b.kills - a.kills || a.deaths - b.deaths;
  if (isTeamMode()) {
    $('boardBody').innerHTML = [0, 1].map(t => `<tr class="teamrow"><td colspan="3" style="color:${TEAMS[t].css}">${TEAMS[t].name} · ${Math.floor(teamScore[t])}</td></tr>` + ents.filter(e => e.team === t).sort(byKills).map(row).join('')).join('');
    return;
  }
  const rows = [...ents].sort(byKills);
  $('boardBody').innerHTML = rows.map(e => `<tr class="${e.isPlayer ? 'me' : ''}"><td><span class="swatch" style="background:#${e.color.toString(16).padStart(6, '0')}"></span>${e.name.replace(/</g, '&lt;')}</td><td>${e.kills}</td><td>${e.deaths}</td></tr>`).join('');
}
let hudT = 0;
function updateHUD(dt) {
  hudT -= dt;
  if (hitT > 0) { hitT -= dt; if (hitT <= 0) $('hit').style.opacity = 0; }
  if (streakT > 0) { streakT -= dt; if (streakT <= 0) { $('streak').style.opacity = 0; $('streak').style.color = ''; } }
  hurtFlash = Math.max(0, hurtFlash - dt * 1.2);
  $('vign').style.opacity = Math.max(hurtFlash, player.alive && player.hp < 35 ? .35 : 0);
  $('cross').style.opacity = ads > .6 ? 0 : 1;
  const sc = scoped && player.alive;
  $('scope').style.display = sc ? 'block' : 'none';
  $('cross').style.display = sc ? 'none' : 'block';
  vm.visible = !sc && player.alive;
  $('cross').className = aimRelation();
  $('pauseBox').hidden = !(paused && running && !gameOver);
  const showLoad = running && !gameOver && player.isPlayer && !player.alive;
  if ($('loadout').hidden === showLoad) { $('loadout').hidden = !showLoad; if (showLoad) renderLoadout(); }
  if (showLoad) updateRespawnUI();
  if (hudT > 0) return; hudT = .08;
  const hp = Math.max(0, Math.ceil(player.hp));
  $('hpNum').textContent = hp; $('hpFill').style.width = hp + '%';
  const w = WEAPONS[player.weapon];
  $('wname').textContent = w.melee ? KNIFE_SKINS[knifeSkin].name : w.name;
  const res = player.reserve[player.weapon];
  if (w.melee) $('ammo').innerHTML = '<span>ЛКМ · ПКМ · F</span>'; else $('ammo').innerHTML = player.reloading > 0 ? 'Засолка…' : `${player.ammo[player.weapon]}<span> / ${res === Infinity ? '∞' : res}</span>`;
  $('ammo').classList.toggle('empty', player.ammo[player.weapon] === 0 && !(res > 0));
  $('jars').textContent = `Банки: ${player.jars} · [G]`;
  $('score').innerHTML = scoreHTML();
  if (!player.alive && player.respawn > 0) $('subMsg').textContent = $('subMsg').textContent.replace(/\d+ с$/, Math.ceil(player.respawn) + ' с');
}

// ---------- игровой цикл ----------
function updatePlayer(dt) {
  const e = player;
  if (!e.alive) {
    e.respawn -= dt;
    if (deathCam && deathCam.alive) { // смотрим на обидчика
      const t = deathCam.pos.clone().setY(deathCam.pos.y + 1.2), o = eyeOf(e, new THREE.Vector3());
      e.yaw += angleDiff(e.yaw, Math.atan2(-(t.x - o.x), -(t.z - o.z))) * Math.min(1, dt * 3);
    }
    if (e.respawn < 0) e.respawn = 0; // дальше игрок сам жмёт «Играть»
    return;
  }
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  if (!locked && !paused) { if (keys.ArrowLeft) e.yaw += 2.4 * dt; if (keys.ArrowRight) e.yaw -= 2.4 * dt; }
  const wish = new THREE.Vector3(-Math.sin(e.yaw) * f + Math.cos(e.yaw) * s, 0, -Math.cos(e.yaw) * f - Math.sin(e.yaw) * s);
  if (wish.lengthSq()) wish.normalize();
  const speed = keys.ShiftLeft || scoped ? 3.2 : WEAPONS[e.weapon].melee ? 8 : 7; // с ножом бегаешь быстрее
  moveEnt(e, paused ? wish.set(0, 0, 0) : wish, speed, dt, !paused && keys.Space);
  if (!paused && mouseDown && WEAPONS[e.weapon].auto) fire(e, moveSpread());
  if (now - e.lastHurt > 4 && e.hp < 100) e.hp = Math.min(100, e.hp + 18 * dt);
}
function updateTimers(e, dt) {
  e.cool = Math.max(0, e.cool - dt);
  if (e.reloading > 0) { e.reloading -= dt; if (e.reloading <= 0) { e.reloading = 0; finishReload(e); } }
  if (e.kind === 'bot' && authority() && !e.alive) { e.respawn -= dt; if (e.respawn <= 0 && !gameOver) spawn(e); }
  if (e.kind === 'bot' && e.alive && now - e.lastHurt > 5 && e.hp < 100) e.hp = Math.min(100, e.hp + 10 * dt);
  if (e.kind === 'remote' && e.alive && now - e.lastHurt > 4 && e.hp < 100) e.hp = Math.min(100, e.hp + 18 * dt);
}

let last = performance.now(), bob = 0;
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (t - last) / 1000); last = t;
  updateMapAnims(dt);
  gfxTick(dt, running && !gameOver && !paused);
  if (running && !gameOver) {
    const sim = paused && !NET.inGame ? 0 : dt; // в сетевой игре мир не замирает на паузе
    now += sim;
    if (sim > 0) {
      ents.forEach(e => updateTimers(e, sim));
      updatePlayer(sim);
      ents.forEach(e => { if (e.isPlayer || !e.alive) return; if (e.kind === 'bot' && authority()) updateBot(e, sim); else updateRemote(e, sim); });
      updateJars(sim); updateBooms(sim); updatePoint(sim); updatePickups(sim); updateRockets(sim); updateKnife(sim);
    }
    updateDebris(sim); updateTracers(sim);
    updateHUD(dt);
    if (NET.inGame) netTick(dt);
  } else if (!running) {
    // заставка: медленный облёт грядки
    now += dt;
    camera.position.set(Math.sin(now * .08) * 36, 16, Math.cos(now * .08) * 36);
    camera.lookAt(0, 1, 0);
    ents.forEach(e => updateTimers(e, dt));
    ents.forEach(e => { if (!e.isPlayer && e.alive) updateBot(e, dt); });
    updateDebris(dt); updateTracers(dt); updateJars(dt); updateBooms(dt);
  }
  if (running) {
    // камера игрока
    const p = player;
    recoil *= Math.pow(.001, dt);
    shake = Math.max(0, shake - dt);
    const speed = Math.hypot(p.vel.x, p.vel.z);
    if (p.onGround) bob += dt * speed * 1.6;
    camera.position.set(p.pos.x, p.pos.y + (p.alive ? EYE + Math.sin(bob * 2) * .035 * Math.min(1, speed / 7) : .5), p.pos.z);
    if (!p.alive) { camera.position.y = .6; }
    camera.rotation.set(p.pitch + recoil + (Math.random() - .5) * shake * .1, p.yaw + (Math.random() - .5) * shake * .1, p.alive ? 0 : .5);
    const canAds = adsOn && p.alive && !paused && vmW && vmW.sight && p.reloading <= 0 && !inspect;
    ads += ((canAds ? 1 : 0) - ads) * Math.min(1, dt * 11);
    if (ads < .001) ads = 0;
    const fov = scoped && p.alive ? 22 : 75 - ads * 14;
    if (Math.abs(camera.fov - fov) > .1) { camera.fov += (fov - camera.fov) * Math.min(1, dt * 18); camera.updateProjectionMatrix(); }
    // покачивание, отдача, перезарядка и доставание оружия
    const mv = Math.min(1, speed / 7), W = WEAPONS[p.weapon];
    swayX *= Math.pow(.004, dt); swayY *= Math.pow(.004, dt);
    drawT = Math.max(0, drawT - dt);
    const rl = p.reloading > 0 ? 1 - p.reloading / W.reload : 0, rs = p.reloading > 0 ? Math.sin(rl * Math.PI) : 0;
    const idle = Math.sin(now * 1.6) * .003;
    vm.position.set(
      vmBase.x + Math.cos(bob) * .012 * mv - swayX,
      vmBase.y + Math.abs(Math.sin(bob)) * .014 * mv + idle + swayY - rs * .06 - drawT * .6,
      vmBase.z + recoil * 1.6);
    vm.rotation.set(recoil * 2.4 - rs * .35 + drawT * 1.5 + swayY * 1.5, swayX * 1.5, rs * .55 + Math.cos(bob) * .01 * mv);
    updateKick(dt);
    vm.position.z += kick.z; vm.position.y += kick.rx * .06; vm.rotation.x += kick.rx; vm.rotation.z += kick.rz; vm.rotation.y += kick.rz * .4;
    updateKnifeVM(dt);
    if (ads > 0 && vmW && vmW.sight) {
      // подводим мушку на середину экрана: ствол выпрямляется и уходит к центру
      vm.position.lerp(ADS_POS.set(0, -vmW.sight[1], -.2), ads);
      vm.rotation.set(vm.rotation.x * (1 - ads), vm.rotation.y * (1 - ads), vm.rotation.z * (1 - ads));
      const R = VM_ROT[p.weapon] || [0, 0, 0];
      vmW.g.rotation.set(R[0] * (1 - ads), R[1] * (1 - ads), R[2] * (1 - ads));
    }
    if (vmW && vmW.mag) { vmW.mag.position.y = vmW.magY - Math.min(1, rs * 1.8) * .35; vmW.mag.visible = !(p.weapon === 'rocket' && p.ammo.rocket === 0 && p.reloading <= 0); }
    flash = Math.max(0, flash - dt);
    if (vmW) {
      vmW.flash.visible = flash > 0;
      if (flash > 0) { vmW.flash.rotation.z = Math.random() * 6.3; vmW.flash.scale.setScalar(.8 + Math.random() * .5); }
    }
    vmFlashLight.intensity = flash > 0 ? 2.5 : 0;
  }
  renderer.clear();
  renderer.render(scene, camera);
  if (running && vm.visible && player.alive) { renderer.clearDepth(); renderer.render(vmScene, vmCam); }
}

// ---------- старт / финал ----------
function setupMatch() {
  ents.forEach(e => { if (e.mesh) { scene.remove(e.mesh); scene.remove(e.tag); } });
  ents.length = 0;
  player = null;
  player = makeEnt(($('nick').value.trim() || 'Огурчик').slice(0, 16), true, 7, isTeamMode() ? 0 : null);
  BOT_NAMES.slice(0, 7).forEach((n, i) => spawn(makeEnt(n, false, i, isTeamMode() ? (i % 2 ? 0 : 1) : null)));
}
function endGame(winner) {
  if (NET.inGame && NET.isHost) relay({ k: 'end', w: winner.id });
  gameOver = true; mouseDown = false; scoped = false;
  if (document.exitPointerLock) document.exitPointerLock();
  renderBoard();
  $('board').style.display = 'block';
  showCenter(winner.isPlayer ? 'Грядка твоя!' : `Победил ${winner.name}`, winner.isPlayer ? `Ты нарезал ${MODES.ffa.goal} огурцов` : `Ты нарезал ${player.kills} · жми «Реванш» для новой попытки`);
  finishMatch();
}
function endGameTeam(t) {
  if (NET.inGame && NET.isHost) relay({ k: 'end', t });
  gameOver = true; mouseDown = false; scoped = false;
  if (document.exitPointerLock) document.exitPointerLock();
  renderBoard();
  $('board').style.display = 'block';
  const win = t === player.team;
  showCenter(win ? 'Победа!' : 'Поражение', `${TEAMS[t].name} забирает грядку · счёт ${Math.floor(teamScore[0])} : ${Math.floor(teamScore[1])}`);
  finishMatch();
}
function finishMatch() {
  if (NET.inGame && NET.lobby && NET.lobby.public) {
    $('subMsg').textContent += ' · следующий матч через 6 с';
    if (NET.isHost) setTimeout(() => { if (NET.isHost && NET.lobby && NET.lobby.public) publicStart(true); }, 6000);
    return;
  }
  if (NET.inGame) { setTimeout(backToLobby, 5000); return; }
  setTimeout(() => { $('menu').hidden = false; $('play').textContent = 'Реванш'; $('board').style.display = 'none'; }, 3500);
}
let menuMap = 'garden';
$('map').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  menuMap = b.dataset.map;
  $('map').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  $('mapHint').textContent = MAPS[menuMap].hint;
  if (currentMap !== menuMap) { buildMap(menuMap); ents.forEach(o => { if (!o.isPlayer && o.alive) spawn(o); }); }
});
$('mode').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  menuMode = b.dataset.m;
  $('mode').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  $('modeHint').textContent = MODES[menuMode].hint;
});
$('diff').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  difficulty = +b.dataset.v;
  $('diff').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
});
try { const n = localStorage.getItem('ogurcy-nick'); if (n) $('nick').value = n; } catch (e) {}
if (matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches) $('touchNote').hidden = false;
$('play').addEventListener('click', () => {
  if (NET.lobby) return;
  try { localStorage.setItem('ogurcy-nick', $('nick').value.trim()); } catch (e) {}
  if (currentMap !== menuMap) buildMap(menuMap);
  mode = menuMode; resetMode();
  jars.forEach(j => scene.remove(j.m)); jars.length = 0;
  setupMatch(); spawn(player); buildViewmodel();
  running = true; gameOver = false; paused = true; now = 0;
  ents.forEach(e => e.lastHurt = -10);
  $('menu').hidden = true; $('hud').hidden = false;
  $('feed').innerHTML = ''; hideCenter();
  if (isTeamMode()) announce(`Ты за команду ${TEAMS[player.team].name}` + (mode === 'koth' ? ' · захвати банку!' : ''), TEAMS[player.team].css);
  lockPointer();
});

// запуск: вызывается из net.js, когда все модули загружены; боты бегают на фоне меню
function bootGame() {
  buildMap('garden');
  player = { pos: new THREE.Vector3(0, 0, 999), alive: false, isPlayer: true, kills: 0 };
  BOT_NAMES.slice(0, 5).forEach((n, i) => spawn(makeEnt(n, false, i)));
  ents.push(player); // невидимый зритель, чтобы расчёт громкости работал
  requestAnimationFrame(frame);
}
