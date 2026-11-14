// Techno Old School · Ep. 1 «La máquina que nadie quería» — línea de tiempo en 3D.
// Los tiempos salen de datos/tb303.json (herramientas/tiempos.py: estimados ahora, de la voz real después).
// Las llaves de cámara van en fracción u = 0..1 de cada toma, así el plan aguanta cuando cambie la voz.
import TL from "../../../datos/tb303.json";

export const FPS = 30;
export const BPM = TL.bpm;
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const smoother = (x: number) => { const u = clamp01(x); return u * u * u * (u * (6 * u - 15) + 10); };

/** decorados repartidos por el mundo */
export const SET = { tienda: 0, chicago: 200, club: 400, saldo: 600, misterio: 800, sotano: 1000, museo: 1200 };
export type Luz = "tienda" | "noche" | "club" | "saldo" | "misterio" | "sotano" | "museo";
type Key = { u: number; pos: V3; look: V3; fov: number; glide?: boolean };
type Plan = { set: keyof typeof SET; luz: Luz; az: number; keys: Key[] };

const P: Record<string, Plan> = {
  // 1981: la máquina de cerca, atrás hasta el guitarrista
  tienda: { set: "tienda", luz: "tienda", az: 55, keys: [
    { u: 0, pos: [1.75, 1.32, 0.55], look: [1.2, 1.0, -0.55], fov: 34 },
    { u: 0.12, pos: [1.68, 1.34, 0.65], look: [1.18, 1.0, -0.55], fov: 34 },
    { u: 0.62, pos: [1.05, 1.6, 3.2], look: [0.6, 1.1, -0.4], fov: 46, glide: true },
    { u: 1, pos: [0.95, 1.65, 3.55], look: [0.6, 1.1, -0.4], fov: 46 } ] },
  // "fue un desastre": de golpe, cerca; ondas y el pato
  desastre: { set: "tienda", luz: "tienda", az: 40, keys: [
    { u: 0, pos: [0.55, 1.5, 3.2], look: [0.75, 1.35, -0.4], fov: 46 },
    { u: 0.5, pos: [0.85, 1.55, 3.5], look: [0.8, 1.45, -0.4], fov: 48, glide: true },
    { u: 1, pos: [0.65, 1.6, 3.8], look: [0.6, 1.5, -0.4], fov: 50, glide: true } ] },
  // sin manual en inglés
  manual: { set: "tienda", luz: "tienda", az: 70, keys: [
    { u: 0, pos: [2.9, 1.55, 1.2], look: [2.3, 1.35, -0.9], fov: 38 },
    { u: 1, pos: [3.1, 1.7, 2.5], look: [2.2, 1.4, -0.9], fov: 44, glide: true } ] },
  // 1984: tienda de segunda mano, baja hacia la estantería
  saldo: { set: "saldo", luz: "saldo", az: 60, keys: [
    { u: 0, pos: [0.3, 3.4, 4.2], look: [0, 2.2, -2], fov: 44 },
    { u: 0.65, pos: [0.15, 1.75, 1.7], look: [0, 1.5, -2], fov: 38, glide: true },
    { u: 1, pos: [0.12, 1.7, 1.35], look: [0, 1.5, -2], fov: 36 } ] },
  // misterio: la máquina sola bajo un foco
  misterio: { set: "misterio", luz: "misterio", az: 175, keys: [
    { u: 0, pos: [0, 2.4, 6.0], look: [0, 1.3, 0], fov: 40 },
    { u: 1, pos: [0, 1.75, 3.3], look: [0, 1.35, 0], fov: 38, glide: true } ] },
  // Chicago: de los edificios a los chavales
  chicago: { set: "chicago", luz: "noche", az: 150, keys: [
    { u: 0, pos: [0.5, 11, 16], look: [0, 7, -30], fov: 46 },
    { u: 0.1, pos: [0.5, 10.4, 15.2], look: [0, 6.6, -30], fov: 46 },
    { u: 0.65, pos: [0.6, 1.45, 5.2], look: [0, 1.2, -2], fov: 40, glide: true },
    { u: 1, pos: [0.5, 1.4, 4.5], look: [0, 1.15, -1.5], fov: 40 } ] },
  // el sótano: giran las ruedas, el sonido se vuelve hipnótico
  ruedas: { set: "sotano", luz: "sotano", az: 30, keys: [
    { u: 0, pos: [0.05, 1.42, 0.62], look: [0, 0.95, -0.05], fov: 34 },
    { u: 1, pos: [0.5, 1.75, 2.3], look: [0, 1.15, -0.2], fov: 44, glide: true } ] },
  // 1987: el club
  club: { set: "club", luz: "club", az: 20, keys: [
    { u: 0, pos: [-0.4, 2.25, 4.8], look: [0.2, 1.55, -5], fov: 34 },
    { u: 0.1, pos: [-0.4, 2.2, 4.2], look: [0.2, 1.55, -5], fov: 34 },
    { u: 0.66, pos: [-1.5, 6.2, 11], look: [0, 0.9, -2.5], fov: 50, glide: true },
    { u: 1, pos: [-1.7, 6.5, 11.8], look: [0, 0.9, -2.5], fov: 50 } ] },
  // hoy: la vitrina
  remate: { set: "museo", luz: "museo", az: 25, keys: [
    { u: 0, pos: [0, 1.55, 6.4], look: [0, 1.4, 0], fov: 46 },
    { u: 1, pos: [0.15, 1.6, 4.7], look: [0, 1.45, 0], fov: 46, glide: true } ] },
};

