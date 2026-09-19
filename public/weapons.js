// ================= Огуречные Шокеры — модели оружия =================
// Все стволы строятся в координатах (u — вперёд по стволу, v — вверх), ствол смотрит в -z.

// окружение для бликов на металле
const envMap = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, '#9fd3f5'); gr.addColorStop(.42, '#f6fcff'); gr.addColorStop(.5, '#a6c97a'); gr.addColorStop(.6, '#5d8a35'); gr.addColorStop(1, '#2c3f18');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(70, 26, 9, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(150, 30, 70, 6); g.fillRect(20, 44, 40, 4);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping; t.encoding = THREE.sRGBEncoding;
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromEquirectangular(t); pm.dispose(); t.dispose();
  return rt.texture;
})();

const texWood = canvasTex(256, 128, (g, w, h) => {
  g.fillStyle = '#6a3a1e'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const y0 = Math.random() * h, a = 2 + Math.random() * 5, f = .01 + Math.random() * .03, ph = Math.random() * 6;
    g.strokeStyle = Math.random() < .55 ? 'rgba(50,22,8,.45)' : 'rgba(190,120,70,.35)';
    g.lineWidth = .6 + Math.random() * 1.6; g.beginPath();
    for (let x = 0; x <= w; x += 4) g.lineTo(x, y0 + Math.sin(x * f + ph) * a);
    g.stroke();
  }
  g.fillStyle = 'rgba(40,15,5,.5)'; g.beginPath(); g.ellipse(170, 60, 9, 4, 0, 0, 7); g.fill();
}, 3, 3);
const texEngrave = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#c9ced2'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(60,66,72,.7)'; g.lineWidth = 1.2;
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 5 + Math.random() * 12;
    g.beginPath(); g.arc(x, y, r, Math.random() * 6, Math.random() * 6 + 3); g.stroke();
    g.beginPath(); g.arc(x + r * .6, y, r * .45, 0, 4); g.stroke();
  }
}, 6, 6);
const texZucchini = canvasTex(128, 256, (g, w, h) => {
  g.fillStyle = '#23461a'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 16) {
    g.fillStyle = 'rgba(120,170,70,.45)';
    g.beginPath(); for (let y = 0; y <= h; y += 8) g.lineTo(x + 4 + Math.sin(y * .05) * 2, y);
    for (let y = h; y >= 0; y -= 8) g.lineTo(x + 8 + Math.sin(y * .05) * 2, y); g.fill();
  }
  for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(200,230,150,.35)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
});
const texGrip = canvasTex(64, 64, (g, w, h) => {
  g.fillStyle = '#2d4222'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 4) for (let x = (y % 8) / 2; x < w; x += 4) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, y, 2, 2); }
}, 8, 8);
function labelTex(text, color) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 96;
  const g = c.getContext('2d');
  g.font = '800 54px Rubik, sans-serif'; g.textBaseline = 'middle';
  g.fillStyle = color; g.fillText('🥒 ' + text, 10, 50);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
  return t;
}

const WM = {
  metal:  new THREE.MeshStandardMaterial({ color: 0x1f2428, metalness: .85, roughness: .35, envMap, envMapIntensity: .55 }),
  dark:   new THREE.MeshStandardMaterial({ color: 0x121416, metalness: .7, roughness: .5, envMap, envMapIntensity: .4 }),
  steel:  new THREE.MeshStandardMaterial({ color: 0x9aa3a8, metalness: 1, roughness: .25, envMap, envMapIntensity: .8 }),
  brass:  new THREE.MeshStandardMaterial({ color: 0xd49a38, metalness: 1, roughness: .25, envMap, envMapIntensity: .85 }),
  engr:   new THREE.MeshStandardMaterial({ color: 0xffffff, map: texEngrave, metalness: 1, roughness: .3, envMap, envMapIntensity: .75 }),
  wood:   new THREE.MeshStandardMaterial({ map: texWood, roughness: .45, metalness: .05, envMap, envMapIntensity: .45 }),
  poly:   new THREE.MeshStandardMaterial({ map: texGrip, roughness: .85 }),
  glass:  new THREE.MeshStandardMaterial({ color: 0xa8e08e, transparent: true, opacity: .5, roughness: .04, metalness: .3, envMap, envMapIntensity: 1.4 }),
  pickle: new THREE.MeshStandardMaterial({ color: 0x4f8a2a, map: texSkin, roughness: .6 }),
  zuke:   new THREE.MeshStandardMaterial({ map: texZucchini, roughness: .38, envMap, envMapIntensity: .5 }),
  lens:   new THREE.MeshStandardMaterial({ color: 0x3d7fc0, emissive: 0x0c2a44, metalness: 1, roughness: .05, envMap, envMapIntensity: 1.6 }),
  shell:  new THREE.MeshStandardMaterial({ color: 0xc8322a, roughness: .45, envMap, envMapIntensity: .4 }),
  dill:   new THREE.MeshStandardMaterial({ color: 0x5fb02e, roughness: .7 }),
  string: new THREE.MeshStandardMaterial({ color: 0xd8362a, roughness: .8 }),
  petal:  new THREE.MeshStandardMaterial({ color: 0xffc42a, roughness: .5 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x4a1d16, roughness: .9 }),
};

