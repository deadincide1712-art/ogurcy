// ================= Огуречные Шокеры — скины оружия за нарезки и выбор основного ствола =================
const GUNS = ['rifle', 'shotgun', 'sniper', 'smg', 'rocket', 'pistol'];
const GUN_SKINS = {
  base:   { name: 'Заводской', need: 0 },
  camo:   { name: 'Огуречная кожура', need: 10, icon: '🥒' },
  tomato: { name: 'Томатный соус', need: 30, icon: '🍅' },
  gold:   { name: 'Золотой', need: 75, icon: '🏆' },
};

// ---------- материалы скинов ----------
const texCamo = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#2f5a1e'; g.fillRect(0, 0, w, h);
  const blot = ['#3f7a28', '#26451a', '#5f9a3a'];
  for (let i = 0; i < 26; i++) { g.fillStyle = blot[i % 3]; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 16, 5 + Math.random() * 9, Math.random() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 80; i++) { g.fillStyle = 'rgba(210,240,160,.55)'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1.6, 0, 7); g.fill(); } // пупырышки
}, 8);
const std = o => new THREE.MeshStandardMaterial(o);
const SKIN_MATS = {
  camo: {
    metal: std({ map: texCamo, roughness: .55, envMap, envMapIntensity: .3 }),
    dark: std({ color: 0x1f3a14, roughness: .6 }),
    steel: std({ color: 0x8fbf5a, metalness: .6, roughness: .3, envMap, envMapIntensity: .7 }),
    wood: std({ color: 0x8fcf5a, roughness: .45 }),
    poly: std({ color: 0x2f5a1e, map: texGrip, roughness: .8 }),
  },
  tomato: {
    metal: std({ color: 0xd8321f, metalness: .25, roughness: .25, envMap, envMapIntensity: .6 }),
    dark: std({ color: 0x8a1a10, roughness: .4 }),
    steel: std({ color: 0xf2efe6, metalness: .5, roughness: .25, envMap, envMapIntensity: .8 }),
    wood: std({ color: 0xf4e6c4, roughness: .5 }),
    poly: std({ color: 0x2e7d32, roughness: .6 }),       // рукояти цвета плодоножки
  },
  gold: {
    metal: KM.gold, steel: KM.gold, brass: KM.gold, engr: KM.gold, zuke: KM.gold,
    dark: std({ color: 0xa8781e, metalness: 1, roughness: .3, envMap, envMapIntensity: 1.2 }),
    wood: KM.ebony, poly: KM.ebony,
  },
};
const PART_OF = new Map([[WM.metal, 'metal'], [WM.dark, 'dark'], [WM.steel, 'steel'], [WM.wood, 'wood'], [WM.poly, 'poly'], [WM.brass, 'brass'], [WM.engr, 'engr'], [WM.zuke, 'zuke']]);
// перекрашивает собранную модель: каждая деталь получает материал своего типа из набора скина
function applyGunSkin(root, id) {
  const set = SKIN_MATS[id]; if (!set) return;
  root.traverse(o => {
    if (!o.isMesh || Array.isArray(o.material)) return;
    const part = PART_OF.get(o.material) || o.material.userData.part;
    if (part && set[part]) o.material = set[part];
  });
}

// ---------- прогресс: нарезки из каждого ствола ----------
let gunKills = {}, gunSkins = {};
try { gunKills = JSON.parse(localStorage.getItem('ogurcy-gunkills') || '{}') || {}; } catch (e) {}
try { gunSkins = JSON.parse(localStorage.getItem('ogurcy-gunskins') || '{}') || {}; } catch (e) {}
const gunSkinOpen = (k, s) => (gunKills[k] || 0) >= GUN_SKINS[s].need;
const gunSkinOf = k => (gunSkins[k] && GUN_SKINS[gunSkins[k]] && gunSkinOpen(k, gunSkins[k])) ? gunSkins[k] : 'base';
function saveGunProgress() {
  try { localStorage.setItem('ogurcy-gunkills', JSON.stringify(gunKills)); localStorage.setItem('ogurcy-gunskins', JSON.stringify(gunSkins)); } catch (e) {}
}
function setGunSkin(k, s) {
  if (!gunSkinOpen(k, s)) return;
  gunSkins[k] = s; saveGunProgress(); renderGunSkins();
  if (running && player && player.weapon === k) buildViewmodel();
}
function recordGunKill(weapon) {
  if (!GUNS.includes(weapon)) return;
  const before = gunKills[weapon] || 0, after = before + 1;
  gunKills[weapon] = after;
  for (const [id, sk] of Object.entries(GUN_SKINS)) {
    if (sk.need && before < sk.need && after >= sk.need) {
      gunSkins[weapon] = id;
      popUnlock(sk.icon, `${WEAPONS[weapon].name} · ${sk.name}`, 'Новый скин открыт!', `За ${sk.need} нарезок из этого ствола · уже надет · сменить можно в меню «Скины оружия»`);
      if (running && player && player.weapon === weapon) buildViewmodel();
    }
  }
  saveGunProgress(); renderGunSkins();
}
function popUnlock(icon, name, label, sub) {
  const box = document.getElementById('unlock'); if (!box) return;
  box.querySelector('.uLbl').textContent = label;
  box.querySelector('.uIcon').textContent = icon;
  box.querySelector('.uName').textContent = name;
  box.querySelector('.uSub').textContent = sub;
  box.hidden = false; box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  clearTimeout(unlockTimer); unlockTimer = setTimeout(() => { box.hidden = true; }, 4500);
  fanfare();
}

