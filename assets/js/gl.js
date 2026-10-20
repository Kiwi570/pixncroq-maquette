/* Pix'n Croq · effets WebGL (OGL) : développement des tirages et soleil rasant.
   Chaque effet a une version sans WebGL ; la photo finit toujours intacte. */
import { Renderer, Program, Mesh, Triangle, Texture } from '../vendor/ogl.min.js';

const PX = window.PX || {};
const G = window.gsap;

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const fragDeveloppe = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uRes;
uniform vec2 uImg;
uniform float uP;
uniform float uT;
uniform vec3 uPapier;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float bruit(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
vec2 couvrir(vec2 uv) {
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}
void main() {
  float reste = 1.0 - uP;
  vec2 uv = vUv;
  /* ondulation du bain de révélateur, nulle à la fin */
  uv.x += sin(uv.y * 16.0 + uT * 1.5) * 0.0045 * reste;
  uv.y += cos(uv.x * 13.0 + uT * 1.1) * 0.0045 * reste;
  vec3 c = texture2D(tMap, couvrir(uv)).rgb;
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  float n = bruit(vUv * 5.0 + uT * 0.04);
  /* les ombres apparaissent d'abord, les hautes lumières en dernier, comme sur un vrai tirage */
  float seuil = lum * 0.82 + n * 0.18;
  float a = smoothstep(seuil - 0.22, seuil + 0.04, uP * 1.32 - 0.06);
  vec3 dev = mix(uPapier, c, a);
  vec3 sepia = vec3(dot(dev, vec3(0.393, 0.769, 0.189)), dot(dev, vec3(0.349, 0.686, 0.168)), dot(dev, vec3(0.272, 0.534, 0.131)));
  dev = mix(dev, min(sepia, vec3(1.0)), 0.32 * reste * a);
  gl_FragColor = vec4(mix(dev, c, smoothstep(0.9, 1.0, uP)), 1.0);
}`;

const fragSoleil = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform vec2 uM;
uniform float uT;
uniform float uI;
varying vec2 vUv;
void main() {
  vec2 p = vUv * uRes;
  vec2 m = uM * uRes;
  float d = length(p - m) / uRes.y;
  float halo = exp(-d * 5.0) * 0.42 + exp(-d * 20.0) * 0.55;
  float trainee = exp(-abs(p.y - m.y) / uRes.y * 70.0) * exp(-abs(p.x - m.x) / uRes.x * 2.2) * 0.2;
  vec2 c = uRes * 0.5; vec2 dir = c - m; float reflets = 0.0;
  for (int i = 1; i < 4; i++) {
    vec2 g = m + dir * (0.55 * float(i));
    float dg = length(p - g) / uRes.y;
    reflets += smoothstep(0.05 + 0.025 * float(i), 0.0, dg) * 0.05;
  }
  float scint = 0.92 + 0.08 * sin(uT * 1.7);
  vec3 col = vec3(1.0, 0.76, 0.46) * halo * scint + vec3(1.0, 0.86, 0.64) * trainee + vec3(0.95, 0.7, 0.48) * reflets;
  gl_FragColor = vec4(col * uI, 1.0);
}`;

function hexVersRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

function webglPossible() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { return false; }
}
const GL_OK = webglPossible();

function imagePrete(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve();
  return new Promise((ok) => { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true }); });
}

/* Repli sans WebGL : un fondu depuis le papier, sans filtre durable. */
function developperCSS(img, duree) {
  if (!G) return Promise.resolve();
  return new Promise((ok) => {
    G.fromTo(img, { filter: 'brightness(2.4) contrast(.45) sepia(.5)', opacity: 0.35 }, { filter: 'brightness(1) contrast(1) sepia(0)', opacity: 1, duration: duree, ease: 'power2.out', clearProps: 'filter,opacity', onComplete: ok });
  });
}

