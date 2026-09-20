// ================= Огуречные Шокеры — нож: удары, удар в спину, осмотр на F =================
const KNIFE_SKINS = {
  chef: { name: 'Шинковщик', need: 0, icon: '🔪' },
  karambit: { name: 'Керамбит «Чили»', gen: 'керамбита «Чили»', need: 25, icon: '🌶️' },
  butterfly: { name: 'Бабочка «Горошек»', gen: 'бабочки «Горошек»', need: 60, icon: '🫛' },
  golden: { name: 'Золотой нож', gen: 'золотого ножа', need: 150, icon: '🏆' },
};
// поза в руках: у керамбита лезвие загнуто вниз, поэтому он держится выше
const KNIFE_POSE = {
  chef:      { pos: [.13, -.1, -.26], rot: [.25, .4, -.4] },
  karambit:  { pos: [.1, -.075, -.24], rot: [.75, .45, -.3] },
  butterfly: { pos: [.1, -.08, -.24], rot: [.3, .45, -.5] },
  golden:    { pos: [.13, -.1, -.26], rot: [.25, .4, -.4] },
};
let knifeSkin = 'chef';
// ---------- скины ножей: открываются за нарезки этим же ножом ----------
const KNIFE_FINS = {
  base:   { name: 'Заводской', need: 0 },
  garlic: { name: 'Чеснок', need: 10, icon: '🧄' },
  chili:  { name: 'Чили', need: 30, icon: '🌶️' },
  gold:   { name: 'Золотой', need: 75, icon: '🏆' },
};
let knifeKills = {}, knifeFins = {};
try { knifeKills = JSON.parse(localStorage.getItem('ogurcy-knifekills') || '{}') || {}; } catch (e) {}
try { knifeFins = JSON.parse(localStorage.getItem('ogurcy-knifefins') || '{}') || {}; } catch (e) {}
const knifeFinOpen = (k, f) => (knifeKills[k] || 0) >= KNIFE_FINS[f].need;
const knifeFinOf = k => (knifeFins[k] && KNIFE_FINS[knifeFins[k]] && knifeFinOpen(k, knifeFins[k])) ? knifeFins[k] : 'base';
function saveKnifeFins() {
  try { localStorage.setItem('ogurcy-knifekills', JSON.stringify(knifeKills)); localStorage.setItem('ogurcy-knifefins', JSON.stringify(knifeFins)); } catch (e) {}
}
function setKnifeFin(k, f) {
  if (!knifeFinOpen(k, f)) return;
  knifeFins[k] = f; saveKnifeFins(); renderKnifeFins();
  if (running && player && player.weapon === 'knife' && k === knifeSkin) buildViewmodel();
}
function recordKnifeKill() {
  const k = knifeSkin, before = knifeKills[k] || 0, after = before + 1;
  knifeKills[k] = after;
  for (const [id, f] of Object.entries(KNIFE_FINS)) {
    if (f.need && before < f.need && after >= f.need) {
      knifeFins[k] = id;
      popUnlock(f.icon, `${KNIFE_SKINS[k].name} · ${f.name}`, 'Новый скин ножа!', `За ${f.need} нарезок этим ножом · уже надет · сменить можно в разделе «Ножи»`);
      if (running && player && player.weapon === 'knife') buildViewmodel();
    }
  }
  saveKnifeFins(); renderKnifeFins();
}
function renderKnifeFins() {
  const list = document.getElementById('knifeSkinList'); if (!list) return;
  list.textContent = '';
  for (const k of Object.keys(KNIFE_SKINS)) {
    if (!isUnlocked(k)) continue;
    const row = document.createElement('div'); row.className = 'gsRow';
    const head = document.createElement('div'); head.className = 'gsHead';
    const nm = document.createElement('b'); nm.textContent = KNIFE_SKINS[k].name;
    const cnt = document.createElement('span'); cnt.textContent = `нарезано: ${knifeKills[k] || 0}`;
    head.append(nm, cnt);
    const chips = document.createElement('div'); chips.className = 'seg';
    for (const [id, f] of Object.entries(KNIFE_FINS)) {
      const b = document.createElement('button'); b.type = 'button';
      const open = knifeFinOpen(k, id);
      b.textContent = open ? (f.icon ? f.icon + ' ' : '') + f.name : `🔒 ${f.name} · ${f.need}`;
      b.disabled = !open; b.classList.toggle('locked', !open);
      b.setAttribute('aria-pressed', String(knifeFinOf(k) === id));
      b.addEventListener('click', () => setKnifeFin(k, id));
      chips.append(b);
    }
    row.append(head, chips); list.append(row);
  }
}