function mk(geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; }
// плоский профиль (u,v), выдавленный на ширину — со скруглёнными фасками
function prof(pts, width, mat, bevel = .005) {
  const s = new THREE.Shape(pts.map(([u, v]) => new THREE.Vector2(u, v)));
  const d = Math.max(.002, width - bevel * 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 10 });
  geo.rotateY(Math.PI / 2); geo.translate(-d / 2, 0, 0);
  return mk(geo, mat);
}
// цилиндр вдоль ствола от u0 до u1
function tube(r0, r1, u0, u1, mat, v = 0, x = 0, seg = 20) {
  const geo = new THREE.CylinderGeometry(r1, r0, u1 - u0, seg); geo.rotateX(-Math.PI / 2);
  return mk(geo, mat, x, v, -(u0 + u1) / 2);
}
function label(text, color, u, v, w, x = .0275) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 96 / 512), new THREE.MeshStandardMaterial({ map: labelTex(text, color), transparent: true, metalness: .6, roughness: .3, envMap }));
  m.position.set(-x, v, -u); m.rotation.y = -Math.PI / 2; return m;
}
function triggerSet(g, u, mat, v = 0) {
  const tg = new THREE.TorusGeometry(.032, .0045, 8, 18, Math.PI); tg.rotateZ(Math.PI); tg.rotateY(Math.PI / 2);
  g.add(mk(tg, mat, 0, v + .002, -u));
  const tr = prof([[u - .004, v - .002], [u + .006, v - .002], [u, v - .026], [u - .008, v - .024]], .008, WM.dark, .002); g.add(tr);
}

// ---------- Рассол-47 ----------
function buildRifle() {
  const g = new THREE.Group();
  g.add(prof([[-.1, 0], [.2, 0], [.2, .052], [.17, .068], [-.06, .068], [-.1, .048]], .05, WM.metal));
  const cover = tube(.025, .025, -.085, .165, WM.metal, .062); cover.scale.x = 1.05; g.add(cover);
  for (let i = 0; i < 4; i++) g.add(mk(new THREE.BoxGeometry(.052, .004, .006), WM.dark, 0, .084, .05 - i * .03));
  g.add(prof([[.165, .06], [.24, .06], [.24, .082], [.19, .09], [.165, .085]], .03, WM.metal, .003));
  g.add(prof([[.2, .004], [.425, .012], [.44, .03], [.425, .064], [.2, .064]], .062, WM.wood, .008));
  g.add(tube(.021, .019, .24, .425, WM.wood, .088));
  g.add(tube(.012, .012, .425, .53, WM.metal, .088));
  g.add(tube(.036, .036, .195, .212, WM.brass, .036));
  g.add(tube(.037, .037, .428, .446, WM.brass, .036));
  g.add(tube(.013, .012, .44, .72, WM.metal, .04));
  g.add(prof([[.61, .045], [.665, .045], [.655, .1], [.63, .1]], .022, WM.metal, .003));
  g.add(tube(.02, .018, .71, .785, WM.dark, .04));
  for (const s of [-1, 1]) g.add(mk(new THREE.BoxGeometry(.004, .012, .03), WM.metal, s * .018, .04, -.75));
  // изогнутый магазин-баночка с огурчиком внутри
  const mag = new THREE.Group();
  const front = [], back = [];
  for (let i = 0; i <= 10; i++) { const t = i / 10, u = .035 + .1 * t + .06 * t * t, v = -.245 * t; front.push([u + .036, v]); back.push([u - .036, v]); }
  mag.add(prof([...front, ...back.reverse()], .046, WM.glass, .004));
  const pk = mk(new THREE.CapsuleGeometryShim(.014, .2), WM.pickle, 0, -.12, -.1); pk.rotation.x = .55; mag.add(pk);
  mag.add(prof([[.155, -.232], [.24, -.245], [.235, -.265], [.15, -.25]], .052, WM.brass, .004));
  g.add(mag);
  g.add(prof([[-.058, 0], [-.012, 0], [-.036, -.13], [-.086, -.132]], .042, WM.poly, .008));
  triggerSet(g, .015, WM.metal);
  g.add(prof([[-.1, .054], [-.1, -.004], [-.2, -.03], [-.42, -.085], [-.435, -.03], [-.42, .03], [-.2, .044]], .045, WM.wood, .008));
  g.add(prof([[-.44, -.09], [-.425, -.09], [-.425, .035], [-.44, .035]], .048, WM.dark, .004));
  const ch = mk(new THREE.CylinderGeometry(.006, .006, .04, 10), WM.steel, .04, .052, -.13); ch.rotation.z = Math.PI / 2; g.add(ch);
  g.add(mk(new THREE.SphereGeometry(.011, 12, 8), WM.steel, .06, .052, -.13));
  g.add(label('РАССОЛ-47', '#e8c160', .06, .03, .15));
  return { g, mag, muzzle: [.79, .04], grip: [-.05, -.06], fore: [.34, .02] };
}

