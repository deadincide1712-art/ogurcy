// ================= Огуречные Шокеры — карты =================
// ---------- текстуры карт ----------
const texTable = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#c99a62'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 64) {
    g.fillStyle = y % 128 ? '#c59258' : '#cfa46c'; g.fillRect(0, y + 2, w, 60);
    g.fillStyle = 'rgba(70,40,15,.55)'; g.fillRect(0, y, w, 2);
    for (let i = 0; i < 14; i++) { g.strokeStyle = 'rgba(120,70,30,.25)'; g.beginPath(); const yy = y + 6 + Math.random() * 52; g.moveTo(0, yy); g.bezierCurveTo(80, yy + 4, 170, yy - 4, 256, yy); g.stroke(); }
  }
}, 9);
const texTiles = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#b7c9c0'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f4f7f2' : '#dcefe6'; g.fillRect(x * 32 + 2, y * 32 + 2, 28, 28); }
}, 24, 2);
const texPaver = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#5b5f4c'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const v = 120 + Math.random() * 30; g.fillStyle = `rgb(${v},${v + 8},${v - 12})`; g.fillRect(x * 32 + 2 + (y % 2) * 16, y * 32 + 2, 28, 28);
  }
  for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(60,110,40,.5)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
}, 22);
const texConcrete = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#8f9493'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 3000; i++) { const v = 110 + Math.random() * 60; g.fillStyle = `rgba(${v},${v},${v},.35)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  g.strokeStyle = 'rgba(40,40,40,.35)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
}, 12);
const texCorr = canvasTex(64, 64, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 16, 0);
  gr.addColorStop(0, '#5d6d73'); gr.addColorStop(.5, '#a9b6ba'); gr.addColorStop(1, '#5d6d73');
  for (let x = 0; x < w; x += 16) { g.save(); g.translate(x, 0); g.fillStyle = gr; g.fillRect(0, 0, 16, h); g.restore(); }
}, 60, 2);
const texHazard = canvasTex(64, 64, (g, w, h) => {
  g.fillStyle = '#f1c22e'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1b1b';
  for (let i = -2; i < 4; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32 + 16, 0); g.lineTo(i * 32 + 16 + 64, 64); g.lineTo(i * 32 + 64, 64); g.fill(); }
}, 8, 1);
const texMetalCrate = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#4f6b73'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2d3e44'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
  for (let y = 20; y < h - 10; y += 14) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(10, y, w - 20, 3); }
  g.fillStyle = 'rgba(240,230,190,.85)'; g.font = 'bold 20px Rubik, sans-serif'; g.textAlign = 'center'; g.fillText('ОГУРЦЫ', 64, 70);
});
const texSugar = canvasTex(64, 64, (g, w, h) => {
  g.fillStyle = '#f7f6f0'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(200,200,190,.6)' : 'rgba(255,255,255,.9)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
});
const texCardboard = canvasTex(128, 64, (g, w, h) => {
  g.fillStyle = '#b89569'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 6) { g.fillStyle = 'rgba(90,60,30,.18)'; g.fillRect(x, 0, 2, h); }
  g.fillStyle = 'rgba(60,40,20,.8)'; g.font = 'bold 16px Rubik, sans-serif'; g.fillText('ЯЙЦА С0 · 10 шт', 8, 38);
});
const texVine = canvasTex(128, 64, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * w, y = Math.random() * h;
    g.fillStyle = Math.random() < .5 ? '#3f8f25' : '#5fae34'; g.beginPath(); g.ellipse(x, y, 7, 4, Math.random() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 6; i++) { g.fillStyle = '#e8412c'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 4, 0, 7); g.fill(); }
  g.strokeStyle = '#6b5a2a'; g.lineWidth = 2; for (let x = 8; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}, 6, 1);

const MM = {
  fence: mats.fence, crate: mats.crate, soil: mats.soil, grater: mats.grater,
  grass: new THREE.MeshStandardMaterial({ map: texGrass, roughness: 1 }),
  table: new THREE.MeshStandardMaterial({ map: texTable, roughness: .7 }),
  tiles: new THREE.MeshStandardMaterial({ map: texTiles, roughness: .25, metalness: .05 }),
  board: new THREE.MeshStandardMaterial({ color: 0xe0b77e, map: texTable, roughness: .6 }),
  mug: new THREE.MeshStandardMaterial({ color: 0xd9412e, roughness: .3 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: .35 }),
  steelW: new THREE.MeshStandardMaterial({ color: 0xc9d0d4, metalness: .9, roughness: .2 }),
  black: new THREE.MeshStandardMaterial({ color: 0x1d1d1f, roughness: .5 }),
  woodDark: new THREE.MeshStandardMaterial({ color: 0x5a3519, roughness: .6 }),
  tomato: new THREE.MeshStandardMaterial({ color: 0xe23a24, roughness: .25 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x3f8f25, roughness: .7, flatShading: true }),
  bread: new THREE.MeshStandardMaterial({ color: 0xb8742f, roughness: .8 }),
  egg: new THREE.MeshStandardMaterial({ color: 0xf5ecdc, roughness: .5 }),
  yolk: new THREE.MeshStandardMaterial({ color: 0xffb81c, roughness: .2 }),
  sugar: new THREE.MeshStandardMaterial({ map: texSugar, roughness: .9 }),
  card: new THREE.MeshStandardMaterial({ map: texCardboard, roughness: .95 }),
  paver: new THREE.MeshStandardMaterial({ map: texPaver, roughness: .95 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xd8f5ff, transparent: true, opacity: .22, roughness: .05, metalness: .2, depthWrite: false }),
  frame: new THREE.MeshStandardMaterial({ color: 0xe8ecec, metalness: .6, roughness: .35 }),
  bed: new THREE.MeshStandardMaterial({ color: 0x9a6b3c, map: texFence, roughness: .85 }),
  vine: new THREE.MeshStandardMaterial({ map: texVine, transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .8 }),
  terracotta: new THREE.MeshStandardMaterial({ color: 0xc4623a, roughness: .8 }),
  barrel: new THREE.MeshStandardMaterial({ color: 0x2f79c4, roughness: .45 }),
  sack: new THREE.MeshStandardMaterial({ color: 0x8a7148, roughness: 1 }),
  concrete: new THREE.MeshStandardMaterial({ map: texConcrete, roughness: .9 }),
  corr: new THREE.MeshStandardMaterial({ map: texCorr, metalness: .6, roughness: .45 }),
  vat: new THREE.MeshStandardMaterial({ color: 0xb5bec2, metalness: .85, roughness: .28 }),
  belt: new THREE.MeshStandardMaterial({ color: 0x2a2d2f, roughness: .7 }),
  hazard: new THREE.MeshStandardMaterial({ map: texHazard, roughness: .6 }),
  grating: new THREE.MeshStandardMaterial({ color: 0x6d7a7e, metalness: .7, roughness: .4 }),
  mcrate: new THREE.MeshStandardMaterial({ map: texMetalCrate, metalness: .4, roughness: .5 }),
  redBarrel: new THREE.MeshStandardMaterial({ color: 0xc23b2a, metalness: .3, roughness: .45 }),
};

