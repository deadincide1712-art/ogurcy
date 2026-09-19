// ================= Огуречные Шокеры — постройки, декор и анимации карт =================
// Каждая карта получает pre (постройки с коллизией — до случайной расстановки ящиков)
// и post (небо, декор за оградой, трава, частицы, анимации).

// ---------- текстуры ----------
const texShingle = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#5e2a1a'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 12 - 12; x < w + 24; x += 24) {
    g.fillStyle = `hsl(${10 + Math.random() * 8},${40 + Math.random() * 15}%,${28 + Math.random() * 10}%)`;
    g.beginPath(); g.moveTo(x - 11, y); g.lineTo(x + 11, y); g.lineTo(x + 11, y + 12); g.quadraticCurveTo(x, y + 19, x - 11, y + 12); g.fill();
  }
}, 2, 2);
const texWindow = canvasTex(64, 64, (g, w, h) => {
  g.fillStyle = '#4a3320'; g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff8d6'); gr.addColorStop(1, '#ffc76a');
  g.fillStyle = gr; for (const [x, y] of [[6, 6], [34, 6], [6, 34], [34, 34]]) g.fillRect(x, y, 24, 24);
});
const texWallpaper = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#eadbbd'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(170,120,70,.16)'; g.fillRect(x, 0, 12, h); }
  for (let y = 16; y < h; y += 42) for (let x = 22; x < w; x += 32) { g.fillStyle = 'rgba(110,150,80,.4)'; g.beginPath(); g.ellipse(x, y, 4, 7, .5, 0, 7); g.fill(); g.fillStyle = 'rgba(210,90,70,.45)'; g.beginPath(); g.arc(x + 3, y - 6, 3, 0, 7); g.fill(); }
}, 14, 8);
const texBrick = canvasTex(128, 64, (g, w, h) => {
  g.fillStyle = '#9b9186'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 16 - 16; x < w; x += 32) { g.fillStyle = `hsl(${8 + Math.random() * 12},${40 + Math.random() * 10}%,${36 + Math.random() * 10}%)`; g.fillRect(x + 1, y + 1, 30, 14); }
}, 2, 1);
const texBark = canvasTex(32, 64, (g, w, h) => {
  g.fillStyle = '#6b4a2e'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(40,25,10,.4)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 8 + Math.random() * 10); }
});
const texBurlap = canvasTex(64, 64, (g, w, h) => {
  g.fillStyle = '#b8955c'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < w; i += 3) { g.fillStyle = 'rgba(90,60,30,.25)'; g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); }
});
const texSign = canvasTex(256, 128, (g, w, h) => {
  g.fillStyle = '#f1c22e'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1b1b1b'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = '#1b1b1b'; g.font = 'bold 30px Rubik, sans-serif'; g.textAlign = 'center';
  g.fillText('ОСТОРОЖНО', w / 2, 56); g.font = 'bold 24px Rubik, sans-serif'; g.fillText('ГОРЯЧИЙ РАССОЛ', w / 2, 92);
});
const texFridge = canvasTex(128, 256, (g, w, h) => {
  g.fillStyle = '#f2f4f2'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#cfd6d4'; g.fillRect(0, 88, w, 4);
  g.fillStyle = '#9aa3a6'; g.fillRect(100, 30, 8, 44); g.fillRect(100, 110, 8, 70);
  const notes = ['#ffd84a', '#8fe0ff', '#ff9fb2'];
  notes.forEach((c, i) => { g.fillStyle = c; g.save(); g.translate(22 + i * 24, 130 + (i % 2) * 30); g.rotate((i - 1) * .15); g.fillRect(0, 0, 22, 24); g.restore(); });
});