let totalKills = 0;
try { totalKills = +(JSON.parse(localStorage.getItem('ogurcy-progress') || '{}').kills) || 0; } catch (e) {}
const isUnlocked = s => KNIFE_SKINS[s] && totalKills >= KNIFE_SKINS[s].need;
try { const s = localStorage.getItem('ogurcy-knife'); if (KNIFE_SKINS[s] && isUnlocked(s)) knifeSkin = s; } catch (e) {}
function recordKill(weapon) {
  const before = totalKills;
  totalKills += weapon === 'knife' ? 2 : 1;
  if (weapon === 'knife') recordKnifeKill();
  try { localStorage.setItem('ogurcy-progress', JSON.stringify({ kills: totalKills })); } catch (e) {}
  for (const [k, sk] of Object.entries(KNIFE_SKINS)) if (sk.need && before < sk.need && totalKills >= sk.need) showUnlock(k);
  if (typeof checkCharUnlocks === 'function') checkCharUnlocks(before, totalKills);
  renderKnifePick();
}
let unlockTimer = null;
function showUnlock(k) {
  const sk = KNIFE_SKINS[k], box = document.getElementById('unlock'); if (!box) return;
  setKnifeSkin(k);
  box.querySelector('.uLbl').textContent = 'Новый нож открыт!'; box.querySelector('.uIcon').textContent = sk.icon;
  box.querySelector('.uName').textContent = sk.name;
  box.querySelector('.uSub').textContent = `За ${sk.need} нарезок · уже в руках, жми 7 · другой нож выбирается в меню`;
  box.hidden = false; box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  clearTimeout(unlockTimer); unlockTimer = setTimeout(() => { box.hidden = true; }, 4500);
  fanfare();
}
function fanfare() {
  if (!actx) return;
  const t0 = actx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain(), t = t0 + i * .11;
    o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.22, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + (i === 3 ? .6 : .22));
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .65);
  });
}
function setKnifeSkin(s) {
  if (!KNIFE_SKINS[s] || !isUnlocked(s)) return;
  knifeSkin = s;
  try { localStorage.setItem('ogurcy-knife', s); } catch (e) {}
  if (running && player && player.weapon === 'knife') buildViewmodel();
  renderKnifeFins();
}

