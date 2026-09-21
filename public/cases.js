// ================= Огуречные Шокеры — кейсы, монеты и задания =================
// Кейс «Огуречный» стоит 100 монет. Монеты дают за победу (+100) и за ежедневные задания.
// В кейсе 5 скинов огурца и по 5 скинов на каждый из 6 стволов — по одному на каждую редкость.
// Сначала выпадает редкость (по шансам ниже), потом случайный предмет этой редкости.

const RARITY = {
  common:    { name: 'Обычный',     color: '#b7c7a3', chance: 55,  refund: 10 },
  uncommon:  { name: 'Необычный',   color: '#6fd36f', chance: 25,  refund: 20 },
  rare:      { name: 'Редкий',      color: '#4aa8ff', chance: 12,  refund: 40 },
  epic:      { name: 'Эпический',   color: '#b46cff', chance: 6,   refund: 80 },
  legendary: { name: 'Легендарный', color: '#ffc83a', chance: 2,   refund: 150 },
};
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const CASE_PRICE = 100, WIN_COINS = 100, START_COINS = 100;

// ---------- скины оружия из кейса: одна тема на редкость, у каждого ствола своя копия ----------
const cstd = o => new THREE.MeshStandardMaterial(o);
const texStripes = canvasTex(128, 128, (g, w, h) => {          // арбузные полосы
  g.fillStyle = '#2f7d2a'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 32) { g.fillStyle = '#16451a'; g.beginPath(); for (let y = 0; y <= h; y += 8) g.lineTo(x + 8 + Math.sin(y * .12) * 4, y); for (let y = h; y >= 0; y -= 8) g.lineTo(x + 18 + Math.sin(y * .12) * 4, y); g.fill(); }
}, 4, 4);
const texLava = canvasTex(128, 128, (g, w, h) => {              // трещины с лавой
  g.fillStyle = '#140604'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#ff6a1a'; g.lineWidth = 2.2;
  for (let i = 0; i < 22; i++) { let x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (Math.random() - .5) * 30; y += (Math.random() - .5) * 30; g.lineTo(x, y); } g.stroke(); }
}, 3, 3);
const CASE_MATS = {
  cs_camo: {        // обычный — садовый камуфляж
    metal: cstd({ map: texCamo, color: 0x9aa070, roughness: .85 }), dark: cstd({ color: 0x3a3324, roughness: .8 }),
    steel: cstd({ color: 0x8a8f7a, metalness: .5, roughness: .5 }), wood: cstd({ color: 0x6b5230, roughness: .7 }), poly: cstd({ color: 0x4a5a2a, roughness: .9 }),
  },
  cs_melon: {       // необычный — арбузный
    metal: cstd({ map: texStripes, roughness: .45 }), dark: cstd({ color: 0x1f4d1a, roughness: .5 }),
    steel: cstd({ color: 0xf2eee0, roughness: .4 }), wood: cstd({ color: 0xe0423a, roughness: .45 }), poly: cstd({ color: 0x141414, roughness: .5 }),
  },
  cs_neon: {        // редкий — неоновый рассол, детали светятся
    metal: cstd({ color: 0x121820, metalness: .7, roughness: .3, envMap, envMapIntensity: .6 }), dark: cstd({ color: 0x0a0e14, roughness: .4 }),
    steel: cstd({ color: 0x33e0ff, emissive: 0x33e0ff, emissiveIntensity: .9, roughness: .3 }),
    wood: cstd({ color: 0x7bff5a, emissive: 0x3fbf2a, emissiveIntensity: .6, roughness: .4 }), poly: cstd({ color: 0x1a2230, roughness: .6 }),
    brass: cstd({ color: 0xff4fd8, emissive: 0xff4fd8, emissiveIntensity: .7 }),
  },
  cs_lava: {        // эпический — лавовый чили, трещины пульсируют
    metal: cstd({ map: texLava, emissiveMap: texLava, emissive: 0xff5a10, emissiveIntensity: .9, roughness: .6 }),
    dark: cstd({ color: 0x1a0a06, roughness: .7 }), steel: cstd({ color: 0xff7a1a, emissive: 0xff3d00, emissiveIntensity: .8, metalness: .6, roughness: .3 }),
    wood: cstd({ color: 0x2a0f08, roughness: .6 }), poly: cstd({ color: 0x3a1408, roughness: .7 }), brass: cstd({ color: 0xffb020, emissive: 0xff7a00, emissiveIntensity: .6 }),
  },
  cs_rainbow: {     // легендарный — радужный, переливается
    metal: cstd({ color: 0xff0000, metalness: .85, roughness: .18, envMap, envMapIntensity: 1.2, emissive: 0x220022 }),
    dark: cstd({ color: 0x14101c, metalness: .6, roughness: .3 }), steel: KM.gold, brass: KM.gold, engr: KM.gold,
    wood: cstd({ color: 0x1b1512, emissive: 0x440044, emissiveIntensity: .6, roughness: .35 }), poly: cstd({ color: 0x1b1512, roughness: .4 }),
  },
};
const CASE_GUN_SKINS = {
  cs_camo:    { name: 'Садовый камуфляж', rarity: 'common',    colors: ['#9aa070', '#6b5230', '#3a3324'] },
  cs_melon:   { name: 'Арбузный',         rarity: 'uncommon',  colors: ['#2f7d2a', '#16451a', '#e0423a'] },
  cs_neon:    { name: 'Неоновый рассол',  rarity: 'rare',      colors: ['#121820', '#33e0ff', '#7bff5a'] },
  cs_lava:    { name: 'Лавовый чили',     rarity: 'epic',      colors: ['#140604', '#ff5a10', '#ffb020'] },
  cs_rainbow: { name: 'Радужный огурец',  rarity: 'legendary', colors: ['#ff4f4f', '#ffd24a', '#4fd8ff', '#b46cff'] },
};
// регистрируем их в общей системе скинов оружия
for (const [id, sk] of Object.entries(CASE_GUN_SKINS)) {
  GUN_SKINS[id] = { name: sk.name, need: Infinity, case: true, rarity: sk.rarity, icon: '🎁' };
  SKIN_MATS[id] = CASE_MATS[id];
}