const XM = {
  plank: new THREE.MeshStandardMaterial({ color: 0xb58a58, map: texFence, roughness: .85 }),
  plankDark: new THREE.MeshStandardMaterial({ color: 0x8a6440, map: texFence, roughness: .9 }),
  roof: new THREE.MeshStandardMaterial({ map: texShingle, roughness: .8, side: THREE.DoubleSide }),
  roofGreen: new THREE.MeshStandardMaterial({ color: 0x4f7d3a, roughness: .7, side: THREE.DoubleSide }),
  window: new THREE.MeshBasicMaterial({ map: texWindow }),
  brick: new THREE.MeshStandardMaterial({ map: texBrick, roughness: .9 }),
  trunk: new THREE.MeshStandardMaterial({ map: texBark, roughness: .95 }),
  crowns: [0x3f8f2c, 0x4f9c33, 0x2f7a2a, 0x6aa83a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true })),
  white: new THREE.MeshStandardMaterial({ color: 0xf3f1e8, roughness: .6 }),
  red: new THREE.MeshStandardMaterial({ color: 0xc8412f, roughness: .45 }),
  burlap: new THREE.MeshStandardMaterial({ map: texBurlap, roughness: 1 }),
  straw: new THREE.MeshStandardMaterial({ color: 0xe0c060, roughness: .9 }),
  hay: new THREE.MeshStandardMaterial({ color: 0xd7b35a, map: texBurlap, roughness: 1 }),
  wallpaper: new THREE.MeshStandardMaterial({ map: texWallpaper, roughness: .9, side: THREE.DoubleSide }),
  fridge: new THREE.MeshStandardMaterial({ map: texFridge, roughness: .3 }),
  cabinet: new THREE.MeshStandardMaterial({ color: 0x9fc4b0, roughness: .5 }),
  bulb: new THREE.MeshBasicMaterial({ color: 0xfff1bf }),
  cone: new THREE.MeshBasicMaterial({ color: 0xfff1bf, transparent: true, opacity: .07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
  shaft: new THREE.MeshBasicMaterial({ color: 0xfffbe0, transparent: true, opacity: .06, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
  sign: new THREE.MeshStandardMaterial({ map: texSign, roughness: .6 }),
  pipe: new THREE.MeshStandardMaterial({ color: 0x8a9599, metalness: .8, roughness: .35 }),
  pipeRed: new THREE.MeshStandardMaterial({ color: 0xb33a2a, metalness: .4, roughness: .4 }),
  ceiling: new THREE.MeshStandardMaterial({ color: 0x3a4447, roughness: .9 }), // виден только снизу: в меню камера летает над цехом
  ledOn: new THREE.MeshBasicMaterial({ color: 0x6dff6a }),
  ledRed: new THREE.MeshBasicMaterial({ color: 0xff4a3a }),
  book: [0x2f5f9e, 0x9e2f45, 0xe0b33a, 0x3f7d4a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .6 })),
  pages: new THREE.MeshStandardMaterial({ color: 0xf6f0de, roughness: .9 }),
  cheese: new THREE.MeshStandardMaterial({ color: 0xf2c84a, roughness: .6 }),
  holes: new THREE.MeshStandardMaterial({ color: 0xd9a92a, roughness: .8 }),
  steam: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .25, depthWrite: false }),
  crumbs: new THREE.MeshStandardMaterial({ color: 0xc28a45, roughness: 1 }),
};