// ---------- Укроп-12 ----------
function buildShotgun() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    g.add(tube(.018, .017, .12, .74, WM.metal, .062, s * .018));
    g.add(tube(.02, .02, .72, .745, WM.dark, .062, s * .018));
    const hole = mk(new THREE.CircleGeometry(.012, 16), new THREE.MeshBasicMaterial({ color: 0x050505 }), s * .018, .062, -.746); hole.rotation.y = Math.PI; g.add(hole);
  }
  g.add(mk(new THREE.BoxGeometry(.012, .007, .6), WM.dark, 0, .083, -.43));
  g.add(mk(new THREE.BoxGeometry(.016, .02, .6), WM.metal, 0, .048, -.43));
  g.add(mk(new THREE.SphereGeometry(.0055, 10, 8), WM.brass, 0, .09, -.725));
  g.add(prof([[-.06, 0], [.13, 0], [.13, .082], [-.02, .082], [-.06, .052]], .054, WM.engr, .006));
  const pin = mk(new THREE.CylinderGeometry(.009, .009, .058, 14), WM.brass, 0, .016, -.12); pin.rotation.z = Math.PI / 2; g.add(pin);
  for (const s of [-1, 1]) { const hm = prof([[-.035, .07], [-.02, .07], [-.03, .105], [-.045, .1]], .01, WM.steel, .002); hm.position.x = s * .014; g.add(hm); }
  g.add(prof([[.0, .082], [.04, .082], [.035, .092], [-.01, .09]], .016, WM.brass, .002));
  g.add(prof([[.14, .006], [.4, .022], [.41, .04], [.4, .058], [.14, .058]], .05, WM.wood, .007));
  triggerSet(g, .02, WM.brass);
  g.add(prof([[-.06, .062], [-.06, -.004], [-.1, -.07], [-.145, -.074], [-.158, -.03], [-.47, -.092], [-.482, -.02], [-.47, .052], [-.2, .056]], .046, WM.wood, .008));
  g.add(prof([[-.5, -.098], [-.47, -.094], [-.47, .056], [-.5, .058]], .05, WM.rubber, .005));
  // патроны на прикладе
  for (let i = 0; i < 4; i++) {
    const u = -.26 - i * .026;
    const sh = mk(new THREE.CylinderGeometry(.0095, .0095, .05, 14), WM.shell, -.031, .012, -u); g.add(sh);
    g.add(mk(new THREE.CylinderGeometry(.0105, .0105, .014, 14), WM.brass, -.031, -.018, -u));
  }
  g.add(mk(new THREE.BoxGeometry(.006, .02, .13), WM.rubber, -.028, .012, .3));
  // пучок укропа, привязанный к стволам красной ниткой
  const dill = new THREE.Group();
  const stem = tube(.0022, .0015, .2, .6, WM.dill, 0, 0, 6); dill.add(stem);
  for (let i = 0; i < 26; i++) {
    const u = .22 + i * .015, len = .025 + Math.random() * .03;
    for (const s of [-1, 1]) {
      const lf = mk(new THREE.CylinderGeometry(.0012, .0008, len, 4), WM.dill, 0, 0, -u);
      lf.geometry = lf.geometry.clone(); lf.geometry.translate(0, len / 2, 0);
      lf.rotation.set(-.9 - Math.random() * .4, 0, s * (.5 + Math.random() * .6));
      dill.add(lf);
    }
  }
  for (let i = 0; i < 9; i++) {  // зонтик
    const a = i / 9 * Math.PI * 2;
    const r = mk(new THREE.CylinderGeometry(.001, .001, .03, 4), WM.dill, Math.cos(a) * .01, Math.sin(a) * .01, -.61); r.rotation.x = -Math.PI / 2 + .35;
    dill.add(r, mk(new THREE.SphereGeometry(.0045, 6, 5), WM.petal, Math.cos(a) * .018, Math.sin(a) * .018, -.635));
  }
  dill.position.set(-.042, .075, 0); dill.rotation.z = .2; g.add(dill);
  for (const u of [.3, .52]) g.add(mk(new THREE.TorusGeometry(.047, .0028, 6, 24), WM.string, 0, .062, -u));
  g.add(label('УКРОП-12', '#3a2a14', .03, .03, .11));
  return { g, mag: null, muzzle: [.75, .062], grip: [-.1, -.04], fore: [.3, .02] };
}