// ---------- скины огурца из кейса ----------
const CCM = {
  cap:   cstd({ color: 0xd9412e, roughness: .6 }), capW: cstd({ color: 0xf4f1e6, roughness: .6 }),
  band:  cstd({ color: 0xc8231c, roughness: .7 }), black: cstd({ color: 0x151515, roughness: .5 }),
  goldR: cstd({ color: 0xffcf4a, metalness: 1, roughness: .2, envMap, envMapIntensity: 1.3 }),
  ninja: cstd({ color: 0x2a3a22, map: texSkin, roughness: .7 }),
  dome:  cstd({ color: 0xcfefff, transparent: true, opacity: .28, roughness: .05, metalness: .3, envMap, envMapIntensity: 1.5, depthWrite: false }),
  suit:  cstd({ color: 0xf2f4f6, roughness: .45 }), glow: cstd({ color: 0xff3d6a, emissive: 0xff3d6a, emissiveIntensity: 1.2 }),
  rainbow: cstd({ color: 0xff0000, map: texSkin, roughness: .35, metalness: .3, emissive: 0x220011, envMap, envMapIntensity: .8 }),
  halo:  cstd({ color: 0xffe07a, emissive: 0xffc83a, emissiveIntensity: 1.3, roughness: .3 }),
};
const CASE_CHARS = {
  cap:     { name: 'Огурец в кепке', rarity: 'common',    icon: '🧢', hint: 'Красная кепка козырьком вперёд' },
  pirate:  { name: 'Корнишон-пират', rarity: 'uncommon',  icon: '🏴‍☠️', hint: 'Бандана, повязка на глаз и золотая серьга' },
  ninja:   { name: 'Огурец-ниндзя',  rarity: 'rare',      icon: '🥷', hint: 'Тёмная кожура, маска и повязка с хвостами' },
  astro:   { name: 'Космо-огурец',   rarity: 'epic',      icon: '🚀', hint: 'Стеклянный шлем, скафандр и светящаяся антенна' },
  rainbow: { name: 'Радужный огурец', rarity: 'legendary', icon: '🌈', hint: 'Переливается всеми цветами и носит нимб' },
};
Object.assign(CHAR_BUILD, {
  cap(g) {
    const top = new THREE.Mesh(new THREE.SphereGeometry(.46, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), CCM.cap); top.position.y = 1.72; top.scale.y = .7; g.add(top);
    const visor = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .04, 16, 1, false, -Math.PI / 2, Math.PI), CCM.cap); visor.position.set(0, 1.73, .32); visor.scale.z = 1.3; g.add(visor);
    const btn = new THREE.Mesh(G_SPHERE, CCM.capW); btn.scale.setScalar(.05); btn.position.y = 2.05; g.add(btn);
  },
  pirate(g) {
    const ban = new THREE.Mesh(new THREE.SphereGeometry(.47, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), CCM.band); ban.position.y = 1.62; ban.scale.y = .8; g.add(ban);
    for (const s of [-1, 1]) { const tail = new THREE.Mesh(new THREE.ConeGeometry(.07, .35, 5), CCM.band); tail.position.set(s * .1, 1.72, -.5); tail.rotation.x = -1.9 + s * .2; g.add(tail); }
    const patch = new THREE.Mesh(new THREE.CircleGeometry(.12, 16), CCM.black); patch.position.set(-.15, 1.38, .475); g.add(patch);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(.45, .018, 6, 24), CCM.black); strap.position.y = 1.44; strap.rotation.set(Math.PI / 2, .35, 0); g.add(strap);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.06, .015, 6, 14), CCM.goldR); ring.position.set(.45, 1.22, 0); g.add(ring);
  },
  ninja(g, u) {
    u.body.material = CCM.ninja;
    const mask = new THREE.Mesh(new THREE.CylinderGeometry(.455, .455, .34, 20, 1, true), CCM.black); mask.position.y = 1.2; mask.material.side = THREE.DoubleSide; g.add(mask);
    const hb = new THREE.Mesh(new THREE.TorusGeometry(.45, .04, 6, 24), CCM.band); hb.rotation.x = Math.PI / 2; hb.position.y = 1.58; g.add(hb);
    for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(.06, .02, .45), CCM.band); t.position.set(s * .08, 1.52, -.62); t.rotation.set(-.6, s * .25, 0); g.add(t); }
  },
  astro(g) {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(.62, 22, 16), CCM.dome); dome.position.y = 1.5; dome.renderOrder = 3; g.add(dome);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(.5, .08, 8, 26), CCM.suit); collar.rotation.x = Math.PI / 2; collar.position.y = .98; g.add(collar);
    const pack = new THREE.Mesh(new THREE.BoxGeometry(.55, .7, .25), CCM.suit); pack.position.set(0, .8, -.5); g.add(pack);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .4, 6), CCM.suit); ant.position.set(.18, 2.25, 0); g.add(ant);
    const tip = new THREE.Mesh(G_SPHERE, CCM.glow); tip.scale.setScalar(.07); tip.position.set(.18, 2.47, 0); g.add(tip);
  },
  rainbow(g, u) {
    u.body.material = CCM.rainbow;
    const halo = new THREE.Mesh(new THREE.TorusGeometry(.32, .04, 8, 28), CCM.halo); halo.rotation.x = Math.PI / 2; halo.position.y = 2.35; g.add(halo);
  },
});
for (const [id, c] of Object.entries(CASE_CHARS)) CHAR_SKINS[id] = { name: c.name, need: Infinity, case: true, rarity: c.rarity, icon: c.icon, hint: c.hint };