export type ShotDef = { id: number; key: string; a: number; b: number; fecha: string; set: keyof typeof SET; luz: Luz; az: number; keys: Key[] };
export const SHOTS: ShotDef[] = TL.tomas.map((t, i) => ({ id: i + 1, key: t.id, a: t.a, b: t.b, fecha: t.fecha, ...P[t.id] }));
export const CIERRE = TL.cierre;
export const TOTAL = TL.total;
export const PALABRAS = TL.palabras;
export const SERIE = { serie: TL.serie, episodio: TL.episodio, titulo: TL.titulo };
export const XFADE = 6;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** progreso dentro de la toma (puede pasar de 1 durante el fundido de salida) */
export const uOf = (id: number, f: number) => { const s = SHOTS[id - 1]; return (f - s.a) / (s.b - s.a); };
export const camAt = (id: number, f: number) => {
  const s = SHOTS[id - 1], k = s.keys, u = uOf(id, f), X = SET[s.set];
  const off = (p: V3): V3 => [p[0] + X, p[1], p[2]];
  // deriva lenta: la cámara nunca se queda quieta
  const drift: V3 = [Math.sin(f / 53) * 0.03, Math.cos(f / 61) * 0.02, 0];
  let r = { pos: k[k.length - 1].pos, look: k[k.length - 1].look, fov: k[k.length - 1].fov };
  if (u <= k[0].u) r = { pos: k[0].pos, look: k[0].look, fov: k[0].fov };
  else for (let i = 1; i < k.length; i++) if (u <= k[i].u) {
    const q = (u - k[i - 1].u) / (k[i].u - k[i - 1].u), t = k[i].glide ? smoother(q) : q;
    r = { pos: lerp3(k[i - 1].pos, k[i].pos, t), look: lerp3(k[i - 1].look, k[i].look, t), fov: lerp(k[i - 1].fov, k[i].fov, t) }; break;
  }
  const pos = off(r.pos);
  return { pos: [pos[0] + drift[0], pos[1] + drift[1], pos[2]] as V3, look: off(r.look), fov: r.fov * (1 - 0.0006 * Math.max(0, f - s.a)) };
};

/** una o dos capas: la toma siguiente entra fundiéndose sobre la anterior */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  if (f >= CIERRE.a) return [];
  for (let i = SHOTS.length - 1; i > 0; i--) {
    const a = SHOTS[i].a;
    if (f >= a + XFADE) return [{ id: i + 1, alpha: 1 }];
    if (f >= a) return [{ id: i, alpha: 1 }, { id: i + 1, alpha: (f - a + 1) / (XFADE + 1) }];
  }
  return [{ id: 1, alpha: 1 }];
};

/** profundidad de campo por toma */
export const dofAt = (id: number, f: number): { cInf: number; focus?: V3 } => {
  const s = SHOTS[id - 1], u = uOf(id, f), X = SET[s.set];
  const at = (x: number, y: number, z: number): V3 => [X + x, y, z];
  switch (s.key) {
    case "tienda": return u < 0.25 ? { cInf: 14, focus: at(1.2, 1.0, -0.55) } : { cInf: lerp(14, 10, smooth((u - 0.25) / 0.3)), focus: at(0.6, 1.3, -0.2) };
    case "desastre": return { cInf: 12, focus: at(0.4, 1.4, -0.1) };
    case "manual": return { cInf: 12, focus: at(2.4, 1.4, -0.8) };
    case "saldo": return { cInf: lerp(4, 12, smooth(u / 0.6)), focus: at(0, 1.55, -1.9) };
    case "misterio": return { cInf: 10, focus: at(0, 1.1, 0) };
    case "chicago": return u < 0.5 ? { cInf: lerp(0, 8, smooth((u - 0.2) / 0.3)) } : { cInf: 11, focus: [X, 1.3, kidsZ(f)] };
    case "ruedas": return { cInf: 14, focus: at(0, 1.0, -0.05) };
    case "club": return u < 0.25 ? { cInf: 13, focus: at(0, 1.5, -5) } : { cInf: lerp(13, 4, smooth((u - 0.25) / 0.35)) };
    default: return { cInf: 12, focus: at(0, 1.35, 0) };
  }
};

const CHI = SHOTS.find((s) => s.key === "chicago")!;
/** los tres chavales caminan hacia la cámara */
export const kidsZ = (f: number) => -6 + ((f - CHI.a) / FPS) * (5.0 / ((CHI.b - CHI.a) / FPS));
export const gait = (t: number, hz: number) => Math.floor(((((t * hz) % 1) + 1) % 1) * 8) / 8;
export const beatAt = (f: number) => f / (FPS * 60 / BPM);
export const pulse = (f: number) => Math.pow(1 - (beatAt(f) % 1), 3);