// ---------- Кабачок-М ----------
function buildSniper() {
  const g = new THREE.Group();
  // корпус-кабачок
  const L = .6, pts = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16, r = .032 + .026 * Math.sqrt(Math.sin(Math.PI * t)) + .01 * t; pts.push(new THREE.Vector2(r * (i === 0 || i === 16 ? .35 : 1), -L / 2 + t * L)); }
  const zg = new THREE.LatheGeometry(pts, 24); zg.rotateX(Math.PI / 2);
  const zk = mk(zg, WM.zuke, 0, -.005, .15); zk.scale.y = .85; g.add(zk);
  for (let i = 0; i < 6; i++) { // засохший цветок на затыльнике
    const a = i / 6 * Math.PI * 2, p = mk(new THREE.SphereGeometry(1, 10, 8), WM.petal, Math.cos(a) * .018, -.005 + Math.sin(a) * .018, .455);
    p.scale.set(.016, .016, .006); p.rotation.z = a; g.add(p);
  }
  g.add(tube(.03, .022, .13, .175, new THREE.MeshStandardMaterial({ color: 0x7d8a3c, roughness: .8 }), .01, 0, 10)); // срез плодоножки
  g.add(tube(.027, .027, -.1, .17, WM.metal, .058));
  g.add(tube(.02, .02, .17, .2, WM.metal, .058));
  g.add(tube(.016, .013, .2, .74, WM.metal, .058));
  for (const u of [.3, .45, .6]) g.add(tube(.018, .018, u, u + .012, WM.steel, .058));
  g.add(tube(.027, .027, .72, .92, WM.dark, .058));
  g.add(tube(.028, .028, .9, .925, WM.brass, .058));
  for (let i = 0; i < 6; i++) g.add(mk(new THREE.BoxGeometry(.003, .003, .16), WM.metal, Math.cos(i) * .027, .058 + Math.sin(i) * .027, -.82));
  // затвор
  const bolt = mk(new THREE.CylinderGeometry(.005, .005, .055, 10), WM.steel, .045, .045, .05); bolt.rotation.z = Math.PI / 2 + .5; g.add(bolt);
  g.add(mk(new THREE.SphereGeometry(.012, 14, 10), WM.dark, .07, .032, .05));
  // прицел
  const sv = .122;
  g.add(tube(.019, .019, -.07, .2, WM.dark, sv));
  g.add(tube(.019, .031, .2, .28, WM.dark, sv));
  g.add(tube(.029, .019, -.15, -.07, WM.dark, sv));
  g.add(tube(.032, .032, .275, .285, WM.brass, sv));
  const lf = mk(new THREE.CircleGeometry(.028, 24), WM.lens, 0, sv, -.286); lf.rotation.y = Math.PI; g.add(lf);
  g.add(mk(new THREE.CircleGeometry(.026, 24), WM.lens, 0, sv, .151));
  g.add(mk(new THREE.CylinderGeometry(.012, .012, .026, 16), WM.dark, 0, sv + .026, -.06));
  g.add(mk(new THREE.CylinderGeometry(.0125, .0125, .006, 16), WM.brass, 0, sv + .04, -.06));
  const side = mk(new THREE.CylinderGeometry(.011, .011, .024, 16), WM.dark, .026, sv, -.06); side.rotation.z = Math.PI / 2; g.add(side);
  for (const u of [-.03, .14]) { g.add(tube(.023, .023, u, u + .018, WM.metal, sv)); g.add(mk(new THREE.BoxGeometry(.016, .04, .018), WM.metal, 0, .088, -u - .009)); }
  // сошки
  for (const s of [-1, 1]) { const leg = tube(.004, .004, .3, .56, WM.steel, .03, s * .014, 8); g.add(leg); g.add(mk(new THREE.SphereGeometry(.007, 8, 6), WM.rubber, s * .014, .03, -.56)); }
  g.add(mk(new THREE.BoxGeometry(.036, .02, .03), WM.metal, 0, .038, -.3));
  g.add(prof([[-.01, -.03], [.07, -.03], [.07, -.075], [-.01, -.075]], .03, WM.metal, .004));
  g.add(prof([[-.13, -.04], [-.08, -.04], [-.1, -.15], [-.15, -.152]], .04, WM.poly, .008));
  triggerSet(g, -.055, WM.metal, -.045);
  g.add(label('КАБАЧОК-М', '#f2e6a0', -.12, -.005, .12, .068));
  return { g, mag: null, muzzle: [.93, .058], grip: [-.12, -.09], fore: [.1, -.05] };
}

