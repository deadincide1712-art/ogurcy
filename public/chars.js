// ================= Огуречные Шокеры — скины огурцов =================
// Скин меняет внешность самого огурца: цвет кожуры и навесные детали (банка, халат, корона).
// Открываются за общее число нарезок — тот же счётчик, что и у ножей.

const CHAR_SKINS = {
  classic: { name: 'Огурчик', need: 0, icon: '🥒', hint: 'Обычный боевой огурец с грядки' },
  marin:   { name: 'Маринованный', need: 15, icon: '🧄', hint: 'Тёмная кожура, укроп на макушке и долька чеснока' },
  jar:     { name: 'Малосольный в банке', need: 40, icon: '🫙', hint: 'Воюет прямо из стеклянной банки с рассолом' },
  sci:     { name: 'Огурчик-учёный', need: 100, icon: '🧪', hint: 'Синяя шевелюра, монобровь и лабораторный халат' },
  gold:    { name: 'Золотой огурец', need: 200, icon: '🏆', hint: 'Золотая кожура и корона' },
};

// ---------- материалы ----------
const CM = {
  dill:   new THREE.MeshStandardMaterial({ color: 0x4f9c2a, roughness: .7 }),
  garlic: new THREE.MeshStandardMaterial({ color: 0xf2ece0, roughness: .6 }),
  coat:   new THREE.MeshStandardMaterial({ color: 0xf4f6f4, roughness: .55 }),
  hair:   new THREE.MeshStandardMaterial({ color: 0x7fd4ef, roughness: .6 }),
  skinSci: new THREE.MeshStandardMaterial({ color: 0x86b04a, map: texSkin, roughness: .6 }),
  skinPale: new THREE.MeshStandardMaterial({ color: 0xa8c46a, map: texSkin, roughness: .55 }),
  skinDark: new THREE.MeshStandardMaterial({ color: 0x3c6b1e, map: texSkin, roughness: .7 }),
  gold:   new THREE.MeshStandardMaterial({ color: 0xffcf4a, metalness: .9, roughness: .2, emissive: 0x4a3200, emissiveIntensity: .3, envMap, envMapIntensity: 1.5 }),
  pepper: new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: .5 }),
  dark:   new THREE.MeshStandardMaterial({ color: 0x1d1d1f, roughness: .5 }),
};

// каждая функция довешивает детали на готовую модель огурца
const CHAR_BUILD = {
  marin(g, u) {
    u.body.material = CM.skinDark;
    for (let i = 0; i < 5; i++) {                       // веточки укропа на макушке
      const a = i / 5 * Math.PI * 2;
      const st = new THREE.Mesh(new THREE.CylinderGeometry(.015, .02, .42, 5), CM.dill);
      st.position.set(Math.cos(a) * .12, 2.14, Math.sin(a) * .12);
      st.rotation.set(Math.cos(a) * .5, 0, Math.sin(a) * -.5); g.add(st);
      for (let k = 0; k < 4; k++) {
        const lf = new THREE.Mesh(G_SPHERE, CM.dill); lf.scale.set(.05, .02, .05);
        lf.position.set(Math.cos(a) * (.16 + k * .05), 2.24 + k * .06, Math.sin(a) * (.16 + k * .05)); g.add(lf);
      }
    }
    const clove = new THREE.Mesh(G_SPHERE, CM.garlic);  // долька чеснока на поясе
    clove.scale.set(.12, .17, .1); clove.position.set(.36, 1.02, .28); clove.rotation.z = -.3; g.add(clove);
  },

  jar(g, u) {
    u.body.material = CM.skinPale;
    const R = .66, H = 1.95;
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 20, 1, true), jarGlass);
    glass.position.y = .98; glass.renderOrder = 3; g.add(glass);
    const brine = new THREE.Mesh(new THREE.CylinderGeometry(R - .05, R - .05, H * .72, 20), jarBrine);
    brine.position.y = .78; brine.renderOrder = 2; g.add(brine);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(R + .04, R + .04, .14, 20), lidMat);
    lid.position.y = H + .02; g.add(lid);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R + .02, .035, 6, 20), lidMat);
    rim.rotation.x = Math.PI / 2; rim.position.y = .06; g.add(rim);
    for (let i = 0; i < 7; i++) {                        // специи плавают в рассоле
      const a = i / 7 * Math.PI * 2, y = .35 + (i % 3) * .38;
      const pp = new THREE.Mesh(G_SPHERE, CM.pepper); pp.scale.setScalar(.045);
      pp.position.set(Math.cos(a) * .55, y, Math.sin(a) * .55); g.add(pp);
      const lf = new THREE.Mesh(G_SPHERE, CM.dill); lf.scale.set(.09, .025, .06);
      lf.position.set(Math.cos(a + 1) * .5, y + .2, Math.sin(a + 1) * .5); lf.rotation.y = -a; g.add(lf);
    }
  },

  sci(g, u) {
    u.body.material = CM.skinSci;
    for (let i = 0; i < 9; i++) {                        // взъерошенная шевелюра
      const a = i / 9 * Math.PI * 2, r = .12 + (i % 3) * .07;
      const h = new THREE.Mesh(new THREE.ConeGeometry(.1, .34 + (i % 2) * .12, 5), CM.hair);
      h.position.set(Math.cos(a) * r, 2.05 + (i % 2) * .05, Math.sin(a) * r - .05);
      h.rotation.set(Math.cos(a) * .7, 0, Math.sin(a) * -.7); g.add(h);
    }
    const brow = new THREE.Mesh(new THREE.BoxGeometry(.44, .05, .05), CM.dark);  // монобровь
    brow.position.set(0, 1.55, .42); g.add(brow);
    const coat = new THREE.Mesh(new THREE.CylinderGeometry(.455, .5, .8, 16, 1, true), CM.coat);
    coat.position.y = .52; coat.material.side = THREE.DoubleSide; g.add(coat);   // халат ниже плеч, кожура видна
    for (const s of [-1, 1]) {                            // отвороты халата
      const lap = new THREE.Mesh(new THREE.BoxGeometry(.14, .42, .04), CM.coat);
      lap.position.set(s * .12, .86, .44); lap.rotation.z = s * .18; g.add(lap);
    }
    const flask = new THREE.Mesh(new THREE.ConeGeometry(.12, .22, 10), new THREE.MeshStandardMaterial({ color: 0x8ee36a, transparent: true, opacity: .75, roughness: .1 }));
    flask.position.set(.34, .8, .34); g.add(flask);      // колба в кармане
  },

  gold(g, u) {
    u.body.material = CM.gold;
    for (let i = 0; i < 8; i++) {                         // корона
      const a = i / 8 * Math.PI * 2;
      const sp = new THREE.Mesh(new THREE.ConeGeometry(.06, .22, 4), CM.gold);
      sp.position.set(Math.cos(a) * .3, 1.92, Math.sin(a) * .3); g.add(sp);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.3, .045, 6, 20), CM.gold);
    ring.rotation.x = Math.PI / 2; ring.position.y = 1.82; g.add(ring);
  },
};

