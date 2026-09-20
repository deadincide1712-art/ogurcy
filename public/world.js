// ================= Огуречные Шокеры — мир, модели, эффекты =================
const ARENA = 58;               // половина размера грядки
const GRAV = 22;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById('game').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa9dcf2);
scene.fog = new THREE.Fog(0xc6e8d8, 45, 130);
const camera = new THREE.PerspectiveCamera(75, 1, 0.05, 400);
camera.rotation.order = 'YXZ';
scene.add(camera);

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

scene.add(new THREE.HemisphereLight(0xf2ffe0, 0x5a4a2a, 0.75));
const sun = new THREE.DirectionalLight(0xfff1cf, 0.95);
sun.position.set(30, 55, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 140 });
sun.shadow.bias = -0.0006;
scene.add(sun);

// ---------- качество графики: авто снижает его, если кадров мало ----------
const GFX_LEVELS = {
  high: { name: 'Высокая', pr: 2, shadows: true, map: 2048 },
  mid:  { name: 'Средняя', pr: 1, shadows: true, map: 1024 },
  low:  { name: 'Низкая',  pr: .7, shadows: false, map: 512 },
};
const GFX = { mode: 'auto', level: null, acc: 0, n: 0, slow: 0 };
try { const g = localStorage.getItem('ogurcy-gfx'); if (g === 'auto' || GFX_LEVELS[g]) GFX.mode = g; } catch (e) {}
function applyGfx(level) {
  if (GFX.level === level) return;
  const L = GFX_LEVELS[level], hadShadows = GFX.level ? GFX_LEVELS[GFX.level].shadows : true;
  GFX.level = level;
  renderer.setPixelRatio(level === 'low' ? L.pr : Math.min(devicePixelRatio, L.pr));
  renderer.shadowMap.enabled = L.shadows; sun.castShadow = L.shadows;
  if (sun.shadow.mapSize.x !== L.map) { sun.shadow.mapSize.set(L.map, L.map); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
  if (hadShadows !== L.shadows) scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => m.needsUpdate = true); });
  resize();
  const note = document.getElementById('gfxNote');
  if (note) note.textContent = GFX.mode === 'auto' ? `Сейчас: ${L.name.toLowerCase()}. Если игра начнёт тормозить, качество понизится само.` : '';
}
function setGfxMode(mode) {
  GFX.mode = mode; GFX.acc = GFX.n = GFX.slow = 0;
  try { localStorage.setItem('ogurcy-gfx', mode); } catch (e) {}
  GFX.level = null; applyGfx(mode === 'auto' ? 'high' : mode);
  document.querySelectorAll('#gfxPick button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.gfx === mode)));
}
// считаем среднее время кадра за 2 секунды игры; дважды подряд медленно — ступенька вниз
function gfxTick(dt, active) {
  if (GFX.mode !== 'auto' || !active || document.hidden || GFX.level === 'low') return;
  GFX.acc += dt; GFX.n++;
  if (GFX.acc < 2) return;
  const avg = GFX.acc / GFX.n; GFX.acc = GFX.n = 0;
  GFX.slow = avg > 1 / 45 ? GFX.slow + 1 : 0;
  if (GFX.slow >= 2) { GFX.slow = 0; applyGfx(GFX.level === 'high' ? 'mid' : 'low'); }
}
applyGfx(GFX.mode === 'auto' ? 'high' : GFX.mode);
addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('gfxPick'); if (!box) return;
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setGfxMode(b.dataset.gfx); });
  box.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.gfx === GFX.mode)));
  GFX.level && applyGfx(GFX.level);
  const note = document.getElementById('gfxNote'); if (note && GFX.mode === 'auto') note.textContent = `Сейчас: ${GFX_LEVELS[GFX.level].name.toLowerCase()}. Если игра начнёт тормозить, качество понизится само.`;
});

// ---------- детерминированный рандом для раскладки ----------
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rng = mulberry32(7);

