// ================= Огуречные Шокеры — красота карт: свет, тени у земли, пруд, бабочки, искры =================
// Работает поверх mapextras.js: fxPre ставит то, что должно быть до случайной расстановки ящиков,
// fxPost — финальный слой (мягкие тени, пятна на земле, свет, живность).

// дальше видно — холмы и лес за оградой растворяются в дымке, а не обрываются
Object.assign(MAPS.garden, { fogFar: 240 });
Object.assign(MAPS.greenhouse, { fogFar: 210 });
Object.assign(MAPS.kitchen, { fogFar: 190 });

const hemiLight = scene.children.find(o => o.isHemisphereLight);
const fillLight = new THREE.DirectionalLight(0xbfd8ff, .3); fillLight.position.set(-30, 25, -40); scene.add(fillLight);
const LIGHTS = {
  garden:     { sky: 0xe4f5ff, ground: 0x6b5a36, hemi: .72, sun: 1.1, sunCol: 0xfff0cc, fill: .32 },
  kitchen:    { sky: 0xfff1dc, ground: 0x8a6a4a, hemi: .78, sun: .85, sunCol: 0xffe6bf, fill: .25 },
  greenhouse: { sky: 0xecfff2, ground: 0x5a6a44, hemi: .78, sun: 1.0, sunCol: 0xfff6d8, fill: .3 },
  factory:    { sky: 0xcfd9e0, ground: 0x3a3c3e, hemi: .5, sun: .45, sunCol: 0xe8f0ff, fill: .18 },
};