// ---------- Шинковка-3000 (пистолет-пулемёт с дисковым магазином-долькой) ----------
function buildSMG() {
  const g = new THREE.Group();
  g.add(prof([[-.08, 0], [.2, 0], [.22, .025], [.2, .07], [-.05, .07], [-.08, .045]], .048, WM.metal));
  g.add(mk(new THREE.BoxGeometry(.012, .012, .24), WM.dark, 0, .078, -.06));                // планка сверху
  g.add(prof([[.02, .07], [.05, .07], [.045, .1], [.025, .1]], .02, WM.metal, .002));      // целик
  g.add(tube(.026, .026, .2, .4, WM.dark, .035));                                            // кожух ствола
  for (let i = 0; i < 5; i++) g.add(tube(.028, .028, .215 + i * .036, .228 + i * .036, WM.steel, .035)); // рёбра кожуха
  g.add(tube(.011, .011, .4, .47, WM.metal, .035));
  g.add(tube(.017, .015, .46, .5, WM.dark, .035));
  // дисковый магазин — ломтик огурца с семечками
  const mag = new THREE.Group();
  const slice = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .045, 28), [WM.pickle, new THREE.MeshStandardMaterial({ map: texFlesh, roughness: .5 }), new THREE.MeshStandardMaterial({ map: texFlesh, roughness: .5 })]);
  slice.rotation.z = Math.PI / 2; slice.position.set(0, -.07, -.1); slice.castShadow = true; mag.add(slice);
  const hub = mk(new THREE.CylinderGeometry(.02, .02, .06, 12), WM.brass, 0, -.07, -.1); hub.rotation.z = Math.PI / 2; mag.add(hub);
  g.add(mag);
  g.add(prof([[.28, 0], [.31, 0], [.3, -.075], [.27, -.075]], .03, WM.poly, .006));           // передняя рукоять
  g.add(prof([[-.055, 0], [-.012, 0], [-.03, -.11], [-.075, -.112]], .04, WM.poly, .008));
  triggerSet(g, .012, WM.metal);
  // складной проволочный приклад
  for (const s of [-1, 1]) g.add(tube(.006, .006, -.3, -.08, WM.steel, .04 + s * .018 - .01, 0, 8));
  g.add(prof([[-.31, -.03], [-.29, -.03], [-.29, .07], [-.31, .07]], .05, WM.rubber, .004));
  g.add(label('ШИНКОВКА', '#e8c160', .07, .04, .12, .0255));
  return { g, mag, muzzle: [.5, .035], grip: [-.04, -.06], fore: [.29, -.04] };
}