// ---------- текстуры из канваса ----------
function canvasTex(w, h, draw, rx = 1, ry = rx) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.anisotropy = 8; t.encoding = THREE.sRGBEncoding;
  return t;
}
const texGrass = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#6aa83a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2200; i++) {
    g.fillStyle = Math.random() < .5 ? 'rgba(40,90,20,.35)' : 'rgba(170,220,90,.3)';
    g.fillRect(Math.random() * w, Math.random() * h, 2, 3 + Math.random() * 4);
  }
}, 28);
const texSoil = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#5b3d22'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 700; i++) { g.fillStyle = Math.random() < .5 ? '#3e2914' : '#74532f'; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
}, 1, 5);
const texCrate = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#b98a4e'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 42) { g.fillStyle = 'rgba(80,50,20,.35)'; g.fillRect(0, y, w, 3); }
  g.strokeStyle = '#6b4520'; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18);
  g.beginPath(); g.moveTo(18, 18); g.lineTo(w - 18, h - 18); g.stroke();
  g.fillStyle = 'rgba(40,70,20,.85)'; g.font = 'bold 40px Rubik, sans-serif'; g.textAlign = 'center';
  g.save(); g.translate(w / 2, h / 2 + 14); g.rotate(-.12); g.fillText('РАССОЛ', 0, 0); g.restore();
});
const texFence = canvasTex(256, 128, (g, w, h) => {
  g.fillStyle = '#8d6a44'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 32) { g.fillStyle = x % 64 ? '#9d7850' : '#86623d'; g.fillRect(x + 2, 0, 28, h); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, 0, 2, h); }
}, 12, 1);
const texGrater = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#b9c2c7'; g.fillRect(0, 0, w, h);
  for (let y = 8; y < h; y += 20) for (let x = (y / 20 % 2) * 10 + 6; x < w; x += 20) {
    g.fillStyle = '#39424a'; g.beginPath(); g.ellipse(x, y, 5, 3, 0, 0, 7); g.fill();
    g.fillStyle = '#eef3f5'; g.fillRect(x - 5, y - 5, 10, 2);
  }
}, 3, 2);
const texSkin = canvasTex(128, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, '#d9e8c0'); gr.addColorStop(.5, '#ffffff'); gr.addColorStop(1, '#d9e8c0');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 16) { g.fillStyle = 'rgba(255,255,230,.5)'; g.fillRect(x, 0, 4, h); }
  for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(40,60,20,.55)'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 2.2, 0, 7); g.fill(); }
});
const texFlesh = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#3d7a1c'; g.beginPath(); g.arc(64, 64, 64, 0, 7); g.fill();
  g.fillStyle = '#e8f3b4'; g.beginPath(); g.arc(64, 64, 57, 0, 7); g.fill();
  g.fillStyle = '#cfe38a'; g.beginPath(); g.arc(64, 64, 30, 0, 7); g.fill();
  for (let i = 0; i < 3; i++) for (let s = 0; s < 4; s++) {
    const a = i * 2.094 + (s - 1.5) * .22, r = 18;
    g.fillStyle = '#f7fbe6'; g.beginPath(); g.ellipse(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 5, 2.6, a, 0, 7); g.fill();
  }
});

// ---------- препятствия ----------
const boxes = [];      // {min, max} AABB для коллизий и выстрелов
const mats = {
  crate: new THREE.MeshStandardMaterial({ map: texCrate, roughness: .85 }),
  fence: new THREE.MeshStandardMaterial({ map: texFence, roughness: .9 }),
  soil: new THREE.MeshStandardMaterial({ map: texSoil, roughness: 1 }),
  grater: new THREE.MeshStandardMaterial({ map: texGrater, metalness: .6, roughness: .35 }),
};
function addBox(x, z, w, h, d, y0, mat, noCollide) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y0 + h / 2, z); m.castShadow = m.receiveShadow = true;
  mapGroup.add(m);
  if (!noCollide) boxes.push({ min: new THREE.Vector3(x - w / 2, y0, z - d / 2), max: new THREE.Vector3(x + w / 2, y0 + h, z + d / 2) });
  return m;
}

// все объекты карты живут в mapGroup — её пересобирают при смене карты (см. maps.js)
const mapGroup = new THREE.Group(); scene.add(mapGroup);

