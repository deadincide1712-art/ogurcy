// ================= Огуречные Шокеры — музыка и громкость =================
// Музыка синтезируется прямо в браузере: никаких файлов, работает и офлайн.
// В бою — огуречная полька-рок (бочка, «ум-па» бас, аккорды, балалайка с тремоло), в меню — спокойные аккорды.

// ---------- настройки громкости ----------
const AUDIO_CFG = { music: 55, sfx: 80, focusOnly: true };
try { Object.assign(AUDIO_CFG, JSON.parse(localStorage.getItem('ogurcy-audio') || '{}')); } catch (e) {}
const volCurve = v => Math.pow(Math.max(0, Math.min(100, v)) / 100, 2); // на слух ровнее, чем линейно
function applyVolumes() {
  if (!actx) return;
  sfxBus.gain.setTargetAtTime(volCurve(AUDIO_CFG.sfx), actx.currentTime, .05);
  musicBus.gain.setTargetAtTime(volCurve(AUDIO_CFG.music) * .55, actx.currentTime, .05);
  updateAudible();
}
function setVolume(kind, v) {
  AUDIO_CFG[kind] = Math.round(v);
  try { localStorage.setItem('ogurcy-audio', JSON.stringify(AUDIO_CFG)); } catch (e) {}
  applyVolumes(); syncVolumeUI();
}
function syncVolumeUI() {
  for (const kind of ['music', 'sfx']) document.querySelectorAll('.vol-' + kind).forEach(inp => {
    inp.value = AUDIO_CFG[kind];
    const out = inp.parentElement.querySelector('output'); if (out) out.textContent = AUDIO_CFG[kind] ? AUDIO_CFG[kind] + '%' : 'выкл';
  });
  document.querySelectorAll('.audio-focus').forEach(cb => cb.checked = !!AUDIO_CFG.focusOnly);
}

// ---------- инструменты ----------
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function env(g, t, peak, a, d) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
function voice(type, freq, t, peak, a, d, filterHz, out = musicBus) {
  const o = actx.createOscillator(), g = actx.createGain(); o.type = type; o.frequency.value = freq;
  let node = o;
  if (filterHz) { const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filterHz; o.connect(f); node = f; }
  node.connect(g); g.connect(out); env(g, t, peak, a, d); o.start(t); o.stop(t + a + d + .05);
  return o;
}
const INST = {
  kick(t) {
    const o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .12);
    o.connect(g); g.connect(musicBus); env(g, t, .9, .005, .28); o.start(t); o.stop(t + .32);
  },
  snare(t) {
    const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
    s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = .7;
    s.connect(f); f.connect(g); g.connect(musicBus); env(g, t, .42, .003, .15); s.start(t); s.stop(t + .2);
    voice('triangle', 190, t, .2, .002, .07);
  },
  hat(t, open) {
    const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 7200;
    s.connect(f); f.connect(g); g.connect(musicBus); env(g, t, open ? .14 : .1, .002, open ? .14 : .04); s.start(t); s.stop(t + .2);
  },
  bass(t, m, dur) { voice('triangle', mtof(m), t, .5, .01, dur * .9); voice('square', mtof(m), t, .08, .01, dur * .6, 500); },
  stab(t, notes, vol = .09) { for (const m of notes) voice('square', mtof(m), t, vol, .004, .11, 2400); },
  // балалайка: звонкий щипок; длинные ноты — тремоло (быстрые повторы)
  pluck(t, m, dur, vol = .16, step = 0) {
    const reps = 1; // без тремоло: быстрые повторы на слух «троили»
    for (let i = 0; i < reps; i++) {
      const tt = t + i * (reps > 1 ? .075 : 0), v = reps > 1 ? vol * (i === 0 ? 1 : .55) : vol;
      const o = actx.createOscillator(), f = actx.createBiquadFilter(), g = actx.createGain();
      o.type = 'sawtooth'; o.frequency.value = mtof(m);
      f.type = 'lowpass'; f.frequency.setValueAtTime(4200, tt); f.frequency.exponentialRampToValueAtTime(900, tt + .15);
      o.connect(f); f.connect(g); g.connect(musicBus); env(g, tt, v, .004, Math.min(.6, Math.max(.18, dur)));
      o.start(tt); o.stop(tt + .4);
    }
  },
  pad(t, notes, dur) { for (const m of notes) voice('triangle', mtof(m), t, .07, dur * .35, dur * .9, 1600); },
};

