// Motor 2.5D: imagen pintada + mapa de profundidad -> malla en relieve; utilidades de colocación y cámara.
import * as THREE from "three";

export const IW = 1438, IH = 2576;
export const PH = 10, PW = PH * IW / IH;
export const FOV0 = 50;
export const L = (PH / 2) / Math.tan(THREE.MathUtils.degToRad(FOV0 / 2));
/** profundidad (0 lejos .. 1 cerca) -> factor de distancia a lo largo del rayo de la cámara de referencia */
export const ratio = (d: number) => 1 / (0.62 + d * 1.25);

export type Prof = { w: number; h: number; d: Float32Array };
export const cargaProf = (src: string) => new Promise<Prof>((res) => {
  const im = new Image(); im.crossOrigin = "anonymous";
  im.onload = () => {
    const w = 360, h = Math.round(360 * IH / IW), c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d")!; g.drawImage(im, 0, 0, w, h);
    const px = g.getImageData(0, 0, w, h).data, d = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) d[i] = px[i * 4] / 255;
    res({ w, h, d });
  };
  im.src = src;
});
export const profEn = (p: Prof, px: number, py: number) =>
  p.d[Math.min(p.h - 1, Math.max(0, Math.floor((py / IH) * p.h))) * p.w + Math.min(p.w - 1, Math.max(0, Math.floor((px / IW) * p.w)))];

/** de un píxel de la imagen a un punto del mundo, a la profundidad del mapa (o la indicada) */
export const mundo = (px: number, py: number, prof: Prof, dOv?: number) => {
  const d = dOv ?? profEn(prof, px, py);
  const P = new THREE.Vector3((px / IW - 0.5) * PW, (0.5 - py / IH) * PH, 0), C = new THREE.Vector3(0, 0, L);
  return { p: C.clone().add(P.sub(C).multiplyScalar(ratio(d))), k: ratio(d), d };
};

/** malla del relieve */
export const mallaRelieve = (prof: Prof, tex: THREE.Texture) => {
  const g = new THREE.PlaneGeometry(PW, PH, 180, Math.round(180 * IH / IW)), pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) { const w = mundo(uv.getX(i) * IW, (1 - uv.getY(i)) * IH, prof); pos.setXYZ(i, w.p.x, w.p.y, w.p.z); }
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); m.frustumCulled = false;
  return m;
};

const ease = (x: number) => { const u = Math.max(0, Math.min(1, x)); return 0.4 * u + 0.6 * u * u * (3 - 2 * u); };
/** Encuadre: centro (px, py) en la imagen y "z" = cuántas veces se acerca (1 = la imagen entera).
 *  La toma va de A a B con un movimiento continuo (acercamiento por defecto): parte dolly real (paralaje),
 *  parte estrechar el objetivo. Se limita para no salirse de la imagen. */
export type Encuadre = { x: number; y: number; z: number };
export const camEncuadre = (A: Encuadre, B: Encuadre, u: number, f: number) => {
  const t = ease(u);
  const x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t, z = A.z + (B.z - A.z) * t;
  const vh = PH / z, vw = vh * 1080 / 1920;
  const cx = Math.max(-PW / 2 + vw / 2, Math.min(PW / 2 - vw / 2, (x / IW - 0.5) * PW));
  const cy = Math.max(-PH / 2 + vh / 2, Math.min(PH / 2 - vh / 2, (0.5 - y / IH) * PH));
  const D = L / (1 + (z - 1) * 0.35);                     // distancia al plano de la imagen
  const fov = THREE.MathUtils.radToDeg(2 * Math.atan(vh / (2 * D)));
  const dr = Math.sin(f / 41) * 0.015 * vh;               // deriva mínima: nunca quieta
  return { pos: new THREE.Vector3(cx + dr, cy, D), look: new THREE.Vector3(cx + dr, cy, 0), fov };
};
