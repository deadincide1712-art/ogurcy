// ================= Огуречные Шокеры — патроны, подбираемое и огурцы-ракеты =================
const netOn = () => typeof NET !== 'undefined' && NET.inGame;
const isAuth = () => typeof authority !== 'function' || authority(); // урон считает хост (в одиночной игре — ты)

// сколько чего даёт находка: ящик патронов, рюкзачок с убитого, ящик огурцов для ракетницы
const LOOT = {
  ammo:   { rifle: 45, shotgun: 12, sniper: 8, smg: 60, rocket: 1 },
  drop:   { rifle: 20, shotgun: 6, sniper: 4, smg: 30, jar: .35 },
  rocket: { rocket: 3 },
  jar:    { jar: 1 },
};
const RESPAWN = { ammo: 22, jar: 30, rocket: 45 };
const RING = { ammo: 0xffd23a, jar: 0x7ee05a, rocket: 0xff5a3a, drop: 0xffd23a };
const MAX_JARS = 3;

// ---------- снаряжение ----------
function giveLoadout(e) {
  e.ammo = {}; e.reserve = {};
  for (const k of WKEYS) { e.ammo[k] = WEAPONS[k].mag; e.reserve[k] = WEAPONS[k].start; }
  e.jars = 1;
  // игрок носит одно основное оружие и нож; ствол выбирается в меню и после смерти
  if (e.isPlayer && typeof nextPrimary !== 'undefined') {
    e.primary = nextPrimary; e.owned = [e.primary, 'knife']; e.weapon = e.primary;
    if (e === player && vmW) buildViewmodel();
  } else if (!e.isPlayer) e.owned = BOT_FALLBACK; // боты не берут ящики ради ракетницы, которой не пользуются
  if (!e.isPlayer && e.pref && e.weapon !== e.pref && e.mesh && !modeWeaponFor(e)) { e.weapon = e.pref; setGunModel(e, e.pref); } // после смерти — снова любимый ствол
  armForMode(e); // гонка вооружений и ножевой бой выдают оружие сами — последним, чтобы ничто не перебило
}
function finishReload(e) {
  const k = e.weapon, need = WEAPONS[k].mag - e.ammo[k], take = Math.min(need, e.reserve[k]);
  e.ammo[k] += take; if (e.reserve[k] !== Infinity) e.reserve[k] -= take;
}
let hintT = -10;
function noAmmoHint() {
  if (now - hintT < 2.5) return; hintT = now;
  announce('Патроны кончились — ищи жёлтый ящик или смени оружие', '#ffd9a0');
}