// ---------- ноты ----------
// аккорды по тактам (8 тактов, ля минор): корень и тип
const CHORDS = [[45, 'm'], [50, 'm'], [40, 'M'], [45, 'm'], [45, 'm'], [43, 'M'], [48, 'M'], [40, 'M']];
const triad = (root, type) => [root, root + (type === 'm' ? 3 : 4), root + 7];
// мелодия: [такт, шаг (1/16), нота midi, длина в шагах]
const MELODY = [
  [0, 0, 76, 2], [0, 2, 69, 2], [0, 4, 72, 2], [0, 6, 76, 2], [0, 8, 74, 2], [0, 10, 72, 2], [0, 12, 71, 4],
  [1, 0, 69, 2], [1, 2, 74, 2], [1, 4, 77, 4], [1, 8, 76, 2], [1, 10, 74, 2], [1, 12, 72, 4],
  [2, 0, 71, 2], [2, 2, 68, 2], [2, 4, 71, 2], [2, 6, 76, 2], [2, 8, 74, 2], [2, 10, 71, 2], [2, 12, 68, 4],
  [3, 0, 69, 4], [3, 4, 72, 2], [3, 6, 76, 2], [3, 8, 81, 6],
  [4, 0, 81, 2], [4, 2, 79, 2], [4, 4, 76, 2], [4, 6, 72, 2], [4, 8, 76, 2], [4, 10, 81, 2], [4, 12, 79, 4],
  [5, 0, 79, 2], [5, 2, 77, 2], [5, 4, 74, 2], [5, 6, 71, 2], [5, 8, 74, 2], [5, 10, 79, 2], [5, 12, 77, 4],
  [6, 0, 76, 2], [6, 2, 72, 2], [6, 4, 67, 2], [6, 6, 72, 2], [6, 8, 76, 2], [6, 10, 79, 2], [6, 12, 76, 4],
  [7, 0, 74, 2], [7, 2, 71, 2], [7, 4, 68, 2], [7, 6, 71, 2], [7, 8, 76, 4], [7, 14, 64, 2],
];
const melodyAt = {}; for (const [bar, st, m, len] of MELODY) melodyAt[bar * 16 + st] = [m, len];

const TRACKS = {
  battle: {
    bpm: 132,
    step(i, t, sd) {
      const bar = Math.floor(i / 16) % 8, s = i % 16, [root, type] = CHORDS[bar], ch = triad(root, type);
      if (s === 0 || s === 8 || (bar % 4 === 3 && s === 14)) INST.kick(t);
      if (s === 4 || s === 12) INST.snare(t);
      if (s % 2 === 0) INST.hat(t, s % 4 === 2);
      if (s === 0) INST.bass(t, root, sd * 3.5);
      if (s === 8) INST.bass(t, root + 7 - 12, sd * 3.5);
      if (s % 4 === 2) INST.stab(t, ch.map(n => n + 12));                // «па» польки на слабые доли
      const mel = melodyAt[(i % 128)];
      if (mel && Math.floor(i / 128) % 2 === 0) INST.pluck(t, mel[0], mel[1] * sd);      // каждый второй проход — без мелодии, только ритм
      else if (mel && s % 4 === 0) INST.pluck(t, mel[0] - 12, sd * 2, .08);           // …но с тихим отголоском октавой ниже
    },
  },
  menu: {
    bpm: 84,
    step(i, t, sd) {
      const bar = Math.floor(i / 16) % 8, s = i % 16, [root, type] = CHORDS[bar], ch = triad(root, type);
      if (s === 0) { INST.pad(t, ch.map(n => n + 12), sd * 16); INST.bass(t, root, sd * 8); }
      if (s % 2 === 0) { const arp = [ch[0], ch[1], ch[2], ch[1] + 12]; INST.pluck(t, arp[(s / 2) % 4] + 24, sd * 1.5, .07); }
      if (s === 12 && bar % 2 === 1) INST.hat(t, true);
    },
  },
};