// ---------- помощники ----------
// треугольная призма: основание w по x, высота h, длина d по z (конёк вдоль z)
function prism(w, h, d) {
  const s = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g;
}
// домик с дверным проёмом, потолком и двускатной крышей — внутрь можно зайти
function hut(cx, cz, w, d, h, door, wallMat, roofMat, opts = {}) {
  const t = .3, dw = 2.4, dh = 2.5;
  const sides = { s: [cx, cz + d / 2, w, true], n: [cx, cz - d / 2, w, true], e: [cx + w / 2, cz, d, false], w: [cx - w / 2, cz, d, false] };
  for (const [k, [x, z, len, alongX]] of Object.entries(sides)) {
    if (k === door) {
      const seg = (len - dw) / 2;
      for (const s of [-1, 1]) { const off = s * (dw / 2 + seg / 2); alongX ? addBox(x + off, z, seg + (alongX ? t : 0), h, t, 0, wallMat) : addBox(x, z + off, t, h, seg, 0, wallMat); }
      alongX ? addBox(x, z, dw, h - dh, t, dh, wallMat) : addBox(x, z, t, h - dh, dw, dh, wallMat);
    } else alongX ? addBox(x, z, len + t, h, t, 0, wallMat) : addBox(x, z, t, h, len, 0, wallMat);
    if (opts.windows && k !== door) {
      const win = deco(new THREE.PlaneGeometry(1.4, 1.1), XM.window, x, h * .58, z, false);
      if (alongX) { win.position.z += (k === 's' ? 1 : -1) * (t / 2 + .02); win.rotation.y = k === 's' ? 0 : Math.PI; }
      else { win.position.x += (k === 'e' ? 1 : -1) * (t / 2 + .02); win.rotation.y = k === 'e' ? Math.PI / 2 : -Math.PI / 2; }
    }
  }
  addBox(cx, cz, w + .6, .25, d + .6, h, opts.ceilMat || wallMat);
  if (!opts.flat) {
    const rh = opts.roofH || 2;
    const rf = deco(prism(w + 1.4, rh, d + 1.2), roofMat, cx, h + .25, cz);
    solid(cx, cz, w * .6, rh * .6, d, h + .25);
    if (opts.chimney) deco(new THREE.BoxGeometry(.8, 2, .8), XM.brick, cx + w * .25, h + rh * .7, cz + d * .2);
    return rf;
  }
}
// забор из штакетника вдоль оси (через него можно перепрыгнуть)
function picket(x0, z0, x1, z1, mat = XM.white) {
  const len = Math.hypot(x1 - x0, z1 - z0), alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (const y of [.35, .8]) deco(alongX ? new THREE.BoxGeometry(len, .12, .06) : new THREE.BoxGeometry(.06, .12, len), mat, cx, y, cz);
  for (let s = 0; s <= len; s += .45) {
    const p = deco(new THREE.BoxGeometry(.14, 1.1, .05), mat, alongX ? x0 + Math.sign(x1 - x0) * s : cx, .55, alongX ? cz : z0 + Math.sign(z1 - z0) * s);
    if (!alongX) p.rotation.y = Math.PI / 2;
  }
  alongX ? solid(cx, cz, len, 1.1, .3) : solid(cx, cz, .3, 1.1, len);
}
// небо-купол с вертикальным градиентом
function skyDome(top, bottom) {
  const geo = new THREE.SphereGeometry(320, 32, 16), c = new THREE.Color(), a = new THREE.Color(top), b = new THREE.Color(bottom), cols = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const k = THREE.MathUtils.clamp(pos.getY(i) / 320 * 1.6, 0, 1); c.copy(b).lerp(a, Math.pow(k, .7)); cols.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.renderOrder = -1; mapGroup.add(m);
  const sunDisc = deco(new THREE.CircleGeometry(9, 32), new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false }), 120, 190, 70, false);
  sunDisc.lookAt(0, 0, 0);
}
function tree(x, z, s, r) {
  const h = 3 + s * 2;
  deco(new THREE.CylinderGeometry(.25 * s, .4 * s, h, 7), XM.trunk, x, h / 2, z);
  for (let i = 0; i < 3; i++) {
    const cr = deco(new THREE.IcosahedronGeometry((1.6 + r() * .8) * s, 1), XM.crowns[Math.floor(r() * 4)], x + (r() - .5) * s * 1.4, h + i * s * .9, z + (r() - .5) * s * 1.4);
    cr.scale.y = .85;
  }
}
function treeRing(r, n, rMin, rMax) {
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = rMin + r() * (rMax - rMin); tree(Math.cos(a) * d, Math.sin(a) * d, 1.2 + r() * 1.3, r); }
}
// летающие пылинки / пыльца
function motes(color, n = 260, size = .09) {
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() * 2 - 1) * ARENA; pos[i * 3 + 1] = .5 + Math.random() * 8; pos[i * 3 + 2] = (Math.random() * 2 - 1) * ARENA; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity: .7, depthWrite: false }));
  mapGroup.add(pts);
  mapAnims.push((dt, t) => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < n; i++) {
      p[i * 3] += Math.sin(t * .3 + i) * dt * .25; p[i * 3 + 1] += Math.sin(t * .5 + i * 1.7) * dt * .15; p[i * 3 + 2] += Math.cos(t * .27 + i) * dt * .25;
    }
    geo.attributes.position.needsUpdate = true;
  });
}
// трава и цветы одним инстанс-мешем
function tufts(n, geo, colors, r, yScale = [.6, 1.4]) {
  const mat = new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true });
  const im = new THREE.InstancedMesh(geo, mat, n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    p.set((r() * 2 - 1) * (ARENA - 1), 0, (r() * 2 - 1) * (ARENA - 1));
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 6.3);
    const k = yScale[0] + r() * (yScale[1] - yScale[0]); s.set(1, k, 1);
    m.compose(p, q, s); im.setMatrixAt(i, m);
    im.setColorAt(i, c.set(colors[Math.floor(r() * colors.length)]));
  }
  im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  im.receiveShadow = true; mapGroup.add(im);
}
function hangingLamp(x, y, z, cordTop, shadeColor = 0x2f5d44, cone = true) {
  const g = new THREE.Group(); g.position.set(x, cordTop, z); mapGroup.add(g);
  const len = cordTop - y;
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, len, 5), XM.pipe); cord.position.y = -len / 2; g.add(cord);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.2, 20, 1, true), new THREE.MeshStandardMaterial({ color: shadeColor, roughness: .4, side: THREE.DoubleSide })); shade.position.y = -len; g.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.4, 12, 10), XM.bulb); bulb.position.y = -len - .4; g.add(bulb);
  if (cone) { const lc = new THREE.Mesh(new THREE.ConeGeometry(7, y - .2, 24, 1, true), XM.cone); lc.position.y = -len - (y - .2) / 2 - .4; g.add(lc); }
  return g;
}