// ---------- модели находок ----------
const texAmmoBox = canvasTex(128, 64, (g, w, h) => {
  g.fillStyle = '#4f6b3a'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffd23a'; g.fillRect(0, 22, w, 20);
  g.fillStyle = '#1d2a12'; g.font = 'bold 17px Rubik, sans-serif'; g.textAlign = 'center'; g.fillText('ПАТРОНЫ', 64, 38);
});
const texRocketBox = canvasTex(128, 64, (g, w, h) => {
  g.fillStyle = '#6b2a20'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff'; g.fillRect(0, 22, w, 20);
  g.fillStyle = '#6b2a20'; g.font = 'bold 15px Rubik, sans-serif'; g.textAlign = 'center'; g.fillText('ОГУРЦЫ · 2 ШТ', 64, 38);
});
const PK = {
  ammoMat: new THREE.MeshStandardMaterial({ map: texAmmoBox, roughness: .6 }),
  rocketMat: new THREE.MeshStandardMaterial({ map: texRocketBox, roughness: .6 }),
  bag: new THREE.MeshStandardMaterial({ color: 0x6f7d3a, roughness: .9 }),
};
function pickupModel(type) {
  const g = new THREE.Group(), item = new THREE.Group(); g.add(item);
  if (type === 'ammo') {
    item.add(new THREE.Mesh(new THREE.BoxGeometry(.9, .55, .6), PK.ammoMat));
    for (const dx of [-.2, 0, .2]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .3, 8), WM.brass); b.position.set(dx, .42, 0); item.add(b); }
  } else if (type === 'rocket') {
    item.add(new THREE.Mesh(new THREE.BoxGeometry(1.3, .45, .6), PK.rocketMat));
    for (const dz of [-.13, .13]) { const c = new THREE.Mesh(new THREE.CapsuleGeometryShim(.12, 1.1), WM.pickle); c.rotation.z = Math.PI / 2; c.position.set(0, .35, dz); item.add(c); }
  } else if (type === 'jar') {
    const gl = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .5, 16), jarBrine); gl.position.y = .25;
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .08, 16), lidMat); lid.position.y = .53;
    const pk = new THREE.Mesh(new THREE.CapsuleGeometryShim(.07, .4), WM.pickle); pk.position.y = .24; pk.rotation.z = .2;
    item.add(gl, lid, pk);
  } else if (type === 'seed') {
    // светящееся семечко огурца
    const seed = new THREE.Mesh(new THREE.SphereGeometry(.28, 16, 12), new THREE.MeshStandardMaterial({ color: 0xf6f8d8, emissive: 0xd8f09a, emissiveIntensity: .55, roughness: .3 }));
    seed.scale.set(1, .45, .7); item.add(seed);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(.5, 12, 10), new THREE.MeshBasicMaterial({ color: 0xeaffb0, transparent: true, opacity: .18, depthWrite: false })); item.add(glow);
  } else {
    const bag = new THREE.Mesh(new THREE.SphereGeometry(.3, 12, 10), PK.bag); bag.scale.set(1, .8, .8); item.add(bag);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(.18, .03, 6, 14), WM.rubber); strap.position.y = .22; item.add(strap);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .25, 8), WM.brass); b.position.set(.1, .3, 0); b.rotation.z = .5; item.add(b);
  }
  item.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const ring = new THREE.Mesh(new THREE.RingGeometry(.55, .75, 32), new THREE.MeshBasicMaterial({ color: RING[type], transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .03; g.add(ring);
  g.userData.item = item;
  return g;
}

// ---------- раскладка по карте ----------
const pickups = [];
function clearPickups() { for (const p of pickups) scene.remove(p.mesh); pickups.length = 0; }
function freeSpot(r, taken) {
  for (let k = 0; k < 60; k++) {
    const p = new THREE.Vector3((r() * 2 - 1) * (ARENA - 5), 0, (r() * 2 - 1) * (ARENA - 5));
    if (Math.hypot(p.x, p.z) < 3) continue;
    const blocked = boxes.some(b => p.x + 1 > b.min.x && p.x - 1 < b.max.x && p.z + 1 > b.min.z && p.z - 1 < b.max.z && b.max.y > .3);
    if (blocked || taken.some(t => t.distanceTo(p) < 8)) continue;
    return p;
  }
  return null;
}
// одинаковая раскладка у всех игроков лобби: сид зависит только от карты
function setupPickups(mapId) {
  clearPickups();
  const r = mulberry32(mapId.length * 131 + 99), taken = [];
  const plan = [['ammo', 9], ['jar', 4], ['rocket', 2]];
  for (const [type, n] of plan) for (let i = 0; i < n; i++) {
    const p = freeSpot(r, taken); if (!p) continue; taken.push(p);
    addPickup(type + i, type, p);
  }
}
function addPickup(id, type, pos, life) {
  const mesh = pickupModel(type); mesh.position.copy(pos); scene.add(mesh);
  const pk = { id, type, pos: pos.clone(), mesh, active: true, t: 0, life: life || 0, phase: Math.random() * 6 };
  pickups.push(pk); return pk;
}
function resetPickups() { for (const p of [...pickups]) { if (p.type === 'drop') { scene.remove(p.mesh); pickups.splice(pickups.indexOf(p), 1); } else { p.active = true; p.mesh.visible = true; } } }
// с нарезанного огурца выпадает рюкзачок
function spawnDrop(v) {
  const id = `drop:${v.id || v.name}:${v.deaths}`;
  if (pickups.some(p => p.id === id)) return;
  const pos = new THREE.Vector3(v.pos.x, Math.max(0, v.pos.y), v.pos.z);
  addPickup(id, 'drop', pos, 20);
}

// ---------- подбор ----------
function lootText(e, type) {
  const L = LOOT[type], parts = [];
  for (const k of WKEYS) {
    if (!L[k] || e.reserve[k] === Infinity || (e.owned && !e.owned.includes(k))) continue;
    const room = WEAPONS[k].max - e.reserve[k]; const got = Math.min(room, L[k]);
    if (got > 0) { e.reserve[k] += got; parts.push(`${WEAPONS[k].name} +${got}`); }
  }
  if (L.jar && e.jars < MAX_JARS && (L.jar >= 1 || Math.random() < L.jar)) { e.jars++; parts.push('банка +1'); }
  return parts;
}
function canUse(e, type) {
  if (type === 'seed') return true;
  const L = LOOT[type];
  if (L.jar >= 1 && e.jars < MAX_JARS) return true;
  return WKEYS.some(k => L[k] && e.reserve[k] !== Infinity && e.reserve[k] < WEAPONS[k].max && (!e.owned || e.owned.includes(k)));
}
function takePickup(pk, e) {
  pk.active = false; pk.mesh.visible = false; pk.t = RESPAWN[pk.type] || 0;
  if (pk.type === 'drop' || pk.type === 'seed') { scene.remove(pk.mesh); pickups.splice(pickups.indexOf(pk), 1); }
  if (pk.type === 'seed') { seedTaken(pk, e); if (e && e.isPlayer) pickupSound(); return; }
  if (e) {
    const got = lootText(e, pk.type);
    if (!e.isPlayer) return;
    if (got.length) announce(got.join(' · '), pk.type === 'rocket' ? '#ff9a7a' : '#ffe27a');
    pickupSound();
  }
}
function pickupSound() {
  if (!actx) return;
  const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(1040, t + .12);
  g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.001, t + .18);
  o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .2);
}
function updatePickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const pk = pickups[i];
    if (!pk.active) {
      pk.t -= dt;
      if (pk.t <= 0 && pk.type !== 'drop') { pk.active = true; pk.mesh.visible = true; }
      continue;
    }
    if (pk.life) { pk.life -= dt; if (pk.life <= 0) { scene.remove(pk.mesh); pickups.splice(i, 1); continue; } }
    const it = pk.mesh.userData.item;
    it.rotation.y += dt * 1.6; it.position.y = .35 + Math.sin(now * 2.5 + pk.phase) * .12;
    if (player && player.alive && player.isPlayer && player.reserve) {
      const dx = player.pos.x - pk.pos.x, dz = player.pos.z - pk.pos.z;
      if (dx * dx + dz * dz < 1.6 && Math.abs(player.pos.y - pk.pos.y) < 1.8 && canUse(player, pk.type)) {
        takePickup(pk, player);
        if (netOn()) relay({ k: 'pick', id: pk.id });
      }
    }
  }
}
// кто-то другой подобрал
function remotePick(id, from) {
  const pk = pickups.find(p => p.id === id);
  if (pk && pk.active) takePickup(pk, pk.type === 'seed' && typeof entById === 'function' ? entById(from) : null); // семечко — важно, кто подобрал
}