// ---------- помощники построения ----------
function deco(geo, mat, x, y, z, shadow = true) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; mapGroup.add(m); return m; }
function solid(x, z, w, h, d, y0 = 0) { boxes.push({ min: new THREE.Vector3(x - w / 2, y0, z - d / 2), max: new THREE.Vector3(x + w / 2, y0 + h, z + d / 2) }); }
function cyl(x, z, r, h, mat, y0 = 0, collide = true, seg = 28) {
  const m = deco(new THREE.CylinderGeometry(r, r, h, seg), mat, x, y0 + h / 2, z);
  if (collide) solid(x, z, r * 1.8, h, r * 1.8, y0);
  return m;
}
function bounds(mat, h, castShadow = true) {
  const L = ARENA * 2 + 2;
  [[0, -ARENA - .5, L, 1], [0, ARENA + .5, L, 1], [-ARENA - .5, 0, 1, ARENA * 2], [ARENA + .5, 0, 1, ARENA * 2]]
    .forEach(([x, z, w, d]) => { const m = addBox(x, z, w, h, d, 0, mat); m.castShadow = castShadow; });
}
function scatter(r, n, make, minR = 9) {
  for (let i = 0; i < n; i++) {
    const s = r() < .5 ? 2 : 1.4;
    let x, z, ok, tries = 0;
    do {
      x = (r() * 2 - 1) * (ARENA - 4); z = (r() * 2 - 1) * (ARENA - 4);
      ok = Math.hypot(x, z) > minR && !boxes.some(b => x + s / 2 + 1.3 > b.min.x && x - s / 2 - 1.3 < b.max.x && z + s / 2 + 1.3 > b.min.z && z - s / 2 - 1.3 < b.max.z);
    } while (!ok && ++tries < 40);
    if (ok) make(x, z, s);
  }
}

// ---------- второй этаж: лестницы и площадки ----------
// ступени от (x,z) в сторону (dx,dz): каждая — сплошная тумба, поэтому по ним просто забегаешь
function steps(x, z, dx, dz, w, y0, y1, mat, run = 1.15) {
  const n = Math.max(1, Math.ceil((y1 - y0) / .42)), rise = (y1 - y0) / n;   // ступенька не выше, чем можно перешагнуть
  for (let i = 0; i < n; i++) addBox(x + dx * (i + .5) * run, z + dz * (i + .5) * run, dx ? run : w, y0 + (i + 1) * rise, dz ? run : w, 0, mat);
  return [x + dx * n * run, z + dz * n * run];
}
// площадка с перилами; в open перечислены стороны без перил: n s e w
function deck(x, z, w, d, y, mat, open = '', rail = MM.hazard) {
  addBox(x, z, w, .4, d, y - .4, mat);
  if (!open.includes('n')) addBox(x, z - d / 2 + .12, w, 1, .24, y, rail);
  if (!open.includes('s')) addBox(x, z + d / 2 - .12, w, 1, .24, y, rail);
  if (!open.includes('w')) addBox(x - w / 2 + .12, z, .24, 1, d, y, rail);
  if (!open.includes('e')) addBox(x + w / 2 - .12, z, .24, 1, d, y, rail);
}

function clouds(r, color = 0xffffff) {
  for (let i = 0; i < 14; i++) {
    const c = deco(new THREE.SphereGeometry(4 + r() * 5, 8, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .85, fog: false }), (r() - .5) * 260, 45 + r() * 25, (r() - .5) * 260, false);
    c.scale.set(2.2, .5, 1.2);
  }
}