// ---------- ГРЯДКА №7 ----------
const EXTRAS = {};
EXTRAS.garden = {
  pre(r) {
    // сарай — можно зайти внутрь
    hut(-37, 0, 8, 8, 3.2, 'e', XM.plank, XM.roof, { windows: true, chimney: false });
    addBox(-39.5, -2, 2, 1, 1.4, 0, MM.crate); addBox(-39.5, 2.2, 1.4, 1.4, 1.4, 0, MM.crate);
    // смотровая вышка со ступенями из ящиков
    for (const [dx, dz] of [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]]) addBox(37 + dx, dz, .35, 4, .35, 0, XM.plankDark);
    addBox(37, 0, 5.4, .3, 5.4, 4, XM.plank);
    addBox(37, -2.6, 5.4, .9, .15, 4.3, XM.plankDark); addBox(37, 2.6, 5.4, .9, .15, 4.3, XM.plankDark); addBox(39.6, 0, .15, .9, 5.4, 4.3, XM.plankDark);
    for (const [dx, dz] of [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]]) deco(new THREE.BoxGeometry(.2, 2.6, .2), XM.plankDark, 37 + dx, 5.6, dz);
    const tr = deco(new THREE.ConeGeometry(4.3, 1.8, 4), XM.roof, 37, 7.8, 0); tr.rotation.y = Math.PI / 4;
    addBox(31, 0, 2, 1.4, 2.4, 0, MM.crate); addBox(33, 0, 2, 2.8, 2.4, 0, MM.crate);
    // колодец
    cyl(-14.5, 30, 1.25, 1.1, XM.brick);
    deco(new THREE.CylinderGeometry(1.05, 1.05, .05, 20), new THREE.MeshStandardMaterial({ color: 0x1d3a4a, roughness: .05 }), -14.5, 1.05, 30, false);
    for (const s of [-1, 1]) deco(new THREE.BoxGeometry(.2, 2.4, .2), XM.plankDark, -14.5 + s * 1.1, 2.2, 30);
    const wr = deco(prism(3, 1, 2.2), XM.roof, -14.5, 3.4, 30); wr.rotation.y = Math.PI / 2;
    deco(new THREE.CylinderGeometry(.25, .2, .35, 12), XM.pipe, -14.5, 2, 30);
    // пугало
    deco(new THREE.CylinderGeometry(.08, .08, 3.2, 6), XM.plankDark, 18.5, 1.6, -30);
    deco(new THREE.BoxGeometry(2.4, .12, .12), XM.plankDark, 18.5, 2.4, -30);
    deco(new THREE.BoxGeometry(1.1, 1.1, .45), XM.red, 18.5, 2.1, -30);
    deco(new THREE.SphereGeometry(.45, 12, 10), XM.burlap, 18.5, 3.1, -30);
    deco(new THREE.ConeGeometry(.75, .6, 16), XM.straw, 18.5, 3.55, -30);
    deco(new THREE.CylinderGeometry(.8, .8, .05, 16), XM.straw, 18.5, 3.3, -30);
    solid(18.5, -30, .6, 3.2, .6);
    // штакетник и тюки сена
    picket(-21, -7, -21, 7); picket(21, -7, 21, 7);
    for (const [x, z, ry] of [[-6, 40, 0], [8, -40, 0], [-30, -8, Math.PI / 2], [28, 10, Math.PI / 2]]) {
      const b = deco(new THREE.CylinderGeometry(1, 1, 2, 18), XM.hay, x, 1, z); b.rotation.z = Math.PI / 2; b.rotation.y = ry;
      ry ? solid(x, z, 2, 2, 2) : solid(x, z, 2, 2, 2);
    }
  },
  post(r) {
    skyDome(0x5aa7e0, 0xd9f2e6);
    treeRing(r, 34, 56, 90);
    // деревенский дом за забором
    const hx = 8, hz = -66;
    deco(new THREE.BoxGeometry(14, 6, 9), XM.brick, hx, 3, hz);
    const hr = deco(prism(15.5, 4, 10.5), XM.roof, hx, 6, hz); hr.rotation.y = Math.PI / 2;
    for (const wx of [-4, 0, 4]) deco(new THREE.PlaneGeometry(1.6, 1.4), XM.window, hx + wx, 3.3, hz + 4.52, false);
    deco(new THREE.BoxGeometry(1, 3, 1), XM.brick, hx + 4, 8.5, hz - 1);
    // дымок из трубы
    const puffs = [];
    for (let i = 0; i < 8; i++) { const p = deco(new THREE.SphereGeometry(.6, 8, 6), XM.steam.clone(), hx + 4, 10, hz - 1, false); p.userData.t = i / 8; puffs.push(p); }
    mapAnims.push(dt => puffs.forEach(p => {
      p.userData.t = (p.userData.t + dt * .18) % 1; const k = p.userData.t;
      p.position.set(hx + 4 + k * 3, 10 + k * 7, hz - 1 - k * 1.5); p.scale.setScalar(.6 + k * 2.2); p.material.opacity = .35 * (1 - k);
    }));
    // ветряная мельница
    const mx = -64, mz = 44;
    deco(new THREE.CylinderGeometry(2.4, 4, 14, 8), XM.plank, mx, 7, mz);
    deco(new THREE.ConeGeometry(3.2, 3, 8), XM.roof, mx, 15.5, mz);
    const blades = new THREE.Group(); blades.position.set(mx + 2.2, 13, mz - 2.2); blades.rotation.y = Math.PI / 4; mapGroup.add(blades);
    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; blades.add(arm);
      const a = new THREE.Mesh(new THREE.BoxGeometry(.3, 9, .2), XM.plankDark); a.position.y = 4.5; arm.add(a);
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 7), XM.white); sail.material.side = THREE.DoubleSide; sail.position.set(1, 5, .12); arm.add(sail);
    }
    mapAnims.push(dt => { blades.children.forEach(() => {}); blades.rotateZ(dt * .6); });
    // тропинки к центру
    for (const [w, d] of [[3, ARENA * 2], [ARENA * 2, 3]]) { const p = deco(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 1 }), 0, .015, 0, false); p.rotation.x = -Math.PI / 2; }
    // трава и цветы
    tufts(2200, new THREE.ConeGeometry(.09, .55, 3), [0x4f9a2c, 0x5fae36, 0x3f8a26, 0x7cbf45], r);
    tufts(260, new THREE.IcosahedronGeometry(.13, 0), [0xffffff, 0xffd84a, 0xff7fa8, 0xa98bff], r, [1, 1]);
    motes(0xfff6b0, 200, .08);
  },
};