// ---------- текстуры ----------
function softRectTex(inner = .62, color = '0,0,0') {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const m = 64 * (1 - inner);
  g.shadowColor = `rgba(${color},1)`; g.shadowBlur = m * .9; g.fillStyle = `rgba(${color},1)`;
  g.fillRect(m, m, 128 - m * 2, 128 - m * 2);
  const t = new THREE.CanvasTexture(c); return t;
}
function radialTex(stops) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
const FX = {
  aoTex: softRectTex(.6),
  glowTex: radialTex([[0, 'rgba(255,248,220,1)'], [.25, 'rgba(255,236,180,.55)'], [1, 'rgba(255,220,150,0)']]),
  poolTex: radialTex([[0, 'rgba(255,244,210,1)'], [.5, 'rgba(255,236,190,.4)'], [1, 'rgba(255,230,180,0)']]),
  stainTex: radialTex([[0, 'rgba(20,20,18,.9)'], [.6, 'rgba(20,20,18,.5)'], [1, 'rgba(20,20,18,0)']]),
  sunPatchTex: softRectTex(.55, '255,236,190'),
  beamTex: (() => { const c = document.createElement('canvas'); c.width = 16; c.height = 128; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, 16, 128); const h = g.createLinearGradient(0, 0, 16, 0); return new THREE.CanvasTexture(c); })(),
};
const fxAdd = (map, color = 0xffffff, opacity = 1) => new THREE.MeshBasicMaterial({ map, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
function decal(w, d, mat, x, z, y = .012, rot = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.set(-Math.PI / 2, 0, rot); m.position.set(x, y, z); m.renderOrder = 1; mapGroup.add(m); return m;
}

// ---------- общий финальный слой ----------
// мягкая «контактная» тень у основания всего, что стоит на земле
function contactShadows() {
  const mat = new THREE.MeshBasicMaterial({ map: FX.aoTex, color: 0x000000, transparent: true, opacity: .38, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
  for (const b of boxes) {
    const h = b.max.y - b.min.y, w = b.max.x - b.min.x, d = b.max.z - b.min.z;
    if (b.min.y > .1 || h < .3) continue;
    const pad = Math.min(1.6, .5 + h * .25);
    decal((w + pad * 2) / .62 * .8, (d + pad * 2) / .62 * .8, mat, (b.min.x + b.max.x) / 2, (b.min.z + b.max.z) / 2, .018);
  }
}
// пятна на земле: светлее/темнее, чтобы не было видно повторения текстуры
function mottleGround(id) {
  const tint = { garden: [.16, [1.08, 1.02, .8]], kitchen: [.07, [1.05, .98, .92]], greenhouse: [.12, [.95, 1.05, .9]], factory: [.14, [.92, .94, .96]] }[id];
  const W = ARENA * 2 + 60, geo = new THREE.PlaneGeometry(W, W, 90, 90), pos = geo.attributes.position, cols = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const n = .5 * Math.sin(x * .09 + 1.3) * Math.sin(y * .07 + .4) + .3 * Math.sin(x * .23 + y * .17) + .2 * Math.sin(x * .51 - y * .43);
    const k = 1 + n * tint[0], warm = Math.max(0, n) * .6;
    cols.push(k * (1 + (tint[1][0] - 1) * warm), k * (1 + (tint[1][1] - 1) * warm), k * (1 + (tint[1][2] - 1) * warm));
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  groundMesh.geometry.dispose(); groundMesh.geometry = geo;
  if (!groundMesh.material.vertexColors) { groundMesh.material.vertexColors = true; groundMesh.material.needsUpdate = true; }
}
function applyLights(id) {
  const L = LIGHTS[id];
  hemiLight.color.set(L.sky); hemiLight.groundColor.set(L.ground); hemiLight.intensity = L.hemi;
  sun.intensity = L.sun; sun.color.set(L.sunCol); fillLight.intensity = L.fill;
}
function sunGlow() {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: FX.glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  s.position.set(120, 190, 70); s.scale.set(110, 110, 1); mapGroup.add(s);
}
// пышные облака из шаров, медленно плывут
function puffyClouds(r, n = 10) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xe8f2ff, emissiveIntensity: .45, flatShading: true, fog: false });
  const all = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group(); g.position.set((r() - .5) * 360, 70 + r() * 40, (r() - .5) * 360);
    const k = 5 + r() * 5;
    for (let j = 0; j < 6; j++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(k * (.6 + r() * .6), 1), mat); b.position.set((j - 2.5) * k * .7, r() * k * .4, (r() - .5) * k); b.scale.y = .7; g.add(b); }
    mapGroup.add(g); all.push(g);
  }
  mapAnims.push(dt => all.forEach(g => { g.position.x += dt * 1.2; if (g.position.x > 200) g.position.x = -200; }));
}
function hills(r) {
  const cols = [0x5f9a48, 0x6fa853, 0x4f8a3f, 0x7cae5a];
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2 + r() * .3, d = 150 + r() * 50;
    const h = new THREE.Mesh(new THREE.SphereGeometry(30 + r() * 25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: cols[i % 4], roughness: 1, flatShading: true }));
    h.position.set(Math.cos(a) * d, -4, Math.sin(a) * d); h.scale.y = .35 + r() * .25; mapGroup.add(h);
  }
}
function butterflies(r, n, colors, center = [0, 0], spread = 40, hMin = .8, hMax = 3) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], side: THREE.DoubleSide });
    const g = new THREE.Group(), wings = [];
    for (const s of [-1, 1]) { const geo = new THREE.PlaneGeometry(.22, .16); geo.translate(s * .11, 0, 0); const w = new THREE.Mesh(geo, mat); g.add(w); wings.push(w); }
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .16, 5), new THREE.MeshBasicMaterial({ color: 0x222222 })); body.rotation.x = Math.PI / 2; g.add(body);
    g.userData = { wings, cx: center[0] + (r() - .5) * spread, cz: center[1] + (r() - .5) * spread, rad: 2 + r() * 5, sp: .3 + r() * .5, ph: r() * 6, h: hMin + r() * (hMax - hMin) };
    mapGroup.add(g); list.push(g);
  }
  mapAnims.push((dt, t) => list.forEach(g => {
    const u = g.userData, a = t * u.sp + u.ph;
    const x = u.cx + Math.cos(a) * u.rad, z = u.cz + Math.sin(a * 1.3) * u.rad, y = u.h + Math.sin(a * 3) * .4;
    g.lookAt(x, y, z); g.position.set(x, y, z);
    const f = Math.sin(t * 22 + u.ph) * 1.1; u.wings[0].rotation.y = f; u.wings[1].rotation.y = -f;
  }));
}
function puffs(x, y, z, n, rise, spreadR, speed, opacity, size = .5) {
  const list = [];
  for (let i = 0; i < n; i++) { const p = deco(new THREE.SphereGeometry(size, 8, 6), XM.steam.clone(), x, y, z, false); p.userData.t = i / n; list.push(p); }
  mapAnims.push(dt => list.forEach(p => {
    p.userData.t = (p.userData.t + dt * speed) % 1; const k = p.userData.t;
    p.position.set(x + Math.sin(k * 7 + x) * spreadR * k, y + k * rise, z + Math.cos(k * 5 + z) * spreadR * k);
    p.scale.setScalar(.5 + k * 1.8); p.material.opacity = opacity * Math.sin(k * Math.PI);
  }));
}