// переливы: радуга крутит оттенок, лава дышит
let caseT = 0;
function caseAnim(dt) {
  caseT += dt;
  const hue = (caseT * .12) % 1;
  CASE_MATS.cs_rainbow.metal.color.setHSL(hue, .85, .55);
  CASE_MATS.cs_rainbow.wood.emissive.setHSL((hue + .5) % 1, .9, .25);
  CCM.rainbow.color.setHSL(hue, .8, .55); CCM.rainbow.emissive.setHSL(hue, .9, .12);
  const pulse = .7 + Math.sin(caseT * 3) * .35;
  CASE_MATS.cs_lava.metal.emissiveIntensity = pulse; CASE_MATS.cs_lava.steel.emissiveIntensity = pulse * .9;
  CCM.glow.emissiveIntensity = 1 + Math.sin(caseT * 6) * .5;
}
(function loop() { let last = performance.now(); const f = t => { caseAnim(Math.min(.1, (t - last) / 1000)); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); })();

// ---------- всё, что лежит в кейсе ----------
const CASE_ITEMS = [];
for (const [id, c] of Object.entries(CASE_CHARS)) CASE_ITEMS.push({ key: 'char:' + id, kind: 'char', id, rarity: c.rarity, name: c.name, sub: 'Скин огурца', icon: c.icon });
for (const g of GUNS) for (const [id, s] of Object.entries(CASE_GUN_SKINS))
  CASE_ITEMS.push({ key: `gun:${g}:${id}`, kind: 'gun', gun: g, id, rarity: s.rarity, name: s.name, sub: g, icon: '🔫', colors: s.colors });