// ---------- КУХНЯ ----------
EXTRAS.kitchen = {
  pre(r) {
    // хлебница — укрытие с открытой стороной
    const bm = XM.red;
    addBox(-40, -30, .4, 4, 6.4, 0, bm); addBox(-36, -33.2, 8.4, 4, .4, 0, bm); addBox(-36, -26.8, 8.4, 4, .4, 0, bm);
    addBox(-36, -30, 8.8, .4, 7, 4, bm);
    const lid = deco(new THREE.CylinderGeometry(3.3, 3.3, 8.8, 24, 1, false, 0, Math.PI), bm, -36, 4.2, -30); lid.rotation.z = Math.PI / 2; lid.scale.set(1, 1, .9);
    deco(new THREE.PlaneGeometry(4, 1.2), new THREE.MeshBasicMaterial({ map: labelTexKitchen('ХЛЕБ') , transparent: true }), -36, 2.8, -26.58, false);
    // стопка кулинарных книг — лестница на высоту
    [[10, 1, 7, 0, 0], [8.5, 1, 6, 1, .6], [7, 1.1, 5.2, 2, -.4]].forEach(([w, h, d, y, off], i) => {
      addBox(36 + off, -12, w, h, d, y, XM.book[i]);
      deco(new THREE.BoxGeometry(w - .3, h - .2, d + .04), XM.pages, 36 + off + .15, y + h / 2, -12, false);
    });
    // тостер с тостами
    addBox(14, 30, 6, 3.6, 3.5, 0, MM.steelW);
    for (const dz of [-.7, .7]) { deco(new THREE.BoxGeometry(4, .05, .5), MM.black, 14, 3.62, 30 + dz, false); deco(new THREE.BoxGeometry(3.6, 2, .35), MM.bread, 14, 4.2, 30 + dz); }
    deco(new THREE.BoxGeometry(.4, .8, .3), MM.black, 17.1, 2.6, 30);
    // чайник
    deco(new THREE.SphereGeometry(2.2, 24, 18), MM.white, -20, 2.1, -14).scale.y = .95;
    deco(new THREE.CylinderGeometry(.9, 1.2, .5, 20), MM.white, -20, 4.2, -14);
    deco(new THREE.SphereGeometry(.35, 12, 10), XM.book[0], -20, 4.6, -14);
    const spout = deco(new THREE.CylinderGeometry(.25, .45, 2.4, 12), MM.white, -22.4, 2.8, -14); spout.rotation.z = Math.PI / 3.2;
    const th = deco(new THREE.TorusGeometry(1.1, .22, 10, 20, Math.PI * 1.2), MM.white, -17.9, 2.6, -14); th.rotation.z = -Math.PI / 2 - .3;
    for (let i = 0; i < 3; i++) deco(new THREE.TorusGeometry(2.21, .05, 6, 40), XM.book[0], -20, 1.4 + i * .5, -14).rotation.x = Math.PI / 2;
    solid(-20, -14, 4.2, 4.4, 4.2);
    // сырный клин
    const ch = deco(prism(6, 3.2, 4), XM.cheese, 8, 0, -14); ch.rotation.y = Math.PI / 2;
    for (let i = 0; i < 5; i++) deco(new THREE.CircleGeometry(.25 + r() * .2, 14), XM.holes, 8 - 2.01, .5 + r() * 1.4, -15 + r() * 2, false).rotation.y = -Math.PI / 2;
    solid(8, -14, 4, 1.8, 5);
  },
  post(r) {
    // стены кухни вокруг стола
    const R = 76, H = 80;
    for (const [x, z, ry] of [[0, -R, 0], [0, R, Math.PI], [-R, 0, Math.PI / 2], [R, 0, -Math.PI / 2]]) { const w = deco(new THREE.PlaneGeometry(R * 2, H), XM.wallpaper, x, H / 2 - 20, z, false); w.rotation.y = ry; }
    const ceil = deco(new THREE.PlaneGeometry(R * 2, R * 2), new THREE.MeshStandardMaterial({ color: 0xf5eee0, side: THREE.DoubleSide }), 0, 60, 0, false); ceil.rotation.x = Math.PI / 2;
    // окно с видом на улицу
    deco(new THREE.PlaneGeometry(50, 30), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, fog: false }), 0, 25, -R + .5, false);
    for (const [w, h, x, y] of [[52, 2, 0, 40], [52, 2, 0, 10], [2, 32, -25, 25], [2, 32, 25, 25], [1.2, 30, 0, 25], [50, 1.2, 0, 25]]) deco(new THREE.BoxGeometry(w, h, 1), MM.white, x, y, -R + 1, false);
    // холодильник, шкафчики, часы
    deco(new THREE.BoxGeometry(22, 55, 16), XM.fridge, R - 14, 7.5, 40, false).rotation.y = -Math.PI / 2;
    for (let i = -2; i <= 2; i++) { deco(new THREE.BoxGeometry(16, 14, 8), XM.cabinet, i * 18, 38, R - 5, false); deco(new THREE.SphereGeometry(.6, 10, 8), MM.steelW, i * 18 + 6, 34, R - 9.2, false); }
    const clock = deco(new THREE.CylinderGeometry(6, 6, .8, 40), MM.white, -R + 1, 36, -30, false); clock.rotation.z = Math.PI / 2;
    const hand = deco(new THREE.BoxGeometry(.3, 4.5, .3), MM.black, -R + 1.6, 36, -30, false); hand.geometry.translate(0, 2, 0);
    mapAnims.push(dt => { hand.rotation.x -= dt * .5; });
    // лампа над столом
    const lamp = hangingLamp(0, 22, 0, 60, 0x2f5d44);
    mapAnims.push((dt, t) => { lamp.rotation.z = Math.sin(t * .6) * .02; });
    // крошки на столе
    tufts(320, new THREE.BoxGeometry(.18, .12, .15), [0xc28a45, 0xe0b074, 0x9a6a30], r, [1, 1]);
    motes(0xffe9c0, 160, .07);
  },
};
function labelTexKitchen(text) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 80; const g = c.getContext('2d');
  g.fillStyle = '#fff5e0'; g.font = 'bold 56px Rubik, sans-serif'; g.textAlign = 'center'; g.fillText(text, 128, 60);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}

