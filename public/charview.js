// ================= Огуречные Шокеры — живое превью огурца в лобби =================
// Отдельный маленький рендер рядом с меню: тот же скин, нож и ствол, что выбраны в разделах.

const CV = { ren: null, scene: null, cam: null, model: null, t: 0 };

function charViewInit() {
  const cv = document.getElementById('charCanvas');
  if (!cv || CV.ren) return;
  CV.ren = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  CV.ren.setPixelRatio(Math.min(devicePixelRatio, 2));
  CV.ren.outputEncoding = THREE.sRGBEncoding;
  CV.scene = new THREE.Scene();
  CV.cam = new THREE.PerspectiveCamera(36, 1, .1, 30);
  CV.cam.position.set(0, 1.25, 4.4); CV.cam.lookAt(0, 1.05, 0);
  CV.scene.add(new THREE.HemisphereLight(0xf4ffe6, 0x40361f, 1.05));
  const key = new THREE.DirectionalLight(0xfff1cf, 1.3); key.position.set(2.5, 3.5, 3); CV.scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fe0ff, .55); rim.position.set(-3, 1.5, -2); CV.scene.add(rim);
  charViewRefresh();
}
// пересобрать модель: вызывается, когда сменили скин огурца, ствол или нож
function charViewRefresh() {
  if (!CV.scene) return;
  if (CV.model) CV.scene.remove(CV.model);
  const gun = typeof nextPrimary === 'string' ? nextPrimary : 'rifle';
  CV.model = makeCucumber(.27, 0xd4ec6a, gun, typeof charSkin === 'string' ? charSkin : 'classic');
  CV.model.position.y = -.1;
  CV.scene.add(CV.model);
}
function charViewFrame(dt) {
  if (!CV.ren || !CV.model) return;
  const cv = CV.ren.domElement, w = cv.clientWidth, h = cv.clientHeight;
  if (!w || !h) return;                                   // канвас спрятан — не тратим кадры
  if (cv.width !== Math.round(w * CV.ren.getPixelRatio()) || cv.height !== Math.round(h * CV.ren.getPixelRatio())) {
    CV.ren.setSize(w, h, false); CV.cam.aspect = w / h; CV.cam.updateProjectionMatrix();
  }
  CV.t += dt;
  CV.model.rotation.y = Math.sin(CV.t * .5) * .9;          // огурец медленно поворачивается туда-сюда
  CV.model.position.y = -.1 + Math.sin(CV.t * 1.6) * .015; // и чуть дышит
  CV.ren.render(CV.scene, CV.cam);
}
// канвас переезжает между главным экраном и панелью лобби — он всегда там, где ты сейчас
function charViewMoveTo(id) {
  const cv = document.getElementById('charCanvas'), host = document.getElementById(id);
  if (cv && host && cv.parentElement !== host) host.append(cv);
}
addEventListener('DOMContentLoaded', () => { charViewInit(); });