// ---------- удары ----------
let swing = null, inspect = null, swingDir = 1;
const knifeAuth = () => typeof authority !== 'function' || authority();
function meleeAttack(e, heavy) {
  if (!e.alive || e.cool > 0) return false;
  e.cool = heavy ? .95 : .42;
  e.meleePending = { t: heavy ? .2 : .07, heavy };
  if (e.isPlayer) { swingDir = -swingDir; swing = { t: 0, heavy, dur: heavy ? .6 : .34, dir: swingDir }; inspect = null; }
  else e.gunKick = 1.3;
  whoosh(e.isPlayer ? 1 : Math.max(0, 1 - e.pos.distanceTo(player.pos) / 30));
  if (netOn() && e.isPlayer) relay({ k: 'swing', id: e.id, h: heavy });
  return true;
}
// удар доходит до цели чуть позже начала взмаха
function updateKnife(dt) {
  for (const e of ents) {
    const m = e.meleePending; if (!m) continue;
    m.t -= dt; if (m.t > 0) continue;
    e.meleePending = null;
    if (!e.alive || (!e.isPlayer && !knifeAuth())) continue;
    resolveMelee(e, m.heavy);
  }
}
function resolveMelee(e, heavy) {
  const o = eyeOf(e, new THREE.Vector3()), d = dirOf(e.yaw, e.pitch, new THREE.Vector3());
  let best = null, bd = 2.7;
  for (const v of ents) {
    if (v === e || !v.alive || !isEnemy(e, v)) continue;
    const c = new THREE.Vector3(v.pos.x, v.pos.y + 1.1, v.pos.z), to = c.sub(o), dist = to.length();
    if (dist > bd) continue;
    to.normalize(); if (to.dot(d) < .7) continue;
    if (rayWorld(o, to, dist) < dist - .5) continue;
    best = v; bd = dist;
  }
  if (!best) {
    // промах: если рядом стена — щепки и глухой стук
    const t = rayWorld(o, d, 2.2);
    if (t < 2.2 && e.isPlayer) { burst(o.clone().addScaledVector(d, t), 0x9b7a4c, 6, 2.5, .3); sfx('click', .6); }
    return;
  }
  // удар в спину — если жертва смотрит от нас
  const face = dirOf(best.yaw, 0, new THREE.Vector3()), from = new THREE.Vector3(e.pos.x - best.pos.x, 0, e.pos.z - best.pos.z).normalize();
  const back = face.dot(from) < -.35;
  const dmg = back ? 100 : heavy ? 70 : 38;
  const hitPos = new THREE.Vector3(best.pos.x, best.pos.y + 1.1, best.pos.z);
  if (knifeAuth()) damage(best, dmg, e, back, d);
  else if (e.isPlayer) relay({ k: 'hit', v: best.id, dmg, h: back, w: 'knife', dx: r2(d.x), dz: r2(d.z) }, 'host');
  burst(hitPos, 0xcfe38a, back ? 18 : 9, 3.5, .45);
  if (e.isPlayer) {
    sfx('chop', .9);
    if (!knifeAuth()) hitMarker(back);
    if (back) announce('Со спины!', '#ff9a7a');
    shake = Math.max(shake, heavy || back ? .12 : .05);
  }
}
function whoosh(vol) {
  if (!actx || vol < .03) return;
  const t = actx.currentTime, s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
  s.buffer = noiseBuf; f.type = 'bandpass'; f.Q.value = 1.2;
  f.frequency.setValueAtTime(700, t); f.frequency.exponentialRampToValueAtTime(2600, t + .12);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.35 * vol, t + .04); g.gain.exponentialRampToValueAtTime(.001, t + .16);
  s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + .18);
}

// ---------- осмотр (F) ----------
function startInspect() {
  if (!player || !player.alive || player.reloading > 0 || scoped) return;
  if (inspect && inspect.t < inspect.dur * .8) return;
  const melee = WEAPONS[player.weapon].melee;
  const list = melee ? KNIFE_ANIMS[knifeSkin] : null;
  const anim = list ? list[Math.floor(Math.random() * list.length)] : null;   // какая анимация выпадет — случайно
  inspect = { t: 0, dur: anim ? anim.dur : 2, melee, anim };
}
function cancelInspect() { inspect = null; swing = null; }
const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
const seg = (t, a, b) => ease((t - a) / (b - a));
// добавляет к позе оружия в руках взмах и осмотр
function updateKnifeVM(dt) {
  const spin = vmW && vmW.spin;
  if (KM.gold) KM.gold.emissiveIntensity = .22 + Math.sin(performance.now() / 280) * .12; // золото переливается
  if (spin) spin.rotation.set(0, 0, 0);
  if (vmW && vmW.handles) { vmW.handles[0].rotation.x = 0; vmW.handles[1].rotation.x = 0; }
  if (swing) {
    swing.t += dt; const p = Math.min(1, swing.t / swing.dur), s = Math.sin(p * Math.PI);
    if (!swing.heavy) {
      vm.rotation.z += s * 1.1 * swing.dir; vm.rotation.y += s * .55 * swing.dir; vm.rotation.x -= s * .25;
      vm.position.x -= s * .1 * swing.dir; vm.position.z -= s * .07;
    } else {
      const wind = seg(p, 0, .3), stab = Math.sin(seg(p, .3, 1) * Math.PI);
      vm.position.z += wind * .05 * (1 - seg(p, .3, .45)) - stab * .22; vm.rotation.x += wind * .35 - stab * .5;
      vm.position.y += stab * .04; vm.position.x -= stab * .06;
    }
    if (p >= 1) swing = null;
  }
  if (!inspect) return;
  inspect.t += dt;
  const t = inspect.t / inspect.dur, inO = seg(t, 0, .15) * (1 - seg(t, .85, 1));
  if (!inspect.melee) {
    // ружьё: поворачиваем боком к себе, чуть покачиваем
    vm.rotation.y += inO * .95; vm.rotation.z += inO * .45 + Math.sin(t * 9) * .03 * inO;
    vm.position.x -= inO * .06; vm.position.y += inO * .035; vm.position.z -= inO * .05;
  } else {
    // отводим нож подальше от лица, чтобы при вращении он не закрывал экран
    vm.rotation.y += inO * .7; vm.rotation.x += inO * .25; vm.position.x -= inO * .07; vm.position.y += inO * .045; vm.position.z -= inO * .17;
    if (inspect.anim) inspect.anim.fn(t, { vm, spin, handles: vmW.handles, inO });
  }
  if (inspect.t >= inspect.dur) inspect = null;
}