// ---------- кошелёк, инвентарь, задания ----------
const CASE_SAVE = { coins: START_COINS, inv: [], quests: null };
try { const s = JSON.parse(localStorage.getItem('ogurcy-case') || 'null'); if (s) Object.assign(CASE_SAVE, s); } catch (e) {}
const caseSave = () => { try { localStorage.setItem('ogurcy-case', JSON.stringify(CASE_SAVE)); } catch (e) {} };
function caseOwns(kind, key) { return CASE_SAVE.inv.includes(kind + ':' + key); }
function addCoins(n, why) {
  CASE_SAVE.coins = Math.max(0, CASE_SAVE.coins + n); caseSave(); renderCases();
  if (why && typeof announce === 'function' && typeof running !== 'undefined' && running) announce(`+${n} монет · ${why}`, '#ffd24a');
}

const QUEST_POOL = [
  { id: 'kills10', text: 'Нарежь 10 огурцов', goal: 10, ev: 'kill', reward: 50 },
  { id: 'kills25', text: 'Нарежь 25 огурцов', goal: 25, ev: 'kill', reward: 100 },
  { id: 'head3',   text: 'Сделай 3 нарезки в голову', goal: 3, ev: 'head', reward: 40 },
  { id: 'knife2',  text: 'Нарежь 2 огурца ножом', goal: 2, ev: 'knife', reward: 60 },
  { id: 'play3',   text: 'Доиграй 3 матча до конца', goal: 3, ev: 'match', reward: 50 },
  { id: 'loot5',   text: 'Подбери 5 ящиков или банок', goal: 5, ev: 'loot', reward: 30 },
  { id: 'win1',    text: 'Выиграй матч', goal: 1, ev: 'win', reward: 80 },
  { id: 'streak3', text: 'Сделай серию из 3 нарезок', goal: 1, ev: 'streak3', reward: 60 },
];
const today = () => new Date().toISOString().slice(0, 10);
// три задания на день: выбираются по дате, чтобы не менялись при перезагрузке
function questsForToday() {
  const d = today();
  if (CASE_SAVE.quests && CASE_SAVE.quests.day === d) return CASE_SAVE.quests;
  let seed = [...d].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  const r = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
  const pool = QUEST_POOL.slice(), list = [];
  while (list.length < 3) list.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  CASE_SAVE.quests = { day: d, list: list.map(q => ({ id: q.id, prog: 0, claimed: false })) };
  caseSave(); return CASE_SAVE.quests;
}
function questEvent(ev, n = 1) {
  const qs = questsForToday(); let changed = false;
  for (const q of qs.list) {
    const def = QUEST_POOL.find(x => x.id === q.id); if (!def || def.ev !== ev || q.claimed) continue;
    const before = q.prog; q.prog = Math.min(def.goal, q.prog + n); changed = changed || q.prog !== before;
    if (before < def.goal && q.prog >= def.goal && typeof announce === 'function' && running) announce(`Задание выполнено: ${def.text} — забери награду в разделе «Кейсы»`, '#ffd24a');
  }
  if (changed) { caseSave(); renderQuests(); }
}
function claimQuest(id) {
  const q = questsForToday().list.find(x => x.id === id), def = QUEST_POOL.find(x => x.id === id);
  if (!q || !def || q.claimed || q.prog < def.goal) return;
  q.claimed = true; addCoins(def.reward); renderQuests();
}