// ---------- сами карты ----------
const MAPS = {
  garden: {
    name: 'Грядка №7', hint: 'Огород стал больше: сеновал с помостом, парники, подсолнухи, тыквы, ульи и пугало.',
    sky: 0xa9dcf2, fog: 0xc6e8d8, fogFar: 130, sun: 0xfff1cf, ground: MM.grass, poleY: 4,
    build(r) {
      bounds(MM.fence, 4.2);
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const x = i * 11 + 2;
        addBox(x, -30, 2.2, .35, 14, 0, MM.soil); addBox(x, 30, 2.2, .35, 14, 0, MM.soil);
        for (let k = -5; k <= 5; k += 2.5) { const l = deco(new THREE.IcosahedronGeometry(.55, 0), MM.leaf, x + (r() - .5), .6, (i % 2 ? 30 : -30) + k); l.scale.y = .6; }
      }
      [[0, 0, 0], [2, 0, 0], [-2, 0, 0], [0, 2, 0], [0, -2, 0], [2, 2, 0], [0, 0, 2], [-2, -2, 0], [0, 2, 2]].forEach(([x, z, y]) => addBox(x, z, 2, 2, 2, y, MM.crate));
      addBox(-14, 0, .5, 3.6, 9, 0, MM.grater); addBox(14, 0, .5, 3.6, 9, 0, MM.grater);
      addBox(0, -15, 9, 3.6, .5, 0, MM.grater); addBox(0, 15, 9, 3.6, .5, 0, MM.grater);
      [[-26, -18], [26, 18], [-26, 18], [26, -18]].forEach(([x, z]) => addJar(x, z, 1.7, 4.4, r));
      scatter(r, 44, (x, z, s) => { addBox(x, z, s, s, s, 0, MM.crate); if (r() < .3) addBox(x, z, s * .8, s * .8, s * .8, s, MM.crate); }, 8);
      gardenExtra(r);
      clouds(r);
    },
  },

  kitchen: {
    name: 'Кухня', hint: 'Огромный стол: кружка в центре, кастрюля, тёрка-башня и полка-антресоль под потолком — туда ведут стопки книг.',
    sky: 0xf1e3cb, fog: 0xefdfc6, fogFar: 150, sun: 0xfff4e0, ground: MM.table, poleY: 3.4,
    build(r) {
      bounds(MM.tiles, 6.5);
      // разделочная доска и кружка в центре
      addBox(0, 0, 14, .4, 9, 0, MM.board);
      cyl(0, 0, 1.7, 3, MM.mug, .4);
      const handle = deco(new THREE.TorusGeometry(.8, .22, 10, 20), MM.mug, 1.9, 1.9, 0); handle.rotation.y = Math.PI / 2; handle.scale.set(1, 1.1, 1);
      deco(new THREE.CylinderGeometry(1.55, 1.55, .05, 28), new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: .1 }), 0, 3.35, 0); // чай в кружке
      // солонка и перечница
      cyl(-15, 0, 1.3, 4.5, MM.white); cyl(-15, 0, 1.35, .7, MM.steelW, 4.5);
      for (let i = 0; i < 5; i++) deco(new THREE.CylinderGeometry(.12, .12, .05, 8), MM.black, -15 + Math.cos(i * 1.26) * .6, 5.23, Math.sin(i * 1.26) * .6, false);
      cyl(15, 0, 1.1, 5.2, MM.woodDark); deco(new THREE.SphereGeometry(.6, 14, 10), MM.woodDark, 15, 5.5, 0);
      // тарелки с помидорами
      [[-24, -24], [24, 24], [-24, 22], [24, -22]].forEach(([x, z], i) => {
        cyl(x, z, 3.3, .3, MM.white);
        if (i % 2 === 0) {
          deco(new THREE.SphereGeometry(1.5, 22, 16), MM.tomato, x + .6, 1.7, z).scale.y = .85;
          deco(new THREE.ConeGeometry(.5, .35, 5), MM.leaf, x + .6, 3, z);
          solid(x + .6, z, 2.6, 3, 2.6, .3);
        } else {
          for (let k = 0; k < 3; k++) { const sl = deco(new THREE.CylinderGeometry(1.3, 1.3, .25, 20), MM.tomato, x - 1 + k * 1.1, .45 + k * .06, z + (k - 1) * .6); sl.rotation.z = .1; }
        }
      });
      // огромный нож и подставка
      addBox(-2, -26, 16, .3, 2.4, 0, MM.steelW); addBox(8.5, -26, 5, .7, 1.4, 0, MM.black);
      addBox(-32, -4, 4, 5, 3, 0, MM.woodDark);
      for (let i = 0; i < 4; i++) deco(new THREE.CylinderGeometry(.25, .3, 1.8, 10), MM.black, -33.2 + i * .8, 5.8, -4 + (i % 2) * .6);
      // батон
      const loaf = deco(new THREE.SphereGeometry(1, 24, 14), MM.bread, 30, 1.5, 4); loaf.scale.set(4.2, 1.6, 2.1); solid(30, 4, 8.2, 3, 4);
      for (let i = -2; i <= 2; i++) { const c = deco(new THREE.BoxGeometry(.2, .15, 3), new THREE.MeshStandardMaterial({ color: 0xe3b574 }), 30 + i * 1.5, 3.05, 4, false); c.rotation.y = .5; }
      // коробка яиц — привет Shell Shockers
      addBox(-4, 30, 10, 1.1, 4, 0, MM.card, true); solid(-4, 30, 10, 2.3, 4);
      for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { if (i === 3 && j === 1) continue; const e = deco(new THREE.SphereGeometry(.7, 16, 12), MM.egg, -8 + i * 2, 1.45, 29 + j * 2); e.scale.y = 1.3; }
      deco(new THREE.CircleGeometry(1.4, 24), MM.white, 4, .02, 34).rotation.x = -Math.PI / 2;
      deco(new THREE.SphereGeometry(.55, 16, 10), MM.yolk, 4, .05, 34).scale.y = .35;
      // рассыпанный сахар
      scatter(r, 22, (x, z, s) => { const m = addBox(x, z, s, s, s, 0, MM.sugar); m.rotation.y = 0; });
      addJar(26, -34, 1.6, 4.2, r); addJar(-30, 30, 1.6, 4.2, r);
      kitchenExtra(r);
    },
  },

  greenhouse: {
    name: 'Теплица', hint: 'Стеклянная теплица: двухъярусные стеллажи, перегородка с проходами, кашпо и кукуруза по углам.',
    sky: 0xcdeee0, fog: 0xd3ecdf, fogFar: 120, sun: 0xf6ffe8, ground: MM.paver, poleY: 2.6,
    build(r) {
      // стеклянные стены с рамой
      bounds(MM.glass, 6.5, false);
      for (let t = -ARENA; t <= ARENA; t += 8) {
        for (const [x, z] of [[t, -ARENA - .5], [t, ARENA + .5], [-ARENA - .5, t], [ARENA + .5, t]]) deco(new THREE.BoxGeometry(.3, 6.6, .3), MM.frame, x, 3.3, z);
      }
      for (let x = -ARENA; x <= ARENA; x += 11.5) { deco(new THREE.BoxGeometry(.3, .3, ARENA * 2), MM.frame, x, 9, 0, false); }
      deco(new THREE.BoxGeometry(ARENA * 2, .4, .4), MM.frame, 0, 11, 0, false);
      // высокие грядки рядами
      for (const z of [-32, -19, 19, 32]) for (const cx of [-22, 22]) {
        addBox(cx, z, 20, 1.1, 2.8, 0, MM.bed);
        deco(new THREE.BoxGeometry(19.4, .08, 2.4), MM.soil, cx, 1.12, z, false);
        if (Math.abs(z) === 19) {
          // шпалера с томатами — высокая стенка-укрытие
          const v = deco(new THREE.PlaneGeometry(18, 3), MM.vine, cx, 2.6, z); v.castShadow = true;
          solid(cx, z, 18, 3, .3, 1.1);
          for (let k = -9; k <= 9; k += 3) deco(new THREE.CylinderGeometry(.08, .08, 3.2, 6), MM.woodDark, cx + k, 2.7, z);
        } else {
          for (let k = -8; k <= 8; k += 2.7) { const l = deco(new THREE.IcosahedronGeometry(.6, 0), MM.leaf, cx + k, 1.6, z); l.scale.y = .7; if (r() < .5) deco(new THREE.SphereGeometry(.22, 10, 8), MM.tomato, cx + k + .3, 1.5, z + .4); }
        }
      }
      // горшок в центре
      cyl(0, 0, 2.4, 2.4, MM.terracotta); cyl(0, 0, 2.7, .4, MM.terracotta, 2.2, false);
      deco(new THREE.CylinderGeometry(2.3, 2.3, .06, 28), MM.soil, 0, 2.61, 0, false);
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; cyl(Math.cos(a) * 5, Math.sin(a) * 5, .7, 1.1, MM.terracotta); deco(new THREE.IcosahedronGeometry(.6, 0), MM.leaf, Math.cos(a) * 5, 1.5, Math.sin(a) * 5); }
      // бочки с водой и мешки земли
      [[-41, 12], [41, -12], [-12, -8], [12, 8], [-30, -44 + 6], [30, 44 - 6]].forEach(([x, z]) => { cyl(x, z, 1.1, 2.3, MM.barrel); deco(new THREE.CylinderGeometry(1, 1, .05, 24), new THREE.MeshStandardMaterial({ color: 0x5d9fd6, roughness: .05 }), x, 2.2, z, false); });
      scatter(r, 24, (x, z) => { const m = addBox(x, z, 2.2, 1, 1.5, 0, MM.sack); m.rotation.y = 0; if (r() < .4) addBox(x, z, 2, .9, 1.4, 1, MM.sack); });
      greenhouseExtra(r);
    },
  },

  factory: {
    name: 'Засолочный цех', hint: 'Два этажа: внизу конвейеры и чаны, наверху галерея по периметру, мостики и стеклянная диспетчерская.',
    sky: 0x9fb0b4, fog: 0xa6b5b8, fogFar: 110, sun: 0xf0f4ff, ground: MM.concrete, poleY: 3,
    build(r) {
      bounds(MM.corr, 7);
      // будка оператора в центре
      addBox(0, 0, 5, 3, 5, 0, MM.mcrate);
      deco(new THREE.BoxGeometry(5.4, .15, 5.4), MM.hazard, 0, 3.07, 0, false);
      for (const [x, z, w, d] of [[0, -7.4, 15, .3], [0, 7.4, 15, .3], [-7.4, 0, .3, 15], [7.4, 0, .3, 15]]) deco(new THREE.BoxGeometry(w, .03, d), MM.hazard, x, .02, z, false);
      // конвейеры с баночками
      for (const x of [-13, 13]) {
        addBox(x, 0, 2.4, 1.1, 30, 0, MM.belt);
        deco(new THREE.BoxGeometry(2.6, .12, 30.2), MM.hazard, x, 1.13, 0, false);
        for (let z = -13; z <= 13; z += 3.2) {
          const j = new THREE.Group(); j.position.set(x, 1.19, z);
          const gl = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .9, 16), jarBrine); gl.position.y = .45;
          const lid = new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, .12, 16), lidMat); lid.position.y = .95;
          j.add(gl, lid); mapGroup.add(j);
        }
      }
      // чаны с рассолом
      for (const [x, z] of [[-31, -28], [31, 28], [-31, 28], [31, -28]]) {
        cyl(x, z, 3.3, 5.5, MM.vat);
        deco(new THREE.TorusGeometry(3.3, .15, 8, 32), MM.grating, x, 5.5, z).rotation.x = Math.PI / 2;
        deco(new THREE.CylinderGeometry(3.15, 3.15, .05, 32), new THREE.MeshStandardMaterial({ color: 0xc9d56a, roughness: .1 }), x, 5.3, z, false);
        const pipe = deco(new THREE.CylinderGeometry(.35, .35, 12, 12), MM.vat, x + Math.sign(x) * 6, 6.3, z); pipe.rotation.z = Math.PI / 2;
      }
      // мостки на высоте со ступенями из ящиков
      for (const z of [-20, 20]) {
        addBox(0, z, 30, .35, 3, 3, MM.grating);
        for (const s of [-1, 1]) { deco(new THREE.BoxGeometry(30, .08, .08), MM.hazard, 0, 4.2, z + s * 1.45, false); }
        for (let x = -13; x <= 13; x += 6.5) addBox(x, z, .35, 3, .35, 0, MM.grating);
        for (const s of [-1, 1]) { addBox(s * 16, z, 2, 2.2, 2.6, 0, MM.mcrate); addBox(s * 18, z, 2, 1.1, 2.6, 0, MM.mcrate); }
      }
      // бочки и ящики
      [[-6, -36], [6, 36], [-40, -8], [40, 8]].forEach(([x, z]) => { for (let k = 0; k < 3; k++) cyl(x + (k % 2) * 1.7, z + k * 1.5, .8, 1.7, k % 2 ? MM.redBarrel : MM.barrel); });
      scatter(r, 18, (x, z, s) => { addBox(x, z, s, s, s, 0, MM.mcrate); if (r() < .35) addBox(x, z, s * .85, s * .85, s * .85, s, MM.mcrate); });
      addJar(-40, -40, 1.8, 4.6, r); addJar(40, 40, 1.8, 4.6, r);
      factoryExtra(r);
    },
  },
};