// ---------- Огурцомёт (ракетница, стреляет большими огурцами) ----------
function buildRocket() {
  const g = new THREE.Group();
  const olive = new THREE.MeshStandardMaterial({ color: 0x3f5a2a, metalness: .4, roughness: .55, envMap, envMapIntensity: .5 }); olive.userData.part = 'metal';
  g.add(tube(.075, .075, -.42, .5, olive, .06, 0, 28));
  g.add(tube(.075, .1, .5, .6, WM.dark, .06, 0, 28));                                       // раструб спереди
  g.add(tube(.105, .075, -.52, -.42, WM.dark, .06, 0, 28));                                 // сопло сзади
  const hazard = new THREE.MeshStandardMaterial({ map: texHazard, roughness: .6 });
  g.add(tube(.078, .078, .28, .34, hazard, .06, 0, 28));
  g.add(tube(.078, .078, -.3, -.24, hazard, .06, 0, 28));
  // огурец-снаряд торчит из ствола
  const shell = new THREE.Group();
  const cu = mk(new THREE.CapsuleGeometryShim(.06, .34), WM.pickle); cu.rotation.x = -Math.PI / 2; cu.position.set(0, .06, -.5); shell.add(cu);
  for (let i = 0; i < 6; i++) { const a = i * 1.05; shell.add(mk(new THREE.SphereGeometry(.009, 6, 5), WM.dark, Math.cos(a) * .06, .06 + Math.sin(a) * .06, -.6 - (i % 2) * .03)); }
  g.add(shell);
  // прицел, рукоятки, упор
  g.add(prof([[.02, .13], [.14, .13], [.14, .18], [.04, .18]], .04, WM.dark, .004));
  const lens = mk(new THREE.CircleGeometry(.017, 16), WM.lens, 0, .155, -.142); lens.rotation.y = Math.PI; g.add(lens);
  g.add(prof([[-.05, -.01], [-.005, -.01], [-.03, -.13], [-.075, -.132]], .04, WM.poly, .008));
  g.add(prof([[.2, -.01], [.24, -.01], [.235, -.12], [.2, -.12]], .035, WM.poly, .006));
  triggerSet(g, .02, WM.metal, -.012);
  g.add(prof([[-.34, -.015], [-.18, -.015], [-.2, -.06], [-.34, -.06]], .06, WM.rubber, .006));
  g.add(label('ОГУРЦОМЁТ', '#f2e6a0', -.05, .06, .2, .077));
  return { g, mag: shell, muzzle: [.61, .06], grip: [-.04, -.07], fore: [.22, -.07] };
}

// ---------- Корнишон-9 (пистолет) ----------
function buildPistol() {
  const g = new THREE.Group();
  g.add(prof([[-.05, .02], [.17, .02], [.17, .066], [-.04, .066], [-.05, .058]], .036, WM.steel, .004)); // затвор
  for (let i = 0; i < 5; i++) g.add(mk(new THREE.BoxGeometry(.038, .03, .004), WM.dark, 0, .045, .02 + i * .01));
  g.add(prof([[-.03, 0], [.15, 0], [.15, .022], [-.03, .022]], .032, WM.metal, .003));        // рамка
  g.add(tube(.008, .008, .165, .18, WM.dark, .045));
  g.add(prof([[-.035, .002], [.01, .002], [-.008, -.1], [-.055, -.102]], .036, WM.wood, .007)); // рукоять
  g.add(mk(new THREE.SphereGeometry(.012, 10, 8), WM.pickle, -.0185, -.045, .03));               // значок-огурчик на щёчке
  triggerSet(g, .035, WM.metal);
  g.add(label('КОРНИШОН-9', '#3a2a14', .07, .042, .09, .0185));
  return { g, mag: null, muzzle: [.19, .045], grip: [-.03, -.05], fore: [-.01, -.08] };
}