// ---------- события из боя ----------
function caseOnKill(by, head) {
  if (!by || !by.isPlayer) return;
  questEvent('kill');
  if (head) questEvent('head');
  if (by.weapon === 'knife') questEvent('knife');
  if (by.streak === 3) questEvent('streak3');
}
function caseOnMatchEnd(won) {
  questEvent('match');
  if (won) { questEvent('win'); addCoins(WIN_COINS, 'за победу'); }
}
function caseOnLoot() { questEvent('loot'); }

// ---------- открытие кейса ----------
function rollRarity() {
  let x = Math.random() * 100;
  for (const r of RARITY_ORDER) { x -= RARITY[r].chance; if (x < 0) return r; }
  return 'common';
}
function rollItem() {
  const rar = rollRarity(), pool = CASE_ITEMS.filter(i => i.rarity === rar);
  return pool[Math.floor(Math.random() * pool.length)];
}
let caseBusy = false;
function openCase() {
  if (caseBusy) return;
  if (CASE_SAVE.coins < CASE_PRICE) { const n = document.getElementById('caseMsg'); if (n) n.textContent = `Не хватает монет: нужно ${CASE_PRICE}, у тебя ${CASE_SAVE.coins}.`; return; }
  caseBusy = true;
  CASE_SAVE.coins -= CASE_PRICE; caseSave(); renderCases();
  const win = rollItem();
  // лента как в CS: 45 карточек, выигрыш на 38-й, лента едет и тормозит
  const reel = document.getElementById('caseReel'), modal = document.getElementById('caseModal');
  reel.textContent = ''; reel.style.transition = 'none'; reel.style.transform = 'translateX(0)';
  const cards = []; for (let i = 0; i < 45; i++) cards.push(i === 38 ? win : rollItem());
  for (const it of cards) reel.append(caseCard(it));
  document.getElementById('caseResult').textContent = ''; document.getElementById('caseResult').hidden = true;
  document.getElementById('caseActions').hidden = true;
  modal.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const cardW = reel.children[0].getBoundingClientRect().width + 8;
    const view = reel.parentElement.getBoundingClientRect().width;
    const target = 38 * cardW - view / 2 + cardW / 2 + (Math.random() - .5) * cardW * .6;
    reel.style.transition = 'transform 5.2s cubic-bezier(.08,.72,.12,1)';
    reel.style.transform = `translateX(${-target}px)`;
    // щелчки, пока лента едет
    let ticks = 0; const tick = setInterval(() => { if (typeof sfx === 'function') sfx('click', .35); if (++ticks > 26) clearInterval(tick); }, 190);
    setTimeout(() => { clearInterval(tick); caseReveal(win); }, 5400);
  }));
}
function caseCard(it) {
  const c = document.createElement('div'); c.className = 'caseCard'; c.style.setProperty('--rc', RARITY[it.rarity].color);
  const sw = document.createElement('div'); sw.className = 'sw';
  if (it.kind === 'gun') sw.style.background = `linear-gradient(135deg, ${it.colors.join(', ')})`;
  else { sw.textContent = it.icon; sw.classList.add('emo'); }
  const nm = document.createElement('b'); nm.textContent = it.name;
  const sb = document.createElement('small'); sb.textContent = it.kind === 'gun' ? WEAPONS[it.gun].name : 'Скин огурца';
  c.append(sw, nm, sb); return c;
}
function caseReveal(win) {
  caseBusy = false;
  const dup = CASE_SAVE.inv.includes(win.key), R = RARITY[win.rarity];
  if (dup) { CASE_SAVE.coins += R.refund; }
  else CASE_SAVE.inv.push(win.key);
  caseSave(); renderCases();
  const res = document.getElementById('caseResult');
  res.hidden = false; res.style.setProperty('--rc', R.color);
  res.innerHTML = '';
  const lbl = document.createElement('span'); lbl.className = 'rar'; lbl.textContent = R.name;
  const nm = document.createElement('b'); nm.textContent = `${win.name} · ${win.kind === 'gun' ? WEAPONS[win.gun].name : 'скин огурца'}`;
  const sub = document.createElement('small'); sub.textContent = dup ? `Уже есть — вернули ${R.refund} монет` : 'Новый предмет в инвентаре!';
  res.append(lbl, nm, sub);
  const act = document.getElementById('caseActions'); act.hidden = false;
  const eq = document.getElementById('caseEquip');
  eq.hidden = false; eq.onclick = () => { caseEquip(win); eq.hidden = true; };
  if (win.rarity === 'legendary' || win.rarity === 'epic') { if (typeof fanfare === 'function') fanfare(); }
}
function caseEquip(it) {
  if (it.kind === 'gun') setGunSkin(it.gun, it.id);
  else setCharSkin(it.id);
  renderCases();
}