// ---------- анимации осмотра: по две на каждый нож, выпадают случайно ----------
const KNIFE_ANIMS = {
  chef: [
    { dur: 2.4, fn: (t, c) => {   // показать обе стороны и подбросить с оборотом
      c.spin.rotation.z = seg(t, .25, .4) * Math.PI - seg(t, .45, .6) * Math.PI;
      c.spin.rotation.x = -seg(t, .6, .82) * Math.PI * 2;
      c.vm.position.y += Math.sin(seg(t, .6, .82) * Math.PI) * .06;
    } },
    { dur: 2.6, fn: (t, c) => {   // три быстрых шинковки по воздуху и вертушка на пальце
      let chop = 0;
      for (const a of [.08, .2, .32]) chop += Math.sin(seg(t, a, a + .1) * Math.PI);
      c.vm.position.y -= chop * .07; c.vm.rotation.x += chop * .5;
      c.spin.rotation.x = seg(t, .46, .8) * Math.PI * 4;                       // вертушка вокруг рукояти
      c.spin.rotation.z = Math.sin(seg(t, .46, .8) * Math.PI) * .5;
      c.vm.position.x -= Math.sin(seg(t, .46, .86) * Math.PI) * .04;
      c.vm.rotation.z += seg(t, .84, .95) * .35 * (1 - seg(t, .95, 1));        // финальный доворот лезвием к себе
    } },
  ],
  karambit: [
    { dur: 2.4, fn: (t, c) => {   // два оборота на кольце-хвостике, потом лезвие к камере
      c.spin.rotation.x = -(seg(t, .15, .45) + seg(t, .5, .72)) * Math.PI * 2;
      c.spin.rotation.z = seg(t, .75, .85) * .6 * (1 - seg(t, .88, .95));
    } },
    { dur: 2.8, fn: (t, c) => {   // перехват в обратный хват, вертолёт на кольце и возврат
      const grip = seg(t, .1, .26) - seg(t, .74, .9);
      c.spin.rotation.z = grip * Math.PI;                                      // переворот в обратный хват
      c.spin.rotation.x = -seg(t, .3, .68) * Math.PI * 6;                      // три оборота вокруг кольца
      c.spin.rotation.y = Math.sin(seg(t, .3, .7) * Math.PI) * .7;
      c.vm.position.x -= Math.sin(seg(t, .3, .72) * Math.PI) * .05;
      c.vm.position.y += Math.sin(seg(t, .3, .72) * Math.PI) * .03;
      c.vm.rotation.z -= grip * .3;
    } },
  ],
  butterfly: [
    { dur: 2.8, fn: (t, c) => {   // классика: закрыть, открыть, закрыть, открыть — с кувырками
      const flips = [[.12, .24], [.28, .4], [.46, .58], [.62, .74]];
      let a = 0; flips.forEach(([f0, f1], i) => { a += (i % 2 ? -1 : 1) * seg(t, f0, f1) * Math.PI; });
      c.handles[0].rotation.x = a; c.handles[1].rotation.x = -a;
      c.spin.rotation.z = seg(t, .12, .74) * Math.PI * 4;
      c.vm.position.y += Math.sin(seg(t, .76, .9) * Math.PI) * .05;
      c.spin.rotation.x = -seg(t, .76, .9) * Math.PI * 2;
    } },
    { dur: 3.2, fn: (t, c) => {   // «вертолёт»: створки расходятся веером, нож крутится и уходит в подброс
      const fan = seg(t, .06, .2) - seg(t, .76, .9);
      c.handles[0].rotation.x = fan * Math.PI * .9;
      c.handles[1].rotation.x = -fan * Math.PI * .9 + Math.sin(seg(t, .24, .62) * Math.PI * 3) * .8; // вторая створка мелет
      c.spin.rotation.z = (seg(t, .2, .46) + seg(t, .48, .7)) * Math.PI * 2;                          // два полных оборота
      c.spin.rotation.y = Math.sin(seg(t, .22, .72) * Math.PI) * 1.1;                                 // разворот лезвием к камере
      const toss = Math.sin(seg(t, .66, .94) * Math.PI);
      c.vm.position.y += toss * .085; c.vm.position.z -= toss * .05;                                  // подброс и ловля
      c.spin.rotation.x = -seg(t, .66, .94) * Math.PI * 2;
      c.vm.rotation.z += Math.sin(seg(t, .1, .95) * Math.PI) * .25;
    } },
  ],
  golden: [
    { dur: 2.4, fn: (t, c) => {   // как у шинковщика: обе стороны и оборот
      c.spin.rotation.z = seg(t, .25, .4) * Math.PI - seg(t, .45, .6) * Math.PI;
      c.spin.rotation.x = -seg(t, .6, .82) * Math.PI * 2;
      c.vm.position.y += Math.sin(seg(t, .6, .82) * Math.PI) * .06;
    } },
    { dur: 3, fn: (t, c) => {     // медленная «витрина»: нож проплывает перед лицом, ловя блики
      c.spin.rotation.y = seg(t, .1, .5) * Math.PI * 2;
      c.spin.rotation.z = Math.sin(seg(t, .1, .6) * Math.PI) * .45;
      c.vm.position.y += Math.sin(seg(t, .05, .6) * Math.PI) * .05;
      c.vm.position.x -= Math.sin(seg(t, .05, .6) * Math.PI) * .05;
      c.spin.rotation.x = -seg(t, .62, .92) * Math.PI * 4;                     // финальная двойная вертушка
      c.vm.position.y += Math.sin(seg(t, .62, .92) * Math.PI) * .07;
    } },
  ],
};