// ---------- карты ----------
const FXMAPS = {
  garden: {
    pre(r) {
      // пруд: низкая «коллизия» высотой 2 см не даёт поставить туда ящики, а ходить можно
      const px = 2, pz = 30.5, R = 3.6;
      solid(px, pz, R * 2, .02, R * 1.6);
      const water = new THREE.MeshStandardMaterial({ color: 0x1f6a86, roughness: .12, metalness: .15, transparent: true, opacity: .92, envMap, envMapIntensity: .55 });
      const w = decal(1, 1, water, px, pz, .03); w.geometry.dispose(); w.geometry = new THREE.CircleGeometry(R, 40); w.scale.set(1, .78, 1);
      const bank = decal(1, 1, new THREE.MeshStandardMaterial({ color: 0x6b5634, roughness: 1 }), px, pz, .022); bank.geometry.dispose(); bank.geometry = new THREE.CircleGeometry(R + .5, 40); bank.scale.set(1, .8, 1);
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const s = deco(new THREE.DodecahedronGeometry(.28 + r() * .2, 0), new THREE.MeshStandardMaterial({ color: 0x77736a, roughness: .9, flatShading: true }), px + Math.cos(a) * (R + .35), .1, pz + Math.sin(a) * (R + .35) * .8); s.scale.y = .55; }
      const pad = new THREE.MeshStandardMaterial({ color: 0x4f9a36, roughness: .6, side: THREE.DoubleSide });
      for (let i = 0; i < 6; i++) { const lp = decal(1, 1, pad, px + (r() - .5) * 4, pz + (r() - .5) * 3, .05, r() * 6); lp.geometry.dispose(); lp.geometry = new THREE.CircleGeometry(.35 + r() * .2, 12, .4, Math.PI * 1.8); }
      for (let i = 0; i < 3; i++) deco(new THREE.SphereGeometry(.12, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffb6d0 }), px + (r() - .5) * 3, .12, pz + (r() - .5) * 2);
      for (let i = 0; i < 22; i++) {
        const a = r() * Math.PI * 2, d = R + .1 + r() * .7, h = .8 + r() * 1.2;
        const reed = deco(new THREE.CylinderGeometry(.02, .03, h, 4), MM.leaf, px + Math.cos(a) * d, h / 2, pz + Math.sin(a) * d * .8, false);
        reed.rotation.z = (r() - .5) * .3;
        if (r() < .4) deco(new THREE.CylinderGeometry(.05, .05, .25, 6), new THREE.MeshStandardMaterial({ color: 0x5a3a1c }), reed.position.x, h, reed.position.z, false);
      }
      const ripples = [];
      for (let i = 0; i < 3; i++) { const rp = decal(1, 1, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .3, depthWrite: false }), px, pz, .04); rp.geometry.dispose(); rp.geometry = new THREE.RingGeometry(.9, 1, 32); rp.userData.t = i / 3; ripples.push(rp); }
      mapAnims.push(dt => ripples.forEach(rp => { rp.userData.t = (rp.userData.t + dt * .25) % 1; const k = rp.userData.t; rp.scale.set(.3 + k * 2.6, .3 + k * 2.1, 1); rp.material.opacity = .35 * (1 - k); }));
    },
    post(r) {
      sunGlow(); puffyClouds(r, 12); hills(r);
      butterflies(r, 14, [0xffd84a, 0xffffff, 0xff9ac8, 0x9ad0ff, 0xffa24a], [0, 0], 70);
    },
  },
  kitchen: {
    pre(r) {
      // ваза с фруктами
      const vx = -26, vz = 8;
      cyl(vx, vz, 2.2, .9, new THREE.MeshStandardMaterial({ color: 0x7fb7d6, roughness: .2, metalness: .1 }));
      const fruit = [[0xe23a24, 1], [0xff9a1e, .95], [0xe8d23a, .9], [0x7fbf3a, .85], [0xe23a24, .9]];
      fruit.forEach(([c, s], i) => { const a = i * 1.3; deco(new THREE.SphereGeometry(.8 * s, 16, 12), new THREE.MeshStandardMaterial({ color: c, roughness: .35 }), vx + Math.cos(a) * 1.1, 1.5 + (i === 4 ? .9 : 0), vz + Math.sin(a) * 1.1); });
      const banana = deco(new THREE.TorusGeometry(1.2, .28, 8, 20, Math.PI * .8), new THREE.MeshStandardMaterial({ color: 0xf2d24a, roughness: .5 }), vx, 2.2, vz + .3); banana.rotation.set(-1.2, 0, .3);
      solid(vx, vz, 3.6, 2.6, 3.6);
    },
    post(r) {
      // солнечные лучи из окна и пятно солнца на столе
      for (let i = 0; i < 5; i++) {
        // луч: верх у окна яркий, к столу гаснет
        const geo = new THREE.PlaneGeometry(6, 70); geo.translate(0, -35, 0);
        const b = new THREE.Mesh(geo, fxAdd(FX.beamTex, 0xfff0c8, .16)); b.material.side = THREE.DoubleSide;
        b.position.set(-18 + i * 9, 36, -75); b.rotation.set(-.95, 0, (i - 2) * .05); mapGroup.add(b);
      }
      decal(46, 22, fxAdd(FX.sunPatchTex, 0xffe2a8, .35), 0, -24, .03, 0);
      puffs(0, 3.4, 0, 6, 3, .5, .3, .35, .35); // пар над чаем
      butterflies(r, 3, [0x222222], [0, 0], 30, 3, 7);  // мухи :)
    },
  },
  greenhouse: {
    pre(r) {},
    post(r) {
      sunGlow(); puffyClouds(r, 8);
      // гирлянда-огоньки под коньком и вдоль балок
      const bulbs = [];
      const bulbMats = [0xfff0b0, 0xffc8e0, 0xc8f0ff].map(c => new THREE.MeshBasicMaterial({ color: c }));
      for (let x = -44; x <= 44; x += 2.2) {
        const sag = Math.sin((x + 44) / 88 * Math.PI * 6) * .25;
        bulbs.push(deco(new THREE.SphereGeometry(.09, 8, 6), bulbMats[bulbs.length % 3], x, 10.6 - Math.abs(sag), 0, false));
      }
      mapAnims.push((dt, t) => bulbs.forEach((b, i) => b.visible = Math.sin(t * 2 + i * 1.7) > -.6));
      // цветы на горшках вокруг центра
      const petals = [0xff7fa8, 0xffd84a, 0xffffff, 0xb48bff];
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2, x = Math.cos(a) * 5, z = Math.sin(a) * 5;
        for (let k = 0; k < 4; k++) deco(new THREE.SphereGeometry(.16, 8, 6), new THREE.MeshStandardMaterial({ color: petals[(i + k) % 4], roughness: .5 }), x + (r() - .5) * .8, 1.9 + r() * .3, z + (r() - .5) * .8, false);
      }
      // лужицы после полива
      const puddle = new THREE.MeshStandardMaterial({ color: 0x5c7a86, roughness: .05, metalness: .5, transparent: true, opacity: .7, envMap });
      for (let i = 0; i < 8; i++) { const p = decal(1, 1, puddle, (r() - .5) * 70, (r() - .5) * 70, .02); p.geometry.dispose(); p.geometry = new THREE.CircleGeometry(.8 + r() * 1.2, 20); p.scale.set(1, .6 + r() * .4, 1); }
      butterflies(r, 10, [0xffc21a], [0, 0], 60, .8, 2.5); // пчёлы
      butterflies(r, 5, [0xffffff, 0xff9ac8], [0, 0], 60);
    },
  },
  factory: {
    pre(r) {},
    post(r) {
      // пятна света от ламп
      const pool = fxAdd(FX.poolTex, 0xfff0cc, .55);
      for (const [x, z] of [[-24, -20], [0, -20], [24, -20], [-24, 20], [0, 20], [24, 20], [-24, 0], [24, 0]]) decal(15, 15, pool, x, z, .03);
      // лужи рассола и масляные пятна
      const brine = new THREE.MeshStandardMaterial({ color: 0x8fa84a, roughness: .05, metalness: .4, transparent: true, opacity: .6, envMap });
      for (let i = 0; i < 7; i++) { const p = decal(1, 1, brine, (r() - .5) * 80, (r() - .5) * 80, .025); p.geometry.dispose(); p.geometry = new THREE.CircleGeometry(.7 + r(), 18); p.scale.set(1, .5 + r() * .5, 1); }
      const stain = new THREE.MeshBasicMaterial({ map: FX.stainTex, transparent: true, opacity: .55, depthWrite: false });
      for (let i = 0; i < 14; i++) decal(1.5 + r() * 2.5, 1.2 + r() * 2, stain, (r() - .5) * 86, (r() - .5) * 86, .02, r() * 6);
      // искры из пресса
      let sparkT = 0;
      mapAnims.push(dt => { sparkT -= dt; if (sparkT <= 0) { sparkT = 1 + Math.random() * 1.8; burst(new THREE.Vector3(-24 + (Math.random() - .5) * 4, 5.2, 36), 0xffb040, 16, 6, .6); } });
      // вращающийся маячок на бытовке
      const bx = 24, by = 3.65, bz = -38;
      deco(new THREE.CylinderGeometry(.25, .3, .2, 12), MM.black, bx, by + .1, bz);
      deco(new THREE.SphereGeometry(.22, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff8a1e }), bx, by + .35, bz, false);
      const beacon = new THREE.Group(); beacon.position.set(bx, by + .35, bz); mapGroup.add(beacon);
      for (const s of [0, Math.PI]) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.6, 9, 16, 1, true), fxAdd(null, 0xff8a1e, .12)); c.geometry.translate(0, -4.5, 0); c.rotation.set(Math.PI / 2, 0, s); c.rotation.order = 'YXZ'; const h = new THREE.Group(); h.rotation.y = s; h.add(c); c.rotation.set(-Math.PI / 2 + .12, 0, 0); beacon.add(h); }
      mapAnims.push(dt => { beacon.rotation.y += dt * 3.5; });
      puffs(-24, 6.5, 38, 5, 4, .6, .35, .3, .4); // пар из пресса
    },
  },
};

// встраиваем поверх построек: fxPre → (постройки → основа → декор) → fxPost → общий слой
for (const [k, fx] of Object.entries(FXMAPS)) {
  const base = MAPS[k].build;
  MAPS[k].build = function (r) { fx.pre(r); base.call(this, r); fx.post(r); contactShadows(); mottleGround(k); applyLights(k); };
}