// ---------- Ножи: у каждого внутренняя группа spin — её крутит анимация осмотра ----------
const KM = {
  blade: new THREE.MeshStandardMaterial({ color: 0xd9e0e3, metalness: 1, roughness: .16, envMap, envMapIntensity: 1.2 }),
  chili: new THREE.MeshStandardMaterial({ color: 0xd6231a, roughness: .22, metalness: .05, envMap, envMapIntensity: .8 }),
  stem: new THREE.MeshStandardMaterial({ color: 0x3f8f25, roughness: .5 }),
  pod: new THREE.MeshStandardMaterial({ color: 0x6fbf3a, roughness: .4, envMap, envMapIntensity: .4 }),
  pea: new THREE.MeshStandardMaterial({ color: 0x9fe05a, roughness: .35 }),
};
// Шинковщик — поварской нож
function buildChef() {
  const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin);
  spin.add(prof([[-.125, -.012], [-.005, -.016], [-.005, .014], [-.12, .012], [-.13, 0]], .022, WM.wood, .005));
  for (const u of [-.03, -.065, -.1]) for (const s of [-1, 1]) spin.add(mk(new THREE.SphereGeometry(.0045, 8, 6), WM.brass, s * .0112, 0, -u));
  spin.add(prof([[-.008, -.019], [.012, -.022], [.012, .017], [-.008, .016]], .016, WM.steel, .002));
  spin.add(prof([[.012, -.034], [.17, -.024], [.225, .002], [.245, .016], [.012, .017]], .004, KM.blade, .001));
  spin.add(label('ШИНКОВЩИК', '#2e3a26', .11, -.006, .09, .0026));
  return { g, spin, mag: null, muzzle: [.24, 0], grip: [-.065, -.005], fore: [-.065, -.005], oneHand: true, skin: 'chef' };
}
// Керамбит «Чили» — изогнутое лезвие-перец и кольцо-хвостик; крутится вокруг кольца
function buildKarambit() {
  const g = new THREE.Group(), spin = new THREE.Group(); spin.position.z = .075; g.add(spin);
  const inner = new THREE.Group(); inner.position.z = -.075; spin.add(inner);
  const ring = mk(new THREE.TorusGeometry(.022, .006, 10, 24), KM.stem); ring.rotation.y = Math.PI / 2; ring.position.z = .075; inner.add(ring);
  inner.add(tube(.011, .013, -.052, 0, KM.stem, 0, 0, 12));
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const s = mk(new THREE.ConeGeometry(.006, .02, 5), KM.stem, Math.cos(a) * .012, Math.sin(a) * .012, -.004); s.rotation.x = -Math.PI / 2; inner.add(s); }
  // лезвие-перец: центральная линия изгибается вниз, к кончику сужается
  const top = [], bot = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14, u = .005 + .16 * t, v = -.11 * t * t, du = .16, dv = -.22 * t, L = Math.hypot(du, dv);
    const nx = -dv / L, ny = du / L, w = .016 * Math.pow(1 - t, .6) + .0015;
    top.push([u + nx * w, v + ny * w]); bot.push([u - nx * w, v - ny * w]);
  }
  inner.add(prof([...top, ...bot.reverse()], .016, KM.chili, .005));
  return { g, spin, mag: null, muzzle: [.16, -.1], grip: [-.03, 0], fore: [-.03, 0], oneHand: true, skin: 'karambit' };
}
// Бабочка «Горошек» — лезвие и две створки-стручка на шарнирах
function buildButterfly() {
  const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin);
  spin.add(prof([[0, -.011], [.105, -.011], [.135, .003], [.098, .013], [0, .013]], .005, KM.blade, .0012));
  spin.add(label('ГОРОШЕК', '#2e4a1e', .06, 0, .06, .0032));
  const handles = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group(); pivot.position.x = s * .0095; spin.add(pivot);
    const geo = new THREE.CapsuleGeometryShim(.012, .15); geo.rotateX(Math.PI / 2); geo.translate(0, 0, .075);
    const pod = mk(geo, KM.pod); pod.scale.x = .55; pivot.add(pod);
    for (let i = 0; i < 4; i++) pivot.add(mk(new THREE.SphereGeometry(.0065, 8, 6), KM.pea, -s * .004, .006, .025 + i * .03));
    handles.push(pivot);
  }
  return { g, spin, handles, mag: null, muzzle: [.13, 0], grip: [-.07, 0], fore: [-.07, 0], oneHand: true, skin: 'butterfly' };
}
const KNIFE_BUILDERS = { chef: buildChef, karambit: buildKarambit, butterfly: buildButterfly };
// Золотой нож — за 150 нарезок: золотое лезвие, рукоять из чёрного дерева, изумрудный огурчик-инкрустация
KM.gold = new THREE.MeshStandardMaterial({ color: 0xffcf4a, metalness: 1, roughness: .14, emissive: 0x5a3800, emissiveIntensity: .25, envMap, envMapIntensity: 1.6 });
KM.ebony = new THREE.MeshStandardMaterial({ color: 0x1b1512, roughness: .35, envMap, envMapIntensity: .5 });
KM.emerald = new THREE.MeshStandardMaterial({ color: 0x1fbf5a, metalness: .3, roughness: .05, emissive: 0x0a4a1e, emissiveIntensity: .5, envMap, envMapIntensity: 1.8 });
function buildGolden() {
  const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin);
  spin.add(prof([[-.125, -.012], [-.005, -.016], [-.005, .014], [-.12, .012], [-.13, 0]], .022, KM.ebony, .005));
  for (const u of [-.035, -.1]) for (const s of [-1, 1]) spin.add(mk(new THREE.SphereGeometry(.005, 10, 8), KM.gold, s * .0112, 0, -u));
  for (const s of [-1, 1]) { const gem = mk(new THREE.CapsuleGeometryShim(.0055, .03), KM.emerald, s * .0115, 0, .068); gem.rotation.x = Math.PI / 2; spin.add(gem); }
  spin.add(prof([[-.135, -.012], [-.125, -.014], [-.125, .013], [-.135, .01]], .026, KM.gold, .003));   // золотой торец рукояти
  spin.add(prof([[-.008, -.021], [.014, -.025], [.014, .019], [-.008, .018]], .02, KM.gold, .003));      // гарда
  spin.add(prof([[.014, -.036], [.17, -.026], [.228, .002], [.25, .017], [.014, .018]], .0045, KM.gold, .001));
  spin.add(label('ЗОЛОТОЙ', '#5a3800', .11, -.006, .085, .0028));
  return { g, spin, mag: null, muzzle: [.25, 0], grip: [-.065, -.005], fore: [-.065, -.005], oneHand: true, skin: 'golden' };
}
KNIFE_BUILDERS.golden = buildGolden;