// Грядка №7: сеновал с помостом, парники, подсолнухи, ульи и пугало
function gardenExtra(r) {
  const hay = new THREE.MeshStandardMaterial({ color: 0xd9b34a, roughness: 1 });
  const straw = new THREE.MeshStandardMaterial({ color: 0xc79b3a, roughness: 1 });
  const pumpkin = new THREE.MeshStandardMaterial({ color: 0xe07c1e, roughness: .55 });
  const petal = new THREE.MeshStandardMaterial({ color: 0xffc72c, roughness: .6, side: THREE.DoubleSide });
  const core = new THREE.MeshStandardMaterial({ color: 0x5a3a18, roughness: .8 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0xb0453a, roughness: .9 });

  // сеновал: навес на столбах, сверху помост, наверх — лестница из тюков
  const bx = -47, bz = -42;
  for (const [sx, sz] of [[-7, -5], [7, -5], [-7, 5], [7, 5]]) addBox(bx + sx, bz + sz, .7, 5, .7, 0, MM.woodDark);
  deck(bx, bz, 16, 12, 5, MM.bed, 's');
  const roof = deco(new THREE.BoxGeometry(18, .5, 14), MM.bed, bx, 8.4, bz); roof.rotation.x = .12;
  for (const [sx, sz] of [[-8, -6], [8, -6], [-8, 6], [8, 6]]) addBox(bx + sx, bz + sz, .5, 3.2, .5, 5, MM.woodDark);
  steps(bx, bz + 18, 0, -1, 4.5, 0, 5, hay);
  for (let i = 0; i < 4; i++) addBox(bx - 5.5 + (i % 2) * 11, bz - 3 + Math.floor(i / 2) * 6, 3, 1.6, 2, 5, hay);
  for (let i = 0; i < 5; i++) addBox(bx + 12 + (i % 2) * 3.2, bz + 9 + Math.floor(i / 2) * 2.2, 3, 1.6, 2, (i % 2) * 1.6, hay);

  // подсолнухи вдоль дальнего забора
  for (let x = -50; x <= 50; x += 6.5) {
    const h = 5 + r() * 2.2, z = ARENA - 4 - r() * 2;
    deco(new THREE.CylinderGeometry(.13, .18, h, 7), MM.leaf, x, h / 2, z);
    const head = deco(new THREE.CircleGeometry(1.2, 16), core, x, h, z - .12); head.rotation.x = -.25;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const p = deco(new THREE.CircleGeometry(.55, 6), petal, x + Math.cos(a) * 1.3, h + Math.sin(a) * 1.3, z - .2, false); p.rotation.x = -.25; p.scale.y = 1.6; }
    for (const s of [-1, 1]) { const l = deco(new THREE.CircleGeometry(.9, 5), MM.leaf, x + s * .8, h * .55, z, false); l.rotation.set(-.2, 0, s); l.scale.y = .5; }
  }

  // парники-дуги: внутрь можно забежать и спрятаться
  for (const [px, pz, rot] of [[46, -18, 0], [-46, 18, 0], [20, 48, Math.PI / 2]]) {
    for (let i = -3; i <= 3; i++) {
      const arc = deco(new THREE.TorusGeometry(3, .12, 6, 14, Math.PI), MM.frame, px + (rot ? 0 : i * 2), 0, pz + (rot ? i * 2 : 0));
      arc.rotation.set(0, rot, 0);
    }
    const film = deco(new THREE.CylinderGeometry(3.1, 3.1, 13, 16, 1, true, 0, Math.PI), MM.glass, px, 0, pz);
    film.rotation.set(Math.PI / 2, 0, rot ? Math.PI / 2 : 0); film.renderOrder = 2;
    addBox(px + (rot ? 0 : -7), pz + (rot ? -7 : 0), rot ? 6.2 : .4, 3, rot ? .4 : 6.2, 0, MM.bed);
    for (let k = -5; k <= 5; k += 2.4) deco(new THREE.IcosahedronGeometry(.7, 0), MM.leaf, px + (rot ? k : 0) + (rot ? 0 : (r() - .5)), .8, pz + (rot ? 0 : k));
  }

  // тыквенная грядка
  for (let i = 0; i < 9; i++) {
    const x = -52 + (i % 3) * 5, z = 30 + Math.floor(i / 3) * 5.5, rr = 1 + r() * .7;
    const p = deco(new THREE.SphereGeometry(rr, 14, 10), pumpkin, x, rr * .8, z); p.scale.y = .8;
    deco(new THREE.CylinderGeometry(.12, .16, .6, 6), MM.leaf, x, rr * 1.5, z);
    solid(x, z, rr * 1.8, rr * 1.6, rr * 1.8);
  }

  // пугало, тачка, ульи, поленница, компост
  const sc = new THREE.Group(); sc.position.set(2, 0, -50); mapGroup.add(sc);
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, 6, 8), MM.woodDark)).position.y = 3;
  const arms = new THREE.Mesh(new THREE.BoxGeometry(5, .22, .22), MM.woodDark); arms.position.y = 4.2; sc.add(arms);
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 1), cloth); body.position.y = 3.6; sc.add(body);
  const headM = new THREE.Mesh(new THREE.SphereGeometry(.85, 14, 10), straw); headM.position.y = 5.5; sc.add(headM);
  const hat = new THREE.Mesh(new THREE.ConeGeometry(1.3, .9, 12), straw); hat.position.y = 6.2; sc.add(hat);
  sc.traverse(o => { if (o.isMesh) o.castShadow = true; });
  solid(2, -50, 2.4, 6, 1.4);

  for (const [wx, wz] of [[-30, -50], [34, 46]]) {
    addBox(wx, wz, 3.4, 1.6, 2.2, .6, MM.bed);
    for (const s of [-1, 1]) { const wh = deco(new THREE.TorusGeometry(.8, .16, 8, 18), MM.black, wx + s * 1.8, .8, wz); wh.rotation.y = Math.PI / 2; }
    for (let i = 0; i < 4; i++) deco(new THREE.IcosahedronGeometry(.5, 0), MM.leaf, wx - 1 + (i % 2) * 1.2, 2.3, wz + (i < 2 ? -.5 : .5));
  }
  for (const [hx, hz] of [[52, 34], [52, 40], [46, 37]]) {
    for (let k = 0; k < 3; k++) addBox(hx, hz, 2.4, .9, 2.4, k * .9, k === 2 ? MM.white : new THREE.MeshStandardMaterial({ color: 0xe8d08a, roughness: .7 }));
    deco(new THREE.BoxGeometry(2.8, .25, 2.8), MM.woodDark, hx, 2.85, hz);
  }
  for (let i = 0; i < 14; i++) { const lg = deco(new THREE.CylinderGeometry(.35, .35, 4, 8), MM.woodDark, -54, .4 + Math.floor(i / 5) * .75, -12 + (i % 5) * .8); lg.rotation.z = Math.PI / 2; }
  solid(-54, -10.4, 4, 2.5, 4.6);
  addBox(52, -46, 6, 2.2, 6, 0, MM.bed);
  deco(new THREE.BoxGeometry(5.6, .3, 5.6), MM.soil, 52, 2.3, -46, false);
}