// ---------- выбор ножа в меню: закрытые — с замком и порогом ----------
function renderKnifePick() {
  const box = document.getElementById('knifePick'); if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    const sk = KNIFE_SKINS[b.dataset.k], open = isUnlocked(b.dataset.k);
    b.disabled = !open; b.classList.toggle('locked', !open);
    b.textContent = open ? sk.name : `🔒 ${sk.name} · ${sk.need}`;
    b.setAttribute('aria-pressed', String(b.dataset.k === knifeSkin));
    b.title = open ? '' : `Откроется, когда нарежешь ${sk.need} огурцов`;
  });
  const next = Object.values(KNIFE_SKINS).filter(sk => sk.need > totalKills).sort((x, y) => x.need - y.need)[0];
  const pr = document.getElementById('knifeProgress');
  if (pr) pr.textContent = next
    ? `Нарезано всего: ${totalKills}. До ${next.gen} ещё ${next.need - totalKills}. Нарезка ножом засчитывается за две.`
    : `Нарезано всего: ${totalKills}. Все ножи открыты!`;
}
(() => {
  const box = document.getElementById('knifePick'); if (!box) return;
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) { setKnifeSkin(b.dataset.k); renderKnifePick(); } });
  renderKnifePick(); renderKnifeFins();
})();