// ---------- огурцы-ракеты ----------
const rockets = [], trail = [];
const trailMat = new THREE.MeshBasicMaterial({ color: 0xeaeaea, transparent: true, opacity: .5, depthWrite: false });
const trailGeo = new THREE.SphereGeometry(.18, 8, 6);
function rocketModel() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometryShim(.2, .95), WM.pickle); body.castShadow = true; g.add(body);
  for (let i = 0; i < 10; i++) { const a = Math.random() * 6.3, y = (Math.random() - .5) * .6; const w = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 5), WM.dark); w.position.set(Math.cos(a) * .2, y, Math.sin(a) * .2); g.add(w); }
  const fire = new THREE.Mesh(new THREE.ConeGeometry(.16, .5, 10), new THREE.MeshBasicMaterial({ color: 0xffb040, transparent: true, opacity: .85 }));
  fire.position.y = -.7; fire.rotation.x = Math.PI; g.add(fire); g.userData.fire = fire;
  return g;
}
function fireRocket(e) {
  const w = WEAPONS.rocket;
  const o = eyeOf(e, new THREE.Vector3()), d = dirOf(e.yaw, e.pitch, new THREE.Vector3());
  const p = o.clone().addScaledVector(d, .9).add(new THREE.Vector3(Math.cos(e.yaw) * .2, -.15, -Math.sin(e.yaw) * .2));
  const vel = d.clone().multiplyScalar(w.speed);
  launchRocket(e, p, vel);
  sfx('boom', e.isPlayer ? .45 : Math.max(0, 1 - e.pos.distanceTo(player.pos) / 70) * .35);
  if (e.isPlayer) { recoil += w.kick; e.pitch = Math.min(1.5, e.pitch + w.kick * .5); flash = .08; shake = Math.max(shake, .25); vmKick('rocket'); }
  else { e.flashT = .08; e.gunKick = 1.6; }
  if (netOn() && (e.isPlayer || e.kind === 'bot')) relay({ k: 'rocket', id: e.id, p: p.toArray().map(r2), v: vel.toArray().map(r2) });
}
function launchRocket(owner, p, vel) {
  const mesh = rocketModel(); mesh.position.copy(p); scene.add(mesh);
  rockets.push({ owner, pos: p.clone(), vel: vel.clone(), mesh, life: 4, puff: 0 });
}
const _up = new THREE.Vector3(0, 1, 0);
function updateRockets(dt) {
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    r.life -= dt; r.vel.y -= 1.2 * dt; // лёгкое снижение, почти прямой полёт
    const step = r.vel.clone().multiplyScalar(dt), len = step.length(), dir = step.clone().normalize();
    let t = rayWorld(r.pos, dir, len), hitE = null;
    for (const v of ents) {
      if (!v.alive || v === r.owner || (r.owner && !isEnemy(r.owner, v))) continue;
      const tc = rayCyl(r.pos, dir, v.pos, RADIUS + .15, HEIGHT); if (tc < t) { t = tc; hitE = v; }
    }
    if (t < len || r.life <= 0) {
      const hit = r.pos.clone().addScaledVector(dir, Math.min(t, len));
      // прямое попадание огурцом — добавочный урон, чтобы в упор нарезало наверняка
      if (hitE && isAuth()) damage(hitE, 60, r.owner, false, dir);
      explode(hit, r.owner, WEAPONS.rocket.radius, WEAPONS.rocket.dmg);
      scene.remove(r.mesh); rockets.splice(i, 1); continue;
    }
    r.pos.add(step);
    r.mesh.position.copy(r.pos);
    r.mesh.quaternion.setFromUnitVectors(_up, dir);
    r.mesh.userData.fire.scale.setScalar(.8 + Math.random() * .5);
    r.puff -= dt;
    if (r.puff <= 0) {
      r.puff = .025;
      const m = new THREE.Mesh(trailGeo, trailMat.clone()); m.position.copy(r.pos).addScaledVector(dir, -.7); scene.add(m);
      trail.push({ m, t: 0 });
    }
  }
  for (let i = trail.length - 1; i >= 0; i--) {
    const p = trail[i]; p.t += dt;
    p.m.scale.setScalar(1 + p.t * 4); p.m.material.opacity = .45 * (1 - p.t / .9); p.m.position.y += dt * .4;
    if (p.t > .9) { scene.remove(p.m); p.m.material.dispose(); trail.splice(i, 1); }
  }
}
function clearRockets() { for (const r of rockets) scene.remove(r.mesh); rockets.length = 0; }