// банки: стекло, рассол и золотая крышка
const jarGlass = new THREE.MeshStandardMaterial({ color: 0xcff2de, transparent: true, opacity: .32, roughness: .05, metalness: .1, depthWrite: false });
const jarBrine = new THREE.MeshStandardMaterial({ color: 0xc9d56a, transparent: true, opacity: .45, roughness: .3, depthWrite: false });
const lidMat = new THREE.MeshStandardMaterial({ color: 0xd8b24a, metalness: .8, roughness: .3 });
const pickleMat = new THREE.MeshStandardMaterial({ color: 0x5b8a2a, map: texSkin, roughness: .7 });
// в r128 нет CapsuleGeometry — собираем свою из лэйса
THREE.CapsuleGeometryShim = function (r, len) {
  const pts = [], half = len / 2 - r;
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i / 8 * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r, -half + Math.sin(a) * r)); }
  for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r, half + Math.sin(a) * r)); }
  return new THREE.LatheGeometry(pts, 18);
};
function addJar(x, z, R = 1.7, H = 4.4, r = Math.random) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 28, 1, true), jarGlass); glass.position.y = H / 2; glass.renderOrder = 2;
  const brine = new THREE.Mesh(new THREE.CylinderGeometry(R - .08, R - .08, H * .82, 28), jarBrine); brine.position.y = H * .41; brine.renderOrder = 1;
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(R + .08, R + .08, .45, 28), lidMat); lid.position.y = H + .2; lid.castShadow = true;
  g.add(glass, brine, lid);
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(new THREE.CapsuleGeometryShim(R * .165, H * .43), pickleMat);
    const a = i / 6 * Math.PI * 2; p.position.set(Math.cos(a) * R * .53, H * .32 + (i % 2) * H * .09, Math.sin(a) * R * .53);
    p.rotation.set((r() - .5) * .5, 0, (r() - .5) * .5); g.add(p);
  }
  mapGroup.add(g);
  boxes.push({ min: new THREE.Vector3(x - R, 0, z - R), max: new THREE.Vector3(x + R, H + .45, z + R) });
}

// ---------- модель огурца ----------
const G_SPHERE = new THREE.SphereGeometry(1, 14, 10);
const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3 });
const eyeBlack = new THREE.MeshBasicMaterial({ color: 0x111111 });
const gunMat = new THREE.MeshStandardMaterial({ color: 0x2d3336, metalness: .6, roughness: .45 });
const flowerMat = new THREE.MeshStandardMaterial({ color: 0xffd23a, roughness: .6 });

function makeCucumber(hue, bandColor, kind) {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(hue, .55, .38), map: texSkin, roughness: .65 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometryShim(.44, 1.84), skin);
  body.position.y = .92; body.castShadow = true; g.add(body);
  const wartMat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(hue, .5, .24) });
  for (let i = 0; i < 22; i++) {
    const a = Math.random() * Math.PI * 2, y = .35 + Math.random() * 1.15;
    const w = new THREE.Mesh(G_SPHERE, wartMat); w.scale.setScalar(.045);
    w.position.set(Math.cos(a) * .43, y, Math.sin(a) * .43); if (w.position.z > .25 && y > 1.2) continue; g.add(w);
  }
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(G_SPHERE, eyeWhite); e.scale.set(.12, .14, .08); e.position.set(s * .15, 1.38, .39); g.add(e);
    const p = new THREE.Mesh(G_SPHERE, eyeBlack); p.scale.setScalar(.058); p.position.set(s * .14, 1.37, .46); g.add(p);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(.17, .035, .04), eyeBlack); brow.position.set(s * .15, 1.55, .43); brow.rotation.z = -s * .35; g.add(brow);
  }
  const band = new THREE.Mesh(new THREE.TorusGeometry(.45, .06, 6, 20), new THREE.MeshStandardMaterial({ color: bandColor }));
  band.rotation.x = Math.PI / 2; band.position.y = 1.62; g.add(band);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.04, .06, .18, 6), new THREE.MeshStandardMaterial({ color: 0x6b5a2a })); stem.position.y = 1.92; g.add(stem);
  for (let i = 0; i < 5; i++) {
    const pet = new THREE.Mesh(G_SPHERE, flowerMat); pet.scale.set(.1, .03, .06);
    const a = i / 5 * Math.PI * 2; pet.position.set(Math.cos(a) * .09, 2.02, Math.sin(a) * .09); pet.rotation.y = -a; g.add(pet);
  }
  const gun = new THREE.Group();
  const w = buildWeapon(kind || 'rifle', skin, false);
  w.g.rotation.y = Math.PI; w.g.scale.setScalar(1.15); gun.add(w.g);
  gun.position.set(-.34, .98, .4); g.add(gun);
  g.userData = { skin, body, gun, flash: w.flash };
  return g;
}