// Кухня: антресоль-второй этаж вдоль стен, кастрюля, тёрка-башня и куча посуды
function kitchenExtra(r) {
  const steel = MM.steelW, glassJar = new THREE.MeshStandardMaterial({ color: 0xdff2ff, transparent: true, opacity: .35, roughness: .05, metalness: .2 });
  const pasta = new THREE.MeshStandardMaterial({ color: 0xe8c05a, roughness: .8 });
  const garlic = new THREE.MeshStandardMaterial({ color: 0xf3ece0, roughness: .6 });
  const oil = new THREE.MeshStandardMaterial({ color: 0xc8a11e, transparent: true, opacity: .8, roughness: .1 });

  // ---------- второй этаж: полка-антресоль вдоль двух стен ----------
  const Y = 6.2;
  deck(0, -ARENA + 7, ARENA * 2 - 14, 12, Y, MM.board, 's');       // длинная полка у дальней стены
  deck(-ARENA + 7, 6, 12, 44, Y, MM.board, 'e');                   // боковая полка
  addBox(-ARENA + 13, -ARENA + 12, 6, .4, 8, Y - .4, MM.board);    // угловой стык
  // подпорки
  for (let x = -44; x <= 44; x += 11) addBox(x, -ARENA + 7, .8, Y - .4, .8, 0, MM.woodDark);
  for (let z = -14; z <= 28; z += 11) addBox(-ARENA + 7, z, .8, Y - .4, .8, 0, MM.woodDark);
  // наверх: стопки книг рецептов и ящики
  steps(-14, -29, 0, -1, 5, 0, Y, MM.card);        // стопки книг рецептов
  steps(-29, 24, -1, 0, 5, 0, Y, MM.woodDark);     // ящики у боковой полки
  // на полке: банки с крупой, специи, укрытия
  for (let i = 0; i < 9; i++) {
    const x = -40 + i * 10, R = 1.5;
    cyl(x, -ARENA + 5, R, 3.4, glassJar, Y);
    deco(new THREE.CylinderGeometry(R + .1, R + .1, .3, 20), steel, x, Y + 3.5, -ARENA + 5, false);
    deco(new THREE.CylinderGeometry(R - .2, R - .2, 2.4, 18), i % 2 ? pasta : MM.sugar, x, Y + 1.3, -ARENA + 5, false);
  }
  for (let i = 0; i < 4; i++) addBox(-ARENA + 7, -4 + i * 11, 4, 2.4, 4, Y, MM.card);
  addBox(18, -ARENA + 9, 8, 2.6, 5, Y, MM.woodDark);

  // ---------- кастрюля: в неё можно забежать по половнику ----------
  const px = -40, pz = 36;
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; addBox(px + Math.cos(a) * 7, pz + Math.sin(a) * 7, 2, 4.5, 2, 0, steel); }
  deco(new THREE.CylinderGeometry(7, 6.6, 4.6, 32, 1, true), steel, px, 2.3, pz).material.side = THREE.DoubleSide;
  deco(new THREE.CylinderGeometry(6.4, 6.4, .1, 28), new THREE.MeshStandardMaterial({ color: 0xcfe08a, roughness: .2 }), px, 3.4, pz, false);
  for (const s of [-1, 1]) { const h = deco(new THREE.TorusGeometry(1.6, .32, 8, 16, Math.PI), steel, px + s * 8, 3.4, pz); h.rotation.set(Math.PI / 2, 0, 0); }
  steps(px + 12, pz, -1, 0, 4, 0, 4.6, steel);
  // крышка прислонена рядом
  const lid = deco(new THREE.CylinderGeometry(7, 7, .4, 28), steel, px + 14, 4, pz + 10); lid.rotation.z = 1.2; solid(px + 14, pz + 10, 4, 8, 12);

  // ---------- тёрка-башня ----------
  addBox(44, -34, 7, 12, 5, 0, MM.grater);
  deco(new THREE.BoxGeometry(7.4, .5, 5.4), MM.black, 44, 12.2, -34);
  steps(44, -27, 0, -1, 5, 0, 5.4, MM.woodDark);
  deck(44, -28.5, 7, 4, 5.8, MM.board, 'n');

  // ---------- бутылка масла, макароны, чеснок, дуршлаг, тостер ----------
  cyl(-20, 44, 2.2, 7, oil); cyl(-20, 44, 1, 2.2, oil, 7); cyl(-20, 44, 1.2, .6, MM.black, 9.2, false);
  addBox(-4, 46, 5, 8, 3, 0, MM.card);
  for (let i = 0; i < 12; i++) deco(new THREE.CylinderGeometry(.18, .18, 7, 6), pasta, -6 + (i % 4) * .9, 4, 45 + Math.floor(i / 4) * .8, false);
  for (let i = 0; i < 7; i++) { const x = 24 + (i % 4) * 2.4, z = 40 + Math.floor(i / 4) * 2.4; const gl = deco(new THREE.SphereGeometry(1.1, 14, 10), garlic, x, .9, z); gl.scale.y = .85; deco(new THREE.ConeGeometry(.3, .8, 6), garlic, x, 1.9, z, false); solid(x, z, 2, 1.8, 2); }
  const col = deco(new THREE.SphereGeometry(4, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), steel, 34, 0, -46); col.rotation.x = Math.PI; col.position.y = 4; col.material.side = THREE.DoubleSide; solid(34, -46, 7, 4, 7);
  addBox(-46, -30, 8, 5, 5, 0, MM.white); for (const s of [-1, 1]) deco(new THREE.BoxGeometry(2.6, .2, 4), MM.black, -46 + s * 1.8, 5.1, -30, false);
  // вилка-мостик: по ней можно забежать на полку
  const fork = deco(new THREE.BoxGeometry(3, .35, 16), steel, 30, 3.4, 20); fork.rotation.x = -.35; solid(30, 20, 3.4, 3, 15);
  for (let i = 0; i < 4; i++) deco(new THREE.BoxGeometry(.5, .3, 5), steel, 28.9 + i * .7, 6, 12.5, false);
}