// ---------- прогресс и выбор ----------
let charSkin = 'classic';
const charOpen = id => CHAR_SKINS[id] && (typeof totalKills !== 'number' || totalKills >= CHAR_SKINS[id].need);
try { const c = localStorage.getItem('ogurcy-char'); if (CHAR_SKINS[c]) charSkin = c; } catch (e) {}
function setCharSkin(id) {
  if (!CHAR_SKINS[id] || !charOpen(id)) return;
  charSkin = id;
  try { localStorage.setItem('ogurcy-char', id); } catch (e) {}
  renderCharPick();
}
// у ботов скины чередуются — на карте сразу видно всех огурцов
const BOT_CHARS = ['classic', 'marin', 'classic', 'jar', 'marin', 'sci', 'classic', 'gold'];
// открытие новых скинов после нарезок
function checkCharUnlocks(before, after) {
  for (const [id, sk] of Object.entries(CHAR_SKINS)) {
    if (sk.need && before < sk.need && after >= sk.need) {
      setCharSkin(id);
      if (typeof popUnlock === 'function') popUnlock(sk.icon, sk.name, 'Новый огурец открыт!', `За ${sk.need} нарезок · уже надет · сменить можно в разделе «Огурец»`);
    }
  }
  renderCharPick();
}

function renderCharPick() {
  const box = document.getElementById('charPick'); if (!box) return;
  box.textContent = '';
  for (const [id, sk] of Object.entries(CHAR_SKINS)) {
    const b = document.createElement('button'); b.type = 'button';
    const open = charOpen(id);
    b.textContent = open ? `${sk.icon} ${sk.name}` : `🔒 ${sk.name} · ${sk.need}`;
    b.disabled = !open; b.classList.toggle('locked', !open);
    b.setAttribute('aria-pressed', String(id === charSkin));
    b.title = open ? sk.hint : `Откроется, когда нарежешь ${sk.need} огурцов`;
    b.addEventListener('click', () => setCharSkin(id));
    box.append(b);
  }
  const note = document.getElementById('charHint');
  if (note) note.textContent = CHAR_SKINS[charSkin].hint + '. Скин видят все игроки в матче.';
}
addEventListener('DOMContentLoaded', () => {
  renderCharPick();
});

// заново собрать огурца с другим скином, сохранив место и подсветку команды
function rebuildCharMesh(e) {
  if (!e.mesh) return;
  const vis = e.mesh.visible, pos = e.mesh.position.clone(), rot = e.mesh.rotation.clone();
  scene.remove(e.mesh);
  e.mesh = makeCucumber(e.hue, e.color, e.weapon, e.charSkin);
  e.mesh.position.copy(pos); e.mesh.rotation.copy(rot); e.mesh.visible = vis;
  scene.add(e.mesh);
  if (typeof applyRelationLook === 'function') applyRelationLook(e);
}