const WEAPON_BUILDERS = { knife: skin => (KNIFE_BUILDERS[skin] || buildChef)(), rifle: buildRifle, shotgun: buildShotgun, sniper: buildSniper, smg: buildSMG, rocket: buildRocket, pistol: buildPistol };

// ---------- дульная вспышка ----------
const texFlash = canvasTex(128, 128, (g, w, h) => {
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,235,1)'); r.addColorStop(.25, 'rgba(255,225,120,.95)'); r.addColorStop(.6, 'rgba(255,140,40,.35)'); r.addColorStop(1, 'rgba(255,100,20,0)');
  g.fillStyle = r; g.beginPath();
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? 24 : 64; g.lineTo(64 + Math.cos(a) * rr, 64 + Math.sin(a) * rr); }
  g.fill();
});
const flashMat = new THREE.MeshBasicMaterial({ map: texFlash, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
function makeFlash(size) {
  const f = new THREE.Group();
  const front = new THREE.Mesh(new THREE.PlaneGeometry(size, size), flashMat); f.add(front);
  for (const r of [0, Math.PI / 2]) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(size * .7, size * 1.6), flashMat);
    s.rotation.set(Math.PI / 2, r, 0); s.position.z = -size * .6; f.add(s);
  }
  f.visible = false; return f;
}

// собрать оружие целиком: модель + вспышка + огуречные руки
function buildWeapon(kind, handMat, withArms, skin) {
  const w = WEAPON_BUILDERS[kind](skin);
  if (kind !== 'knife' && skin && typeof applyGunSkin === 'function') applyGunSkin(w.g, skin); // скин оружия
  const hand = (u, v, sx) => { const h = mk(new THREE.SphereGeometry(1, 16, 12), handMat, sx, v, -u); h.scale.set(.034, .045, .05); return h; };
  w.g.add(hand(w.grip[0], w.grip[1], .02));
  if (!w.oneHand) w.g.add(hand(w.fore[0], w.fore[1], -.01));
  if (withArms) {
    const arm = (from, to, r) => {
      const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), len = a.distanceTo(b);
      const m = mk(new THREE.CapsuleGeometryShim(r, len + r * 2), handMat); m.position.copy(a).lerp(b, .5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); return m;
    };
    w.g.add(arm([.03, w.grip[1] - .02, -w.grip[0] + .02], [.14, -.3, .45], .026));
    if (!w.oneHand) w.g.add(arm([-.02, w.fore[1] - .02, -w.fore[0]], [-.16, -.34, .2], .022));
  }
  // у ботов мелкие детали не видны издалека — убираем их ради скорости
  const small = [];
  w.g.traverse(o => {
    if (!o.isMesh) return;
    o.geometry.computeBoundingSphere();
    const r = o.geometry.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z);
    o.castShadow = !withArms && r > .06;
    if (!withArms && r < .03) small.push(o);
  });
  small.forEach(o => o.parent.remove(o));
  w.flash = makeFlash({ shotgun: .26, sniper: .3, rocket: .45, pistol: .14, smg: .16 }[kind] || .2);
  w.flash.position.set(0, w.muzzle[1], -w.muzzle[0] - .03);
  w.g.add(w.flash);
  if (w.mag) w.magY = w.mag.position.y;
  return w;
}

// ---------- отдельная сцена для оружия в руках (не проваливается в стены) ----------
const vmScene = new THREE.Scene();
const vmCam = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, .01, 10);
vmScene.add(new THREE.HemisphereLight(0xf4ffe6, 0x4a3b22, .9));
const vmKey = new THREE.DirectionalLight(0xfff1cf, 1.1); vmKey.position.set(-1, 2, 1.2); vmScene.add(vmKey);
const vmRim = new THREE.DirectionalLight(0xbfe6ff, .5); vmRim.position.set(1.5, .5, -2); vmScene.add(vmRim);
const vmFlashLight = new THREE.PointLight(0xffc860, 0, 1.5); vmFlashLight.position.set(.1, -.05, -.9); vmScene.add(vmFlashLight);
addEventListener('resize', () => { vmCam.aspect = innerWidth / innerHeight; vmCam.updateProjectionMatrix(); });
renderer.autoClear = false;