// Теплица: двухъярусные стеллажи, перегородка, кашпо и садовый инвентарь
function greenhouseExtra(r) {
  const rack = new THREE.MeshStandardMaterial({ color: 0x7b8a72, metalness: .5, roughness: .5 });
  const pot = MM.terracotta, seedling = MM.leaf;
  const water = new THREE.MeshStandardMaterial({ color: 0x5d9fd6, roughness: .1 });

  // стеллажи в два яруса — на верхний можно забраться
  for (const [sx, dirX] of [[-52, 1], [52, -1]]) {
    for (const sz of [-28, 0, 28]) {
      for (const y of [0, 2.8]) {
        addBox(sx, sz, 8, .3, 20, y + 2.5, rack);
        for (let i = 0; i < 6; i++) {
          const x = sx - 2.5 + (i % 2) * 5, z = sz - 8 + Math.floor(i / 2) * 8;
          cyl(x, z, 1, 1.2, pot, y + 2.8, false);
          deco(new THREE.IcosahedronGeometry(.8, 0), seedling, x, y + 4.6, z, false);
        }
      }
      for (const [ox, oz] of [[-3.5, -9], [3.5, -9], [-3.5, 9], [3.5, 9]]) addBox(sx + ox, sz + oz, .4, 5.6, .4, 0, rack);
      if (sz === -28) steps(sx + dirX * 14.4, sz, -dirX, 0, 4.5, 0, 5.6, rack, .8);   // на верхний ярус
    }
  }
  // стеклянная перегородка с двумя проходами
  for (const x of [-38, -14, 14, 38]) { addBox(x, 0, 18, 5.5, .5, 0, MM.glass); addBox(x, 0, 18, .4, .7, 5.5, MM.frame); }
  for (const x of [-47, -29, -5, 5, 29, 47]) addBox(x, 0, .5, 6, .7, 0, MM.frame);

  // подвесные кашпо на раме
  for (let x = -44; x <= 44; x += 8.5) {
    const z = (x / 8.5) % 2 ? 22 : -22;
    deco(new THREE.CylinderGeometry(.05, .05, 4.5, 6), rack, x, 6.8, z, false);
    cyl(x, z, 1.1, 1.1, pot, 4, false);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const v = deco(new THREE.CylinderGeometry(.09, .05, 2.4, 5), seedling, x + Math.cos(a) * .8, 3.2, z + Math.sin(a) * .8, false); v.rotation.set(Math.cos(a) * .4, 0, Math.sin(a) * .4); }
  }
  // лейки, шланг, компост и кукуруза по углам
  for (const [wx, wz] of [[-20, -50], [20, 50], [50, -20]]) {
    cyl(wx, wz, 1.3, 2, water); const sp = deco(new THREE.CylinderGeometry(.25, .45, 3, 10), MM.steelW, wx + 1.6, 2.2, wz); sp.rotation.z = -.9;
    const hd = deco(new THREE.TorusGeometry(.9, .2, 8, 16), MM.steelW, wx - 1.4, 2.4, wz); hd.rotation.y = Math.PI / 2;
  }
  for (let i = 0; i < 3; i++) { const h = deco(new THREE.TorusGeometry(2.6 - i * .35, .28, 8, 26), MM.black, -50, .3 + i * .5, 46); h.rotation.x = Math.PI / 2; }
  for (const [cx, cz] of [[-34, -50], [34, 50], [50, 34], [-50, -34]]) for (let i = 0; i < 5; i++) {
    const x = cx + (i % 3) * 2.2 - 2, z = cz + Math.floor(i / 3) * 2.4, h = 6 + r() * 2;
    deco(new THREE.CylinderGeometry(.16, .22, h, 7), seedling, x, h / 2, z);
    for (let k = 0; k < 5; k++) { const l = deco(new THREE.PlaneGeometry(.8, 3.4), MM.vine, x, h * .45 + k * .7, z, false); l.rotation.set(-.5, k * 1.2, 0); }
    solid(x, z, 1, h, 1);
  }
  scatter(r, 12, (x, z) => { cyl(x, z, 1.2, 1.4, pot); deco(new THREE.IcosahedronGeometry(.9, 0), seedling, x, 2.2, z, false); }, 12);
}

