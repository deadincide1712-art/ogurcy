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
function clouds(r, color = 0xffffff) {
  for (let i = 0; i < 14; i++) {
    const c = deco(new THREE.SphereGeometry(4 + r() * 5, 8, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .85, fog: false }), (r() - .5) * 260, 45 + r() * 25, (r() - .5) * 260, false);
    c.scale.set(2.2, .5, 1.2);
  }
}

// ---------- сами карты ----------
const MAPS = {
  garden: {
    name: 'Грядка №7', hint: 'Солнечный огород: грядки, ящики с рассолом, тёрки-укрытия и гигантские банки.',
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
      scatter(r, 30, (x, z, s) => { addBox(x, z, s, s, s, 0, MM.crate); if (r() < .3) addBox(x, z, s * .8, s * .8, s * .8, s, MM.crate); }, 8);
      clouds(r);
    },
  },

  kitchen: {
    name: 'Кухня', hint: 'Огромный кухонный стол: кружка в центре, солонка, перечница, хлеб, помидоры и коробка яиц.',
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
    },
  },

  greenhouse: {
    name: 'Теплица', hint: 'Стеклянная теплица: высокие грядки, шпалеры с томатами, бочки с водой и горшок в центре.',
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
      scatter(r, 16, (x, z) => { const m = addBox(x, z, 2.2, 1, 1.5, 0, MM.sack); m.rotation.y = 0; if (r() < .4) addBox(x, z, 2, .9, 1.4, 1, MM.sack); });
    },
  },

  factory: {
    name: 'Засолочный цех', hint: 'Завод по засолке: конвейеры, гигантские чаны, мостки на высоте и будка оператора в центре.',
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
    },
  },
};
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