// ---------- ТЕПЛИЦА ----------
EXTRAS.greenhouse = {
  pre(r) {
    hut(39, 0, 7, 9, 3.2, 'w', XM.plank, XM.roofGreen, { windows: true });
    hut(-39, 0, 7, 9, 3.2, 'e', XM.plank, XM.roofGreen, { windows: true });
    addBox(41, -2.5, 1.4, 1, 3, 0, XM.plankDark); addBox(-41, 2.5, 1.4, 1, 3, 0, XM.plankDark);
    // арки с лозой над дорожкой к центру
    for (const z of [-15, -11, 11, 15]) {
      for (const s of [-1, 1]) addBox(s * 3.2, z, .25, 3.4, .25, 0, XM.plankDark);
      const arc = deco(new THREE.TorusGeometry(3.2, .14, 8, 24, Math.PI), MM.leaf, 0, 3.4, z);
      for (let i = 0; i < 6; i++) { const a = i / 5 * Math.PI; deco(new THREE.IcosahedronGeometry(.35, 0), MM.leaf, Math.cos(a) * 3.2, 3.4 + Math.sin(a) * 3.2, z); }
    }
    // водонапорный бак на ножках
    for (const [dx, dz] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) addBox(dx, -40 + dz, .3, 5, .3, 0, XM.pipe);
    cyl(0, -40, 2.3, 2.6, MM.barrel, 5);
    deco(new THREE.ConeGeometry(2.4, .8, 20), MM.barrel, 0, 8, -40);
  },
  post(r) {
    skyDome(0x6fb9e6, 0xe8f7ef);
    treeRing(r, 30, 55, 85);
    // солнечные лучи сквозь стекло
    for (let i = 0; i < 7; i++) { const s = deco(new THREE.PlaneGeometry(4, 22), XM.shaft, -30 + i * 10, 8, (r() - .5) * 30, false); s.rotation.set(0, r() * 3, .5); }
    // подвесные кашпо вдоль балок
    for (let x = -34.5; x <= 34.5; x += 11.5) for (const z of [-24, 0, 24]) {
      if (Math.abs(x) < 1 && z === 0) continue; // над флагом точки
      deco(new THREE.CylinderGeometry(.02, .02, 2, 4), XM.pipe, x, 8, z, false);
      deco(new THREE.SphereGeometry(.6, 10, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), MM.terracotta, x, 7, z);
      for (let k = 0; k < 4; k++) deco(new THREE.IcosahedronGeometry(.35, 0), MM.leaf, x + (r() - .5), 6.6 - r() * .9, z + (r() - .5));
    }
    // тачка и лейки
    for (const [x, z] of [[-8, 28], [9, -27], [30, 12]]) { deco(new THREE.CylinderGeometry(.45, .35, .7, 14), MM.barrel, x, .35, z); const sp = deco(new THREE.CylinderGeometry(.06, .08, .9, 8), MM.barrel, x + .5, .6, z); sp.rotation.z = -.9; }
    tufts(700, new THREE.ConeGeometry(.08, .4, 3), [0x4f9a2c, 0x6aa83a, 0x3f8a26], r);
    motes(0xf2ffcf, 240, .07);
  },
};

