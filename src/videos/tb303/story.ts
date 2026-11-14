// Techno Old School · Ep. 1 — PRUEBA DE ESTILO 3D (3 tomas de 5 s): tienda 1981 · Chicago de noche · club 1987.
// Gramática de cámara de la biblia de estilo: nunca quieta (acercamiento lento en las pausas), deslizamientos
// suaves (smootherstep) de 18-46 cuadros, fundido de 6 cuadros al cambiar de lugar.
export const FPS = 30;
export const BPM = 126;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const smoother = (x: number) => { const u = clamp01(x); return u * u * u * (u * (6 * u - 15) + 10); };

/** dónde está cada decorado en el mundo (están separados para que no se vean entre sí) */
export const SET = { tienda: 0, chicago: 200, club: 400 };

type Key = { f: number; pos: V3; look: V3; fov: number; glide?: boolean };
export type Luz = "tienda" | "noche" | "club";
export type ShotDef = { id: number; a: number; b: number; luz: Luz; az: number; keys: Key[]; fecha: string; texto: string };

const T = SET.tienda, C = SET.chicago, K = SET.club;
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 150, luz: "tienda", az: 55, fecha: "1981", texto: "En 1981, Roland sacó una máquina para que los guitarristas tocaran sin bajista.", keys: [
    { f: 0, pos: [T + 1.75, 1.32, 0.55], look: [T + 1.2, 1.0, -0.55], fov: 34 },            // la máquina de cerca
    { f: 20, pos: [T + 1.68, 1.34, 0.65], look: [T + 1.18, 1.0, -0.55], fov: 34 },
    { f: 95, pos: [T + 1.05, 1.6, 3.2], look: [T + 0.55, 1.1, -0.4], fov: 46, glide: true }, // atrás: el guitarrista
    { f: 150, pos: [T + 0.95, 1.65, 3.55], look: [T + 0.55, 1.1, -0.4], fov: 46 },
  ] },
  { id: 2, a: 150, b: 300, luz: "noche", az: 150, fecha: "CHICAGO", texto: "Fíjate: en Chicago, tres chavales de un grupo llamado Phuture se hicieron con una barata.", keys: [
    { f: 150, pos: [C + 0.5, 11, 16], look: [C, 7, -30], fov: 46 },                         // los edificios
    { f: 168, pos: [C + 0.5, 10.4, 15.2], look: [C, 6.6, -30], fov: 46 },
    { f: 245, pos: [C + 0.6, 1.45, 5.2], look: [C, 1.2, -2], fov: 40, glide: true },         // baja hasta los chavales
    { f: 300, pos: [C + 0.5, 1.4, 4.6], look: [C, 1.15, -1.5], fov: 40 },
  ] },
  { id: 3, a: 300, b: 450, luz: "club", az: 20, fecha: "1987 · ACID TRACKS", texto: "Ese chirrido se convirtió en Acid Tracks, en 1987. Y nació el acid house.", keys: [
    { f: 300, pos: [K - 0.4, 2.25, 4.8], look: [K + 0.2, 1.55, -5], fov: 34 },                    // entre la gente, hacia la cabina
    { f: 318, pos: [K - 0.4, 2.2, 4.2], look: [K + 0.2, 1.55, -5], fov: 34 },
    { f: 400, pos: [K - 1.5, 6.2, 11], look: [K, 0.9, -2.5], fov: 50, glide: true },        // sube: la pista llena
    { f: 450, pos: [K - 1.7, 6.5, 11.8], look: [K, 0.9, -2.5], fov: 50 },
  ] },
];
export const TOTAL = SHOTS[SHOTS.length - 1].b;
export const XFADE = 6;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const camAt = (id: number, f: number) => {
  const k = SHOTS[id - 1].keys;
  if (f <= k[0].f) return { pos: k[0].pos, look: k[0].look, fov: k[0].fov };
  for (let i = 1; i < k.length; i++) if (f <= k[i].f) {
    const u = (f - k[i - 1].f) / (k[i].f - k[i - 1].f), t = k[i].glide ? smoother(u) : u;
    return { pos: lerp3(k[i - 1].pos, k[i].pos, t), look: lerp3(k[i - 1].look, k[i].look, t), fov: lerp(k[i - 1].fov, k[i].fov, t) };
  }
  const l = k[k.length - 1];
  return { pos: l.pos, look: l.look, fov: l.fov };
};

/** una o dos capas: cada toma entra fundiéndose sobre la anterior durante XFADE cuadros */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (let i = SHOTS.length - 1; i > 0; i--) {
    const a = SHOTS[i].a;
    if (f >= a + XFADE) return [{ id: i + 1, alpha: 1 }];
    if (f >= a) return [{ id: i, alpha: 1 }, { id: i + 1, alpha: (f - a + 1) / (XFADE + 1) }];
  }
  return [{ id: 1, alpha: 1 }];
};

/** profundidad de campo: cInf = desenfoque en el infinito (px a 1080p) y punto de enfoque */
export const dofAt = (id: number, f: number): { cInf: number; focus?: V3 } => {
  if (id === 1) return f < 40 ? { cInf: 14, focus: [T + 1.2, 1.0, -0.55] } : { cInf: lerp(14, 10, smooth((f - 40) / 50)), focus: [T + 0.2, 1.3, -0.1] };
  if (id === 2) return f < 230 ? { cInf: lerp(0, 8, smooth((f - 190) / 40)) } : { cInf: 11, focus: [C, 1.3, kidsZ(f)] };
  return f < 340 ? { cInf: 13, focus: [K, 1.5, -5] } : { cInf: lerp(13, 4, smooth((f - 340) / 50)) };
};

/** los tres chavales caminan hacia la cámara */
export const kidsZ = (f: number) => -6 + ((f - 150) / FPS) * 1.05;
export const gait = (t: number, hz: number) => Math.floor(((((t * hz) % 1) + 1) % 1) * 8) / 8;
/** pulso del bombo (1 en cada golpe, cae rápido) */
export const beatAt = (f: number) => f / (FPS * 60 / BPM);
export const pulse = (f: number) => Math.pow(1 - (beatAt(f) % 1), 3);