// ---------- кольца-дольки при нарезке ----------
const sliceMats = h => [new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(h, .55, .35), map: texSkin }), new THREE.MeshStandardMaterial({ map: texFlesh }), new THREE.MeshStandardMaterial({ map: texFlesh })];
const G_SLICE = new THREE.CylinderGeometry(.43, .43, .14, 18);
const debris = [];
function sliceCucumber(pos, hue, dir) {
  const m = sliceMats(hue);
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(G_SLICE, m); s.castShadow = true;
    s.position.set(pos.x, pos.y + .25 + i * .2, pos.z);
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 4;
    debris.push({ mesh: s, vel: new THREE.Vector3(Math.cos(a) * sp + dir.x * 4, 4 + Math.random() * 5, Math.sin(a) * sp + dir.z * 4), spin: new THREE.Vector3(Math.random() * 10, Math.random() * 6, Math.random() * 10), life: 5, r: .07 });
    scene.add(s);
  }
  burst(pos.clone().setY(pos.y + 1), 0xdff09a, 28, 6);
}

// ---------- частицы ----------
const G_PART = new THREE.BoxGeometry(.09, .09, .09);
const partMats = {};
function burst(p, color, n, speed, life = .7) {
  const mat = partMats[color] || (partMats[color] = new THREE.MeshBasicMaterial({ color }));
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(G_PART, mat); m.position.copy(p);
    const v = new THREE.Vector3(Math.random() - .5, Math.random() * .8, Math.random() - .5).normalize().multiplyScalar(speed * (.3 + Math.random()));
    debris.push({ mesh: m, vel: v, spin: new THREE.Vector3(5, 5, 5), life: life * (.6 + Math.random() * .6), r: .04 });
    scene.add(m);
  }
}
function updateDebris(dt) {
  for (let i = debris.length - 1; i >= 0; i--) {
    const d = debris[i];
    d.life -= dt;
    d.vel.y -= GRAV * dt;
    d.mesh.position.addScaledVector(d.vel, dt);
    if (d.mesh.position.y < d.r) { d.mesh.position.y = d.r; d.vel.y *= -.35; d.vel.x *= .7; d.vel.z *= .7; d.spin.multiplyScalar(.6); }
    d.mesh.rotation.x += d.spin.x * dt; d.mesh.rotation.y += d.spin.y * dt; d.mesh.rotation.z += d.spin.z * dt;
    if (d.life < .5) d.mesh.scale.setScalar(Math.max(.01, d.life * 2));
    if (d.life <= 0) { scene.remove(d.mesh); debris.splice(i, 1); }
  }
}

// ---------- трассеры ----------
const tracers = [];
const tracerMat = new THREE.LineBasicMaterial({ color: 0xfff4a0, transparent: true, opacity: .9 });
function addTracer(a, b) {
  const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
  const l = new THREE.Line(geo, tracerMat.clone()); scene.add(l);
  tracers.push({ l, life: .07 });
}
function updateTracers(dt) {
  for (let i = tracers.length - 1; i >= 0; i--) {
    const t = tracers[i]; t.life -= dt; t.l.material.opacity = Math.max(0, t.life / .07) * .9;
    if (t.life <= 0) { scene.remove(t.l); t.l.geometry.dispose(); t.l.material.dispose(); tracers.splice(i, 1); }
  }
}