// ---------- меню: скины оружия ----------
function renderGunSkins() {
  const list = document.getElementById('gunSkinList'); if (!list) return;
  list.textContent = '';
  for (const k of GUNS) {
    const row = document.createElement('div'); row.className = 'gsRow';
    const head = document.createElement('div'); head.className = 'gsHead';
    const nm = document.createElement('b'); nm.textContent = WEAPONS[k].name;
    const cnt = document.createElement('span'); cnt.textContent = `нарезано: ${gunKills[k] || 0}`;
    head.append(nm, cnt);
    const chips = document.createElement('div'); chips.className = 'seg';
    for (const [id, sk] of Object.entries(GUN_SKINS)) {
      const b = document.createElement('button'); b.type = 'button';
      const open = gunSkinOpen(k, id);
      b.textContent = open ? (sk.icon ? sk.icon + ' ' : '') + sk.name : `🔒 ${sk.name} · ${sk.need}`;
      b.disabled = !open; b.classList.toggle('locked', !open);
      b.setAttribute('aria-pressed', String(gunSkinOf(k) === id));
      b.addEventListener('click', () => setGunSkin(k, id));
      chips.append(b);
    }
    row.append(head, chips); list.append(row);
  }
}

// ---------- основное оружие: выбор в меню и после смерти ----------
let nextPrimary = 'rifle';
try { const p = localStorage.getItem('ogurcy-primary'); if (GUNS.includes(p)) nextPrimary = p; } catch (e) {}
function setNextPrimary(k) {
  if (!GUNS.includes(k)) return;
  nextPrimary = k;
  try { localStorage.setItem('ogurcy-primary', k); } catch (e) {}
  renderPrimaryPick(); renderLoadout();
}
function renderPrimaryPick() {
  const box = document.getElementById('primaryPick'); if (!box) return;
  box.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.g === nextPrimary)));
}
// карточки на экране смерти: клавиши 1–6
function renderLoadout() {
  const box = document.getElementById('loadoutCards'); if (!box) return;
  if (!box.childElementCount) GUNS.forEach((k, i) => {
    const c = document.createElement('button'); c.type = 'button'; c.className = 'lcard'; c.dataset.g = k;
    c.innerHTML = `<kbd>${i + 1}</kbd><b></b><small></small>`;
    c.querySelector('b').textContent = WEAPONS[k].name;
    c.querySelector('small').textContent = { rifle: 'универсальный', shotgun: 'в упор', sniper: 'издалека', smg: 'скорострельный', rocket: 'взрывные огурцы', pistol: 'бесконечные патроны' }[k];
    c.addEventListener('mousedown', e => { e.stopPropagation(); setNextPrimary(k); });
    box.append(c);
  });
  box.querySelectorAll('.lcard').forEach(c => c.classList.toggle('on', c.dataset.g === nextPrimary));
}
// меню строим, когда загружены все скрипты: списку оружия (WEAPONS) нужен game.js
addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('primaryPick');
  if (box) box.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setNextPrimary(b.dataset.g); });
  renderPrimaryPick(); renderLoadout(); renderGunSkins();
});

// ---------- экран смерти: 5 секунд на выбор оружия, потом кнопка «Играть» ----------
function updateRespawnUI() {
  const btn = document.getElementById('respawnBtn'), info = document.getElementById('respawnInfo'); if (!btn) return;
  const left = Math.ceil(Math.max(0, player.respawn));
  btn.disabled = left > 0;
  btn.textContent = left > 0 ? `Играть через ${left}` : 'Играть';
  const forced = modeWeaponFor(player);
  document.getElementById('loadoutCards').hidden = !!forced;
  info.textContent = forced ? `В этом режиме оружие выдаётся само: ${WEAPONS[forced].name}` : 'Выбери оружие на следующую жизнь — клик или клавиши 1–6';
}
function respawnPlayer() {
  if (!running || gameOver || !player || player.alive || player.respawn > 0) return;
  spawn(player); hideCenter();
  document.getElementById('loadout').hidden = true;
  lockPointer();
}
addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('loadout'), btn = document.getElementById('respawnBtn');
  if (box) box.addEventListener('mousedown', e => e.stopPropagation()); // клики по экрану смерти не уходят в игру
  if (btn) btn.addEventListener('click', respawnPlayer);
});

// ---------- выход из матча в меню (кнопка на паузе) ----------
function leaveMatch() {
  if (typeof NET !== 'undefined' && NET.lobby) { netSend({ t: 'leave' }); return; }   // из сетевой игры — через сервер
  gameOver = true; running = false; mouseDown = false; scoped = false;
  if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock();
  document.getElementById('hud').hidden = true;
  document.getElementById('menu').hidden = false;
  const mp = document.getElementById('mainPanel'); if (mp) mp.hidden = false;
}
addEventListener('DOMContentLoaded', () => { const b = document.getElementById('leaveMatch'); if (b) b.addEventListener('click', leaveMatch); });

// ---------- вкладки меню ----------
function openTab(name) {
  const tabs = [...document.querySelectorAll('.tabs [role=tab]')]; if (!tabs.length) return;
  if (!tabs.some(t => t.dataset.tab === name)) name = 'play';
  tabs.forEach(t => { const on = t.dataset.tab === name; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
  document.querySelectorAll('.pane').forEach(pn => { pn.hidden = pn.id !== 'pane-' + name; });
  try { localStorage.setItem('ogurcy-tab', name); } catch (e) {}
}
addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.tabs'); if (!nav) return;
  nav.addEventListener('click', e => { const b = e.target.closest('[role=tab]'); if (b) openTab(b.dataset.tab); });
  nav.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const tabs = [...nav.querySelectorAll('[role=tab]')], i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; openTab(n.dataset.tab); n.focus();
  });
  let last = 'play'; try { last = localStorage.getItem('ogurcy-tab') || 'play'; } catch (e) {}
  openTab(last);
});