// ---------- ИИ: боты ищут патроны ----------
function setGunModel(e, kind) {
  const ud = e.mesh.userData;
  while (ud.gun.children.length) ud.gun.remove(ud.gun.children[0]);
  const w = buildWeapon(kind, ud.skin, false, kind === 'knife' ? e.knifeSkin : e.gunSkin, e.knifeFin);
  w.g.rotation.y = Math.PI; w.g.scale.setScalar(1.15); ud.gun.add(w.g); ud.flash = w.flash;
}
const BOT_FALLBACK = ['rifle', 'smg', 'shotgun', 'sniper', 'pistol']; // ракетницей боты не пользуются
const hasAmmo = (e, k) => e.ammo[k] > 0 || e.reserve[k] > 0;
// любимый ствол, если к нему есть патроны, иначе любой заряженный, в крайнем случае пистолет
function botPickWeapon(e) {
  const k = [e.pref, ...BOT_FALLBACK].find(k => k && hasAmmo(e, k));
  if (k && k !== e.weapon) { e.weapon = k; e.reloading = 0; e.cool = .4; if (e.mesh) setGunModel(e, k); }
}
// патронов к любимому стволу меньше полутора магазинов или нет банок — пора к ящикам
function botNeedsLoot(e) {
  const k = e.pref || e.weapon, w = WEAPONS[k];
  return e.ammo[k] + e.reserve[k] < w.mag * 1.5 || e.jars === 0;
}
function nearestLoot(e, maxD = 70) {
  let best = null, bd = maxD;
  for (const pk of pickups) {
    if (!pk.active || pk.type === 'rocket' || pk === e.ai.avoid || !canUse(e, pk.type)) continue;
    const d = Math.hypot(pk.pos.x - e.pos.x, pk.pos.z - e.pos.z);
    if (d < bd) { bd = d; best = pk; }
  }
  return best;
}
// бот стоит на находке — забирает
function botGrab(e) {
  for (const pk of pickups) {
    if (!pk.active) continue;
    const dx = e.pos.x - pk.pos.x, dz = e.pos.z - pk.pos.z;
    if (dx * dx + dz * dz < 1.6 && Math.abs(e.pos.y - pk.pos.y) < 1.8 && canUse(e, pk.type)) {
      takePickup(pk, e);
      if (netOn()) relay({ k: 'pick', id: pk.id });
      if (e.ai.goal === pk) { e.ai.goal = null; e.ai.wp = null; }
      return;
    }
  }
}