// Засолочный цех: полноценный второй этаж — галерея по периметру, мостики и диспетчерская
function factoryExtra(r) {
  const Y = 6.4;
  const glassW = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: .3, roughness: .05, metalness: .3, depthWrite: false });
  // галерея вдоль всех четырёх стен
  deck(0, -ARENA + 5, ARENA * 2 - 4, 8, Y, MM.grating, 's');   // перила только у стены — внутрь можно спрыгнуть
  deck(0, ARENA - 5, ARENA * 2 - 4, 8, Y, MM.grating, 'n');
  deck(-ARENA + 5, 0, 8, ARENA * 2 - 18, Y, MM.grating, 'e');
  deck(ARENA - 5, 0, 8, ARENA * 2 - 18, Y, MM.grating, 'w');
  // мостики с западной и восточной галереи к центру
  deck(-28, 0, 42, 6, Y, MM.grating, 'we');
  deck(28, 0, 42, 6, Y, MM.grating, 'we');
  // диспетчерская над центральной будкой: стеклянные стены, входы с мостиков
  deck(0, 0, 14, 14, Y, MM.mcrate, 'we');
  for (const [x, z, w, d] of [[-7, -5.2, .4, 3.6], [-7, 5.2, .4, 3.6], [7, -5.2, .4, 3.6], [7, 5.2, .4, 3.6]]) addBox(x, z, w, 3, d, Y, glassW);
  for (const s of [-1, 1]) addBox(0, s * 7, 14, 3, .4, Y, glassW);
  deco(new THREE.BoxGeometry(15, .4, 15), MM.corr, 0, Y + 3.2, 0);
  for (const [x, z] of [[-4, -4], [4, -4]]) { addBox(x, z, 2.4, 1.2, 1.4, Y, MM.black); for (let i = 0; i < 3; i++) deco(new THREE.BoxGeometry(.5, .5, .1), new THREE.MeshStandardMaterial({ color: i ? 0x39d353 : 0xe8c12e, emissive: i ? 0x1d6b2a : 0x7a6410 }), x - .7 + i * .7, Y + 1.4, z - .75, false); }
  // две лестницы вдоль боковых стен — выводят прямо на галерею
  steps(-20, -30, 0, -1, 4.5, 0, Y, MM.grating);
  steps(20, 30, 0, 1, 4.5, 0, Y, MM.grating);
  // на галерее: ящики-укрытия, бочки, вентиляторы
  for (let x = -44; x <= 44; x += 14) { addBox(x, -ARENA + 4, 3, 2.4, 3, Y, MM.mcrate); addBox(-x, ARENA - 4, 3, 2.4, 3, Y, MM.mcrate); }
  for (const z of [-24, 0, 24]) { cyl(-ARENA + 5, z, 1.1, 2, MM.redBarrel, Y); cyl(ARENA - 5, z, 1.1, 2, MM.barrel, Y); }
  for (const [fx, fz] of [[-ARENA + 1, -20], [-ARENA + 1, 20], [ARENA - 1, 0]]) {
    const fan = new THREE.Group(); fan.position.set(fx, Y + 2.4, fz); mapGroup.add(fan);
    fan.add(new THREE.Mesh(new THREE.TorusGeometry(2, .25, 8, 20), MM.grating));
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(3.4, .12, .9), MM.steelW); b.rotation.z = i * Math.PI / 4; fan.add(b); }
    fan.rotation.y = Math.PI / 2; fan.traverse(o => { if (o.isMesh) o.castShadow = true; });
    mapAnims.push(dt => { fan.children.forEach((c, i) => { if (i) c.rotation.z += dt * 2.5; }); });
  }
  // внизу: ещё чаны, котёл, поддоны и штабеля бочек в новом кольце
  for (const [x, z] of [[-48, -44], [48, 44], [-48, 44], [48, -44]]) {
    cyl(x, z, 3.6, 5.2, MM.vat);
    deco(new THREE.TorusGeometry(3.6, .16, 8, 30), MM.grating, x, 5.2, z).rotation.x = Math.PI / 2;
    deco(new THREE.CylinderGeometry(3.4, 3.4, .06, 30), new THREE.MeshStandardMaterial({ color: 0xc9d56a, roughness: .1 }), x, 5, z, false);
  }
  const boiler = cyl(0, -48, 5, 8, MM.vat); deco(new THREE.SphereGeometry(5, 24, 14, 0, 7, 0, Math.PI / 2), MM.vat, 0, 8, -48);
  for (let i = 0; i < 3; i++) { const p = deco(new THREE.CylinderGeometry(.5, .5, 14, 12), MM.corr, -6 + i * 6, 11, -48); p.rotation.z = Math.PI / 2; }
  for (const [px, pz] of [[-30, -50], [30, 50], [-52, 14], [52, -14]]) {
    for (let k = 0; k < 4; k++) addBox(px + (k % 2) * 2.6, pz + Math.floor(k / 2) * 2.6, 2.4, 2.4, 2.4, 0, MM.mcrate);
    addBox(px + 1.3, pz + 1.3, 6.4, .3, 6.4, 2.4, MM.woodDark);
  }
  for (const [bx, bz] of [[-14, 46], [14, -46]]) for (let k = 0; k < 6; k++) cyl(bx + (k % 3) * 2.2, bz + Math.floor(k / 3) * 2.2, 1, 2.2, k % 2 ? MM.redBarrel : MM.barrel);
}

const MAP_KEYS = Object.keys(MAPS);
let currentMap = null;
// анимации карты (мельница, пар, лампы…): функции (dt, t), очищаются при смене карты
const mapAnims = [];
let mapTime = 0;
function updateMapAnims(dt) { mapTime += dt; for (const f of mapAnims) f(dt, mapTime); }
let groundMesh = null;

function buildMap(id) {
  const M = MAPS[id]; currentMap = id;
  for (const c of [...mapGroup.children]) {
    mapGroup.remove(c);
    c.traverse(o => { if (o.geometry && o.geometry !== G_SPHERE) o.geometry.dispose(); });
  }
  boxes.length = 0; mapAnims.length = 0;
  scene.background.set(M.sky);
  scene.fog.color.set(M.fog); scene.fog.far = M.fogFar;
  sun.color.set(M.sun);
  groundMesh = deco(new THREE.PlaneGeometry(ARENA * 2 + 60, ARENA * 2 + 60), M.ground, 0, 0, 0, false);
  groundMesh.rotation.x = -Math.PI / 2;
  M.build(mulberry32(id.length * 977 + 7));
  if (typeof placePointFlag === 'function') placePointFlag(M.poleY);
  if (typeof setupPickups === 'function') setupPickups(id);
}