// ---------- лучи ----------
function rayAABB(o, d, b) {
  let tmin = 0, tmax = Infinity;
  for (const k of ['x', 'y', 'z']) {
    if (Math.abs(d[k]) < 1e-9) { if (o[k] < b.min[k] || o[k] > b.max[k]) return Infinity; continue; }
    let t1 = (b.min[k] - o[k]) / d[k], t2 = (b.max[k] - o[k]) / d[k];
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
    if (tmin > tmax) return Infinity;
  }
  return tmin;
}
function rayCyl(o, d, p, r, h) {
  let best = Infinity;
  const dx = o.x - p.x, dz = o.z - p.z;
  const a = d.x * d.x + d.z * d.z, b = 2 * (dx * d.x + dz * d.z), c = dx * dx + dz * dz - r * r;
  if (c < 0) return Infinity; // луч изнутри — это сам стрелок
  if (a > 1e-9) {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const t = (-b - Math.sqrt(disc)) / (2 * a), y = o.y + d.y * t;
      if (t > 0 && y >= p.y && y <= p.y + h) best = t;
    }
  }
  if (d.y < 0) { // крышка сверху
    const t = (p.y + h - o.y) / d.y;
    if (t > 0 && t < best) { const x = o.x + d.x * t - p.x, z = o.z + d.z * t - p.z; if (x * x + z * z <= r * r) best = t; }
  }
  return best;
}
function rayWorld(o, d, max) {
  let t = max;
  if (d.y < 0) t = Math.min(t, -o.y / d.y);
  for (const b of boxes) { const tb = rayAABB(o, d, b); if (tb < t) t = tb; }
  return t;
}

// ---------- звук ----------
let actx = null, noiseBuf = null, sfxBus = null, musicBus = null, masterBus = null; // два регулятора: эффекты и музыка
function audioInit() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    noiseBuf = actx.createBuffer(1, actx.sampleRate * .5, actx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // эффекты и музыка → общий регулятор (глушит неактивное окно) → ограничитель, чтобы гора звуков не хрипела
    const comp = actx.createDynamicsCompressor(); comp.threshold.value = -10; comp.knee.value = 18; comp.ratio.value = 3; comp.attack.value = .005; comp.release.value = .35; comp.connect(actx.destination);
    masterBus = actx.createGain(); masterBus.connect(comp);
    sfxBus = actx.createGain(); sfxBus.connect(masterBus);
    musicBus = actx.createGain(); musicBus.gain.value = 0; musicBus.connect(masterBus);
    if (typeof applyVolumes === 'function') applyVolumes();
  } catch (e) { actx = null; }
}
const sfxLast = {};
function sfx(kind, vol = 1) {
  if (!actx || vol < .02 || (typeof AUDIO_CFG !== 'undefined' && !AUDIO_CFG.sfx)) return;
  const now0 = actx.currentTime, last = sfxLast[kind] || -1;
  if (now0 - last < .035 && vol < .9) return;   // тот же звук только что прозвучал — чужой выстрел пропускаем, свой всегда слышен
  sfxLast[kind] = now0;
  const t = actx.currentTime, g = actx.createGain(); g.connect(sfxBus);
  const P = { rifle: [1800, .09, .35], shotgun: [900, .22, .55], sniper: [1300, .3, .6], smg: [2300, .06, .28], pistol: [1500, .1, .38], rocket: [400, .35, .6], boom: [220, .7, .9], hit: [0, .05, .25], chop: [0, .12, .3], click: [0, .04, .15] }[kind];
  if (!P) return; // неизвестный звук — тихо пропускаем, а не роняем кадр
  if (kind === 'hit' || kind === 'chop' || kind === 'click') {
    const o = actx.createOscillator(); o.type = kind === 'chop' ? 'square' : 'triangle';
    o.frequency.setValueAtTime(kind === 'hit' ? 1400 : kind === 'chop' ? 520 : 300, t);
    o.frequency.exponentialRampToValueAtTime(kind === 'chop' ? 90 : 700, t + P[1]);
    g.gain.setValueAtTime(P[2] * vol, t); g.gain.exponentialRampToValueAtTime(.001, t + P[1]);
    o.connect(g); o.start(t); o.stop(t + P[1]); return;
  }
  const s = actx.createBufferSource(); s.buffer = noiseBuf;
  const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(P[0], t); f.frequency.exponentialRampToValueAtTime(80, t + P[1]);
  g.gain.setValueAtTime(P[2] * vol, t); g.gain.exponentialRampToValueAtTime(.001, t + P[1]);
  s.connect(f); f.connect(g); s.start(t); s.stop(t + P[1]);
}