/* Développe la photo contenue dans `cadre` comme un tirage dans le bain, puis rend la vraie image. */
function developper(cadre, o) {
  o = o || {};
  const duree = o.duree || 2.4;
  const img = cadre.querySelector('img:not([hidden])') || cadre.querySelector('img');
  if (!img || PX.calme || !G) return Promise.resolve();
  if (!GL_OK) return developperCSS(img, duree);
  return imagePrete(img).then(() => new Promise((ok) => {
    if (!img.naturalWidth) { ok(); return; }
    let renderer;
    try { renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 1.75), alpha: false, antialias: false }); } catch (e) { developperCSS(img, duree).then(ok); return; }
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    const r = cadre.getBoundingClientRect();
    renderer.setSize(Math.max(1, r.width), Math.max(1, r.height));
    const texture = new Texture(gl, { image: img, generateMipmaps: false, minFilter: gl.LINEAR });
    const program = new Program(gl, {
      vertex, fragment: fragDeveloppe,
      uniforms: { tMap: { value: texture }, uRes: { value: [r.width, r.height] }, uImg: { value: [img.naturalWidth, img.naturalHeight] }, uP: { value: 0 }, uT: { value: 0 }, uPapier: { value: hexVersRgb(o.papier || '#F6EEE3') } }
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    cadre.appendChild(canvas);
    renderer.render({ scene: mesh });
    img.style.visibility = 'hidden';
    const t0 = performance.now();
    const etat = { p: 0 };
    const rendre = () => { program.uniforms.uT.value = (performance.now() - t0) / 1000; program.uniforms.uP.value = etat.p; renderer.render({ scene: mesh }); };
    G.to(etat, {
      p: 1, duration: duree, delay: o.delai || 0, ease: 'power2.inOut', onUpdate: rendre,
      onComplete: () => {
        img.style.visibility = '';
        G.to(canvas, { opacity: 0, duration: 0.25, onComplete: () => {
          canvas.remove();
          const perte = gl.getExtension('WEBGL_lose_context'); if (perte) perte.loseContext();
          ok();
        } });
      }
    });
  }));
}

/* Soleil rasant qui suit le pointeur au-dessus de la photo d'ouverture. */
function soleil(conteneur) {
  if (!conteneur || PX.calme || !G) return;
  const cible = { x: 0.78, y: 0.28 }, pos = { x: 0.9, y: 0.12 };
  let intensite = { v: 0 };
  let dessiner;
  if (GL_OK) {
    let renderer;
    try { renderer = new Renderer({ dpr: 1, alpha: false, antialias: false }); } catch (e) { renderer = null; }
    if (renderer) {
      const gl = renderer.gl; gl.clearColor(0, 0, 0, 1);
      const c = gl.canvas; c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      conteneur.appendChild(c);
      const program = new Program(gl, { vertex, fragment: fragSoleil, uniforms: { uRes: { value: [1, 1] }, uM: { value: [0.8, 0.7] }, uT: { value: 0 }, uI: { value: 0 } } });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
      const taille = () => { const r = conteneur.getBoundingClientRect(); const w = Math.max(1, r.width * 0.5), h = Math.max(1, r.height * 0.5); renderer.setSize(w, h); program.uniforms.uRes.value = [w, h]; };
      taille(); window.addEventListener('resize', taille);
      dessiner = (t) => { program.uniforms.uT.value = t; program.uniforms.uM.value = [pos.x, 1 - pos.y]; program.uniforms.uI.value = intensite.v; renderer.render({ scene: mesh }); };
    }
  }
  if (!dessiner) {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
    conteneur.appendChild(d);
    dessiner = () => { d.style.background = 'radial-gradient(circle at ' + (pos.x * 100) + '% ' + (pos.y * 100) + '%, rgba(255,200,130,' + (0.5 * intensite.v) + '), rgba(255,200,130,0) 38%)'; };
  }
  const zone = conteneur.parentElement;
  zone.addEventListener('pointermove', (e) => { const r = zone.getBoundingClientRect(); cible.x = (e.clientX - r.left) / r.width; cible.y = (e.clientY - r.top) / r.height; }, { passive: true });
  zone.addEventListener('pointerleave', () => { cible.x = 0.8; cible.y = 0.25; });
  let visible = true;
  new IntersectionObserver((ent) => { visible = ent[0].isIntersecting; }).observe(zone);
  G.to(intensite, { v: 1, duration: 2.4, delay: 0.6, ease: 'power2.out' });
  const t0 = performance.now();
  G.ticker.add(() => {
    if (!visible) return;
    const t = (performance.now() - t0) / 1000;
    if (!PX.souris) { cible.x = 0.62 + Math.sin(t * 0.18) * 0.22; cible.y = 0.22 + Math.cos(t * 0.13) * 0.08; }
    pos.x += (cible.x - pos.x) * 0.06; pos.y += (cible.y - pos.y) * 0.06;
    dessiner(t);
  });
}

PX.gl = { developper, soleil, actif: GL_OK };
window.dispatchEvent(new Event('px:gl'));