// ---------- меню ----------
function renderCases() {
  const c = document.getElementById('coinCount'); if (c) c.textContent = CASE_SAVE.coins;
  const hc = document.getElementById('homeCoins'); if (hc) hc.textContent = CASE_SAVE.coins;
  const btn = document.getElementById('openCase'); if (btn) btn.disabled = caseBusy;
  const odds = document.getElementById('caseOdds');
  if (odds && !odds.childElementCount) for (const r of RARITY_ORDER) {
    const row = document.createElement('div'); row.className = 'oddRow'; row.style.setProperty('--rc', RARITY[r].color);
    const n = document.createElement('span'); n.textContent = RARITY[r].name;
    const p = document.createElement('b'); p.textContent = RARITY[r].chance + '%';
    row.append(n, p); odds.append(row);
  }
  const inv = document.getElementById('caseInv');
  if (inv) {
    inv.textContent = '';
    const own = CASE_ITEMS.filter(i => CASE_SAVE.inv.includes(i.key)).sort((a, b) => RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity));
    if (!own.length) { const p = document.createElement('p'); p.className = 'note'; p.textContent = 'Пока пусто — открой первый кейс.'; inv.append(p); }
    for (const it of own) {
      const card = caseCard(it);
      const on = it.kind === 'gun' ? gunSkinOf(it.gun) === it.id : charSkin === it.id;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ghost'; b.textContent = on ? 'Надет' : 'Надеть'; b.disabled = on;
      b.addEventListener('click', () => caseEquip(it));
      card.append(b); inv.append(card);
    }
  }
  const note = document.getElementById('caseMsg'); if (note && CASE_SAVE.coins >= CASE_PRICE) note.textContent = '';
}
function renderQuests() {
  const box = document.getElementById('questList'); if (!box) return;
  box.textContent = '';
  for (const q of questsForToday().list) {
    const def = QUEST_POOL.find(x => x.id === q.id); if (!def) continue;
    const row = document.createElement('div'); row.className = 'questRow';
    const t = document.createElement('span'); t.textContent = def.text;
    const bar = document.createElement('div'); bar.className = 'qbar'; const fill = document.createElement('i'); fill.style.width = (q.prog / def.goal * 100) + '%'; bar.append(fill);
    const pr = document.createElement('small'); pr.textContent = `${q.prog} / ${def.goal}`;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ghost';
    b.textContent = q.claimed ? 'Получено' : `+${def.reward} 🪙`;
    b.disabled = q.claimed || q.prog < def.goal;
    b.addEventListener('click', () => claimQuest(q.id));
    row.append(t, bar, pr, b); box.append(row);
  }
}
addEventListener('DOMContentLoaded', () => {
  const b = document.getElementById('openCase'); if (b) b.addEventListener('click', openCase);
  const cl = document.getElementById('caseClose'); if (cl) cl.addEventListener('click', () => { if (!caseBusy) document.getElementById('caseModal').hidden = true; });
  renderCases(); renderQuests();
  // скины из кейса видны и в обычных списках
  if (typeof renderGunSkins === 'function') renderGunSkins();
  if (typeof renderCharPick === 'function') renderCharPick();
});