// ---------- проигрыватель: планирует ноты чуть наперёд ----------
const Music = { cur: null, want: 'menu', step: 0, next: 0, timer: null };
function musicStart() {
  if (!actx || Music.timer) return;
  Music.next = actx.currentTime + .1; Music.step = 0; Music.cur = Music.want;
  Music.timer = setInterval(() => {
    if (!actx || actx.state !== 'running') return;
    Music.want = typeof running !== 'undefined' && running && !gameOver && document.getElementById('menu').hidden ? 'battle' : 'menu';
    if (Music.next < actx.currentTime - .3) {
      const sd = 60 / TRACKS[Music.cur].bpm / 4, miss = Math.ceil((actx.currentTime - Music.next) / sd);
      Music.step += miss; Music.next += miss * sd;
    }
    while (Music.next < actx.currentTime + .35) {
      if (Music.step % 16 === 0 && Music.want !== Music.cur) { Music.cur = Music.want; Music.step = 0; } // смена трека — с начала такта
      const tr = TRACKS[Music.cur], sd = 60 / tr.bpm / 4;
      if (AUDIO_CFG.music > 0 && audible) tr.step(Music.step, Music.next, sd);
      Music.next += sd; Music.step++;
    }
  }, 30);
}
// звук включается по первому клику (так требует браузер)
addEventListener('pointerdown', () => { audioInit(); applyVolumes(); musicStart(); }, true);
document.addEventListener('visibilitychange', () => {
  if (!actx) return;
  if (document.hidden) actx.suspend(); else { actx.resume(); Music.next = actx.currentTime + .1; }
});

// ---------- звук только в активном окне ----------
// Если открыто несколько вкладок или окон с игрой, играет только та, где ты сейчас.
const TAB_ID = Math.random().toString(36).slice(2);
let claimed = true, audible = true, winFocused = true;
const tabChan = typeof BroadcastChannel === 'function' ? new BroadcastChannel('ogurcy-audio') : null;
if (tabChan) tabChan.onmessage = e => { if (e.data && e.data.active && e.data.active !== TAB_ID) { claimed = false; updateAudible(); } };
function claimAudio() { claimed = true; if (tabChan) tabChan.postMessage({ active: TAB_ID }); updateAudible(); }
function updateAudible() {
  const next = !AUDIO_CFG.focusOnly || (claimed && winFocused && !document.hidden);
  if (next === audible && masterBus && masterBus._set) return;   // громкость меняем только когда состояние правда изменилось
  audible = next;
  if (actx && masterBus) { masterBus.gain.cancelScheduledValues(actx.currentTime); masterBus.gain.setTargetAtTime(audible ? 1 : 0, actx.currentTime, .15); masterBus._set = true; }
}
addEventListener('focus', () => { winFocused = true; claimAudio(); });
addEventListener('blur', () => setTimeout(() => { if (!document.hasFocus()) { winFocused = false; updateAudible(); } }, 250));
addEventListener('keydown', () => { if (!claimed) claimAudio(); }, true);
addEventListener('pointerdown', () => { winFocused = true; claimAudio(); }, true);
document.addEventListener('visibilitychange', updateAudible);

// ---------- ползунки в меню и на паузе ----------
document.querySelectorAll('.vol-music, .vol-sfx').forEach(inp => {
  const kind = inp.classList.contains('vol-music') ? 'music' : 'sfx';
  inp.addEventListener('input', () => { audioInit(); setVolume(kind, +inp.value); musicStart(); });
  if (kind === 'sfx') inp.addEventListener('change', () => sfx('hit', 1));   // проба громкости эффектов
});
const pauseBox = document.getElementById('pauseBox');
if (pauseBox) pauseBox.addEventListener('mousedown', e => e.stopPropagation()); // клик по ползунку не возвращает в бой
document.querySelectorAll('.audio-focus').forEach(cb => cb.addEventListener('change', () => {
  AUDIO_CFG.focusOnly = cb.checked;
  try { localStorage.setItem('ogurcy-audio', JSON.stringify(AUDIO_CFG)); } catch (e) {}
  syncVolumeUI(); updateAudible();
}));
syncVolumeUI();