// ---------- ЗАСОЛОЧНЫЙ ЦЕХ ----------
EXTRAS.factory = {
  pre(r) {
    // стеллажи с банками — коридоры склада
    for (const x of [-36, -28, 28, 36]) {
      solid(x, 0, 1.4, 5, 14);
      for (const dz of [-7, 0, 7]) for (const dx of [-.6, .6]) deco(new THREE.BoxGeometry(.18, 5, .18), XM.pipeRed, x + dx, 2.5, dz);
      for (const y of [.15, 1.8, 3.4, 5]) deco(new THREE.BoxGeometry(1.4, .12, 14.2), MM.grating, x, y, 0);
      for (let y = 0; y < 3; y++) for (let z = -6.3; z <= 6.3; z += 1.3) {
        if (r() < .25) continue;
        if (r() < .5) { const j = new THREE.Group(); j.position.set(x, .2 + y * 1.63, z); const gl = new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, 1, 12), jarBrine); gl.position.y = .5; const l = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, .1, 12), lidMat); l.position.y = 1.03; j.add(gl, l); mapGroup.add(j); }
        else deco(new THREE.BoxGeometry(1.1, 1.1, 1.1), MM.mcrate, x, .78 + y * 1.63, z, false);
      }
    }
    // засолочный пресс с крутящимися валами и лампочками
    const px = -24, pz = 38;
    addBox(px, pz, 8, 4.5, 4, 0, MM.mcrate);
    deco(new THREE.BoxGeometry(8.2, .3, 4.2), MM.hazard, px, 4.6, pz);
    const rollers = [];
    for (const dx of [-2, 0, 2]) { const rl = deco(new THREE.CylinderGeometry(.7, .7, 4.4, 16), MM.vat, px + dx, 5.5, pz); rl.rotation.x = Math.PI / 2; rollers.push(rl); }
    solid(px, pz, 6, 1.6, 4.4, 4.5);
    const leds = [];
    for (let i = 0; i < 5; i++) leds.push(deco(new THREE.SphereGeometry(.14, 8, 6), i % 2 ? XM.ledRed : XM.ledOn, px - 2 + i, 3.2, pz - 2.05, false));
    mapAnims.push((dt, t) => { rollers.forEach((rl, i) => rl.rotation.y += dt * (i % 2 ? -2 : 2)); leds.forEach((l, i) => l.visible = Math.sin(t * 4 + i * 1.3) > -.3); });
    // бытовка мастера: плоская крыша, на неё можно залезть по ящикам
    hut(24, -38, 8, 6, 3.4, 'n', MM.mcrate, null, { windows: true, flat: true, ceilMat: MM.grating });
    addBox(18.9, -40, 2, 1.4, 2, 0, MM.mcrate); addBox(18.9, -38, 2, 2.8, 2, 0, MM.mcrate);
  },
  post(r) {
    // потолок с фермами
    const ceil = deco(new THREE.PlaneGeometry(ARENA * 2 + 4, ARENA * 2 + 4), XM.ceiling, 0, 14, 0, false); ceil.rotation.x = Math.PI / 2;
    for (let z = -40; z <= 40; z += 10) { deco(new THREE.BoxGeometry(ARENA * 2, .6, .4), XM.pipe, 0, 13.4, z, false); for (let x = -40; x <= 40; x += 8) { const d = deco(new THREE.BoxGeometry(.15, 1.6, .15), XM.pipe, x, 12.9, z, false); d.rotation.z = .6; } }
    // лампы с конусами света
    for (const [x, z] of [[-24, -20], [0, -20], [24, -20], [-24, 20], [0, 20], [24, 20], [-24, 0], [24, 0]]) hangingLamp(x, 10.5, z, 13.4, 0x3a4a50);
    // кран-балка с покачивающимся ящиком
    deco(new THREE.BoxGeometry(ARENA * 2, .8, 1), MM.hazard, 0, 11.6, -8, false);
    const hook = new THREE.Group(); hook.position.set(-6, 11.2, -8); mapGroup.add(hook);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 4, 5), XM.pipe); cable.position.y = -2; hook.add(cable);
    const load = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), MM.mcrate); load.position.y = -5; hook.add(load);
    mapAnims.push((dt, t) => { hook.rotation.z = Math.sin(t * .9) * .06; hook.rotation.x = Math.sin(t * .7) * .04; });
    // трубы вдоль стен с вентилями
    for (const [x, z, alongX] of [[0, -ARENA + .2, true], [0, ARENA - .2, true], [-ARENA + .2, 0, false], [ARENA - .2, 0, false]]) {
      for (const [y, mat] of [[5.2, XM.pipe], [6, XM.pipeRed]]) { const p = deco(new THREE.CylinderGeometry(.22, .22, ARENA * 2, 10), mat, x, y, z, false); alongX ? p.rotation.z = Math.PI / 2 : p.rotation.x = Math.PI / 2; }
      for (let k = -30; k <= 30; k += 20) { const v = deco(new THREE.TorusGeometry(.4, .08, 6, 14), XM.pipeRed, alongX ? k : x, 6, alongX ? z : k, false); v.rotation.y = alongX ? 0 : Math.PI / 2; }
    }
    // таблички
    for (const [x, z, ry] of [[-20, -ARENA + .6, 0], [20, ARENA - .6, Math.PI], [-ARENA + .6, 20, Math.PI / 2], [ARENA - .6, -20, -Math.PI / 2]]) deco(new THREE.PlaneGeometry(4, 2), XM.sign, x, 3.5, z, false).rotation.y = ry;
    // пар над чанами
    for (const [vx, vz] of [[-31, -28], [31, 28], [-31, 28], [31, -28]]) {
      const puffs = [];
      for (let i = 0; i < 7; i++) { const p = deco(new THREE.SphereGeometry(.8, 8, 6), XM.steam.clone(), vx, 6, vz, false); p.userData.t = i / 7; puffs.push(p); }
      mapAnims.push(dt => puffs.forEach(p => {
        p.userData.t = (p.userData.t + dt * .22) % 1; const k = p.userData.t;
        p.position.set(vx + Math.sin(k * 6 + vx) * .8, 5.8 + k * 6, vz + Math.cos(k * 5 + vz) * .8); p.scale.setScalar(.6 + k * 2); p.material.opacity = .3 * (1 - k);
      }));
    }
    // разметка проходов
    for (const x of [-20, 20]) { const l = deco(new THREE.PlaneGeometry(.3, ARENA * 1.8), new THREE.MeshBasicMaterial({ color: 0xe8c12e }), x, .02, 0, false); l.rotation.x = -Math.PI / 2; }
    motes(0xdde6ea, 220, .08);
  },
};

// встраиваем в карты: постройки до основной расстановки, декор — после
for (const [k, ex] of Object.entries(EXTRAS)) {
  const base = MAPS[k].build;
  MAPS[k].build = function (r) { ex.pre(r); base.call(this, r); ex.post(r); };
}
