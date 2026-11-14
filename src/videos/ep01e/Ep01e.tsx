// Techno Old School · Ep. 1 «Cuatro veces en una noche» (historia de Ron Hardy y Acid Tracks) — versión con fondos pintados (Nano Banana) en relieve.
// Receta medida en @RicksClips3000: una toma cada ~2 s, cada toma un acercamiento continuo, corte directo,
// subtítulos pequeños de una palabra. Voz de Martín + «3I ATLAS COMING» (mezcla_ep01.wav), 29 compases.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, getInputProps, delayRender, continueRender, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import "@fontsource/montserrat/900.css";
import { Pen, bodyFront, Outfit, Expr, SKINS } from "../../motor3d/toon";
import { Pool, Actor, Fx, Stage, tier, light2D, blob } from "../../motor3d/troop";
import { TONE, CHAR } from "../../motor3d/shade";
import { NOINK } from "../../motor3d/ink";
import { IH, PH, Prof, cargaProf, mundo, profEn, mallaRelieve, camEncuadre, Encuadre } from "../../motor25d/relieve";
import { rotulo, ondaDraw, pato, manualDraw, etiqueta, maquina } from "../../motor25d/props";
import { muneco, Ropa, MunecoOpts, Gesto, Pose } from "../../motor25d/muneco";
import { Onda, W, TINTA } from "../../motor2d/base";
import TL from "../../../datos/ep01_v3.json";
import { tumbado } from "../../motor25d/tumbado";

const FPS = 30, BPM = TL.bpm;
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const sm = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };

// ---------------- fondos y su luz ----------------
type Luz = { lit: [number, number, number]; shade: [number, number, number]; lift: [number, number, number]; tint: [number, number, number]; side: [number, number, number]; cs: number; sol: [number, number, number] };
const LUCES: Record<string, Luz> = {
  tienda: { lit: [1.35, 1.05, 0.78], shade: [0.42, 0.3, 0.26], lift: [0.1, 0.07, 0.05], tint: [1.0, 0.9, 0.78], side: [0.9, 0.84, 0.9], cs: 0.86, sol: [-0.3, 0.75, 0.6] },
  saldo: { lit: [1.15, 1.0, 0.82], shade: [0.36, 0.3, 0.28], lift: [0.08, 0.07, 0.06], tint: [0.95, 0.88, 0.78], side: [0.85, 0.84, 0.88], cs: 0.84, sol: [0.1, 0.9, 0.4] },
  misterio: { lit: [1.2, 1.25, 1.45], shade: [0.1, 0.11, 0.2], lift: [0.03, 0.03, 0.06], tint: [0.88, 0.92, 1.05], side: [0.7, 0.72, 0.95], cs: 0.72, sol: [0, 0.95, 0.3] },
  chicago: { lit: [0.75, 0.8, 1.25], shade: [0.14, 0.13, 0.3], lift: [0.04, 0.04, 0.1], tint: [0.86, 0.86, 1.08], side: [1.0, 0.8, 0.6], cs: 0.78, sol: [0.4, 0.7, 0.5] },
  sotano: { lit: [0.95, 1.25, 0.95], shade: [0.2, 0.12, 0.3], lift: [0.06, 0.03, 0.1], tint: [0.9, 1.0, 0.92], side: [1.0, 0.75, 1.0], cs: 0.8, sol: [-0.5, 0.6, 0.6] },
  club: { lit: [1.25, 0.7, 1.25], shade: [0.2, 0.12, 0.32], lift: [0.06, 0.03, 0.1], tint: [0.98, 0.78, 1.02], side: [0.7, 0.9, 1.0], cs: 0.8, sol: [0, 0.8, 0.5] },
  puerta: { lit: [1.2, 1.0, 0.85], shade: [0.16, 0.15, 0.3], lift: [0.05, 0.05, 0.1], tint: [0.95, 0.9, 0.95], side: [0.75, 1.0, 0.85], cs: 0.8, sol: [0, 0.85, 0.5] },
  museo: { lit: [1.4, 1.18, 0.9], shade: [0.2, 0.2, 0.34], lift: [0.05, 0.05, 0.1], tint: [1.0, 0.92, 0.84], side: [0.8, 0.85, 1.0], cs: 0.84, sol: [0, 0.85, 0.5] },
};

// ---------------- reparto ----------------
const GUIT: Outfit = { jacket: "#2f5d9e", pants: "#2d3550", boots: "#3a2a20", hat: "hair", hair: "#6b3b1e", skin: SKINS[0] };
const CLIENTE: Outfit = { jacket: "#e0a43a", pants: "#3b3f52", boots: "#2a2020", hat: "cap", cap: "#2f5d9e", skin: SKINS[2] };
const KIDS: Outfit[] = [
  { jacket: "#e0a43a", pants: "#2d3550", boots: "#f4f1ea", hat: "cap", cap: "#d33a3a", skin: SKINS[3] },
  { jacket: "#3f9a62", pants: "#22283a", boots: "#f4f1ea", hat: "hair", hair: "#1b1414", skin: "#8a5a3c" },
  { jacket: "#c2452f", pants: "#2d3550", boots: "#1b1414", hat: "cap", cap: "#2f5d9e", skin: "#6e4430" },
];
const DJ: Outfit = { jacket: "#3f9a62", pants: "#22283a", boots: "#1b1414", hat: "cap", cap: "#111111", skin: "#8a5a3c" };
const COLE: Outfit[] = [
  { jacket: "#2f5d9e", pants: "#22283a", boots: "#1b1414", hat: "hair", hair: "#c9a06b", skin: SKINS[0] },
  { jacket: "#c2452f", pants: "#2d3550", boots: "#3a2a20", hat: "hair", hair: "#1b1414", skin: "#8a5a3c", moustache: "#1b1414" },
];
const ROPA = ["#e0a43a", "#3f9a62", "#c2452f", "#2f5d9e", "#d64fb4", "#5ad0c8", "#f1d06a", "#8a5ac9"];
const PIEL = [SKINS[0], SKINS[1], SKINS[3], "#8a5a3c", "#6e4430", SKINS[2]];
const PELO = ["#2b1d1a", "#6b3b1e", "#1b1414", "#c9a06b", "#3a2a20"];
const bailarin = (i: number): Outfit => ({ jacket: ROPA[i % 8], pants: ["#22283a", "#2d3550", "#3b3f52"][i % 3], boots: i % 2 ? "#f4f1ea" : "#1b1414",
  hat: i % 3 === 0 ? "cap" : "hair", cap: ROPA[(i + 3) % 8], hair: PELO[i % 5], skin: PIEL[(i * 5) % 6] });

// ---------------- vestuario detallado (estilo de los shorts de referencia) ----------------
const R_GUIT: Ropa = { camisa: "#2f5d9e", pantalon: "#2d3550", chaqueta: "#3b2a24", sombrero: "melena", pelo: "#6b3b1e", zapatos: "#3a2a20" };
const R_CLI: Ropa = { camisa: "#e0a43a", pantalon: "#3b3f52", rayas: "#c98a26", sombrero: "gorra", colorSombrero: "#2f5d9e" };
const R_KIDS: Ropa[] = [
  { camisa: "#f1d06a", pantalon: "#2d4f86", peto: "#3d6fb6", parche: "#c2452f", sombrero: "gorra", colorSombrero: "#d33a3a", zapatos: "#f4f1ea" },
  { camisa: "#3f9a62", pantalon: "#22283a", tirantes: "#1b1414", sombrero: "gorro", colorSombrero: "#8a5ac9", zapatos: "#f4f1ea" },
  { camisa: "#c2452f", pantalon: "#2d3550", lunares: "#f2c9c0", sombrero: "pelo", pelo: "#1b1414", zapatos: "#1b1414" },
];
const R_DJ: Ropa = { camisa: "#2b2b3a", pantalon: "#22283a", lunares: "#7dff6a", sombrero: "gorra", colorSombrero: "#111111", auriculares: true };
const R_HARDY: Ropa = { camisa: "#2b2b3a", pantalon: "#1b1d2a", rayas: "rgba(125,255,106,0.28)", sombrero: "gorra", colorSombrero: "#d33a3a", auriculares: true };
const R_COLE: Ropa[] = [
  { camisa: "#f2efe6", pantalon: "#22283a", chaqueta: "#2f3a5e", corbata: "#a02a2a", sombrero: "pelo", pelo: "#c9a06b", gafas: true },
  { camisa: "#f2efe6", pantalon: "#3b3f52", chaleco: "#7a3a2a", cadena: true, pajarita: "#c2452f", sombrero: "bombin", bigote: true, pelo: "#2b1d1a" },
];
const SOMB: Ropa["sombrero"][] = ["gorraAtras", "rizos", "cinta", "cresta", "pelo", "melena", "gorraAtras", "cinta"];
const ESTAMP: Ropa["estampado"][] = ["rayo", undefined, "estrella", undefined, "cara", "rayo", undefined, "estrella"];
const NEON = ["#ff3d8b", "#3df2ff", "#c6ff3d", "#ffe14a", "#b07dff", "#ff8a3d"];
const R_BAIL = (i: number): Ropa => ({ camisa: ROPA[i % 8], pantalon: ["#22283a", "#2d3550", "#1b1d2a"][i % 3], zapatos: i % 2 ? "#f4f1ea" : "#1b1414",
  rayas: i % 6 === 3 ? "rgba(255,255,255,0.22)" : undefined, tirantes: i % 5 === 2 ? "#1b1414" : undefined,
  estampado: ESTAMP[i % 8], colorEstampado: NEON[(i + 2) % 6],
  sombrero: SOMB[i % 8], colorSombrero: NEON[i % 6], pelo: PELO[i % 5], gafasSol: i % 4 === 1 ? "#141018" : undefined });
const ropaDe = (key: string, i: number): Ropa => {
  if (key === "guit") return R_GUIT; if (key === "cli") return R_CLI; if (key === "dj") return R_DJ; if (key === "hardy") return R_HARDY;
  if (key.startsWith("kid")) return R_KIDS[Number(key.slice(-1))];
  if (key.startsWith("col")) return R_COLE[Number(key.slice(-1)) - 1];
  return R_BAIL(Number(key.replace(/\D/g, "")) || i);
};
const GESTO: Record<string, Gesto> = { smile: "sonrisa", grin: "sonrisa", laugh: "risa", shock: "susto", pained: "nervioso", stern: "enfado", nervous: "duda",
  shout: "grito", smile_closed: "ojosCerrados", neutral: "normal" };
const convierte = (o: Parameters<typeof bodyFront>[2], key: string, i: number, f: number): MunecoOpts => {
  const baila = o.wave !== undefined && !key.startsWith("dj") && key !== "hardy";
  const pose: Pose = o.mode === "march" ? "anda" : baila ? (i % 3 === 0 || (i >= 18 && i % 2 === 0) ? "brazosArriba" : "baila") : "quieto";
  const g = GESTO[o.expr ?? "neutral"] ?? "normal";
  return { gesto: g, pose, fase: o.phase ?? (baila ? (f / (2 * 30 * 60 / BPM) + i * 0.13) % 1 : 0), mira: o.look ?? 0, inclina: o.headTilt ?? 0,
    sudor: o.expr === "pained" || o.expr === "shock", rubor: o.expr === "laugh" || o.expr === "grin" };
};

// ---------------- piezas de cada toma ----------------
type Ctx = { f: number; u: number; bt: number; prof: Prof };
type Persona = { t: "p"; key: string; o: Outfit; px: number; py: number; alto: number; opts: Parameters<typeof bodyFront>[2]; i: number; dOv?: number; salto?: number; m?: MunecoOpts };
type Obj = { t: "o"; key: string; cw: number; ch: number; draw: (p: Pen) => void; px: number; py: number; wpx: number; hpx: number; dOv?: number };
type Pieza = Persona | Obj;
type Toma = { a: number; fondo: string; A: Encuadre; B: Encuadre; fecha?: string; piezas: (c: Ctx) => Pieza[] };

const P = (key: string, o: Outfit, px: number, py: number, alto: number, opts: Parameters<typeof bodyFront>[2], i: number, extra: Partial<Persona> = {}): Persona => ({ t: "p", key, o, px, py, alto, opts, i, ...extra });
const O = (key: string, cw: number, ch: number, draw: (p: Pen) => void, px: number, py: number, wpx: number, hpx: number, dOv?: number): Obj => ({ t: "o", key, cw, ch, draw, px, py, wpx, hpx, dOv });
const maq = (c: Ctx, px: number, py: number, w: number, d: number, vivo: boolean, vel = 0.05) =>
  O(`maq|${vivo ? Math.floor(c.f / 3) : 0}`, 512, 240, maquina(vivo ? c.f * vel : 0.4, vivo ? Math.floor(c.f / 3.5) % 16 : -1), px, py - w * 0.04, w * 1.08, w * 1.08 * 0.47, d);
const ondas = (c: Ctx, px: number, py: number, w: number, d: number, n = 3, vel = 1.6) =>
  ["#7dff6a", "#ff4fd8", "#4fd8ff", "#ffe14d"].slice(0, n).map((col, k) => {
    const ph = Math.floor(c.f * vel) % 24;
    return O(`onda|${col}|${ph}|${k}`, 512, 192, ondaDraw(col, ph / 24 * Math.PI * 2 + k), px + k * 12, py - k * 70, w, w * 0.375, d);
  });

// tienda (1981)
const M_T: [number, number] = [1170, 1248];
const guit = (c: Ctx, expr: Expr, extra: Partial<Persona> = {}) => P("guit", GUIT, 560, 1900, 720, { mode: "stand", expr, facing: 0, look: 1 }, 1, extra);
// sótano
const kidsSotano = (c: Ctx, exprs: Expr[]) => KIDS.map((o, k) => P(`kidS${k}`, o, 520 + k * 220, 1255, 560, { mode: "stand", expr: exprs[k], facing: 0, look: k === 0 ? 1 : k === 2 ? -1 : 0, headTilt: Math.round(Math.sin(c.bt * Math.PI + k) * 2) * 3 }, 20 + k, { dOv: 0.06 }));
// club
// cada bailarín a su bola: unos de espaldas (mirando al DJ), otros girados; cada uno con su ritmo, su baile y su cara
const BEAT = 30 * 60 / BPM;
const estilo = (i: number, f: number): MunecoOpts => {
  const espaldas = hh(i, 7) < 0.38;
  const giro = espaldas ? 0 : (hh(i, 9) < 0.5 ? -1 : 1) * (0.35 + 0.65 * hh(i, 10));
  const r = hh(i, 8), vel = r < 0.3 ? 0.5 : r < 0.85 ? 1 : 2;           // medio tiempo, normal o doble
  const fase = ((f / (2 * BEAT)) * vel + hh(i, 11)) % 1;
  const pose = (["baila", "brazosArriba", "baila", "brazosArriba", "quieto"] as Pose[])[Math.floor(hh(i, 12) * 5)];
  const gesto = (["ojosCerrados", "sonrisa", "ojosCerrados", "risa", "chulo"] as Gesto[])[Math.floor(hh(i, 13) * 5)];
  const inclina = Math.sin((f / (2 * BEAT)) * Math.PI * 2 * vel + i) * 12;
  return { espaldas, giro, fase, pose, gesto, inclina, mira: giro };
};
const gente = (c: Ctx, hueco: [number, number, number] | null = null, m?: (i: number, px: number) => MunecoOpts | undefined) => {
  const out: Pieza[] = [hardyPincha(c)];
  for (let i = 0; i < 24; i++) {
    const row = Math.floor(i / 6), col = i % 6;
    const py = 1600 + row * 85 + hh(i, 1) * 30, px = 240 + col * 190 + (row % 2) * 95 + (hh(i, 2) - 0.5) * 60;
    if (hueco && Math.hypot((px - hueco[0]) / 1.6, py - hueco[1]) < hueco[2]) continue;
    const dd = profEn(c.prof, px, py), alto = 300 * (0.62 + 1.25 * dd) / 0.679 * (0.9 + 0.2 * hh(i, 4));
    const ex: Expr = (["smile_closed", "grin", "smile_closed", "laugh", "smile_closed", "shout"] as Expr[])[i % 6];
    out.push(P(`b${i}`, bailarin(i), px, py, alto, { mode: "stand", expr: ex, facing: 0, wave: 0, headTilt: Math.round(Math.sin(c.bt * Math.PI) * 2) * 3 }, 40 + i,
      { salto: 0, m: { ...estilo(i, c.f), ...(m?.(i, px) ?? {}) } }));
  }
  return out;
};
// chicago: los chavales caminan hacia la cámara
const kidsCalle = (c: Ctx, t0: number) => {
  const tt = (c.f - t0) / FPS, py0 = 1840 + tt * 30;
  const exprs: Expr[] = ["grin", "laugh", "smile"];
  return KIDS.map((o, k) => {
    const px = 560 + k * 160, py = py0 + (k === 1 ? 30 : 0), dd = profEn(c.prof, px, py);
    const alto = 470 * (0.62 + 1.25 * dd) / (0.62 + 1.25 * 0.57);
    return P(`kid${k}`, o, px, py, alto, { mode: "march", phase: Math.floor((((tt + k * 0.33) % 1) + 1) % 1 * 8) / 8, expr: exprs[k], facing: 0, lift: 40 }, 10 + k);
  });
};
const maqEnManos = (c: Ctx, t0: number) => {
  const tt = (c.f - t0) / FPS, py = 1840 + tt * 30 + 30, dd = profEn(c.prof, 720, py), alto = 470 * (0.62 + 1.25 * dd) / (0.62 + 1.25 * 0.57);
  return maq(c, 720, py - alto * 0.47, alto * 0.42, Math.min(1, dd + 0.03), false);
};

const T = (a: number, fondo: string, A: Encuadre, B: Encuadre, piezas: (c: Ctx) => Pieza[], fecha?: string): Toma => ({ a, fondo, A, B, piezas, fecha });
/** casete (256 x 160) */
const casete = (p: Pen) => {
  p.poly([[8, 8], [248, 8], [248, 152], [8, 152]], "#2a2630", 6);
  p.poly([[30, 26], [226, 26], [226, 86], [30, 86]], "#f2e6c8", 4);
  p.ell(88, 112, 20, 20, "#e8e8ee", 4); p.ell(168, 112, 20, 20, "#e8e8ee", 4);
  p.poly([[70, 40], [186, 40], [186, 48], [70, 48]], "#d0302a", 0);
};
const cinta = (c: Ctx, px: number, py: number, w: number, d: number) => O("casete", 256, 160, casete, px, py, w, w * 0.625, d);
const kidsPuerta = (c: Ctx, exprs: Expr[]) => KIDS.map((o, k) => P(`kidP${k}`, o, 470 + k * 250, 1770 + (k === 1 ? 25 : 0), 820, { mode: "stand", expr: exprs[k], facing: 0, look: k === 0 ? 1 : k === 2 ? -1 : 0 }, 60 + k));
// Ron Hardy: personaje genérico en la cabina
const HARDY: Outfit = { jacket: "#2b2b3a", pants: "#22283a", boots: "#1b1414", hat: "cap", cap: "#d33a3a", skin: "#6e4430" };
const hardy = (c: Ctx, m: MunecoOpts) => P("hardy", HARDY, 730, 1445, 300, { mode: "stand", expr: "neutral", facing: 0 }, 30, { dOv: 0.03, m });
const hardyPincha = (c: Ctx, gesto: Gesto = "sonrisa"): Pieza => hardy(c, { gesto, pose: "baila", fase: (c.f / (2 * 30 * 60 / BPM)) % 1 });
// pocos en la pista: quietos (no hacen caso), se van, o bailan sin entender
// pocos en la pista, repartidos y cada uno a su aire: quietos (no hacen caso, charlan), se van (hacia el lado más cercano) o bailan sin entender
const pocos = (c: Ctx, n: number, t0: number, modo: "quietos" | "salen" | "dudan", pov = false) => Array.from({ length: n }, (_, i) => {
  const slot = [3, 8, 14, 1, 17, 10, 21, 5, 12, 19, 7, 23][i % 12], row = Math.floor(slot / 6), col = slot % 6;
  const py = 1600 + row * 85 + (hh(slot, 1) - 0.5) * 70, px0 = 200 + col * 205 + (row % 2) * 95 + (hh(slot, 2) - 0.5) * 130;
  const lado = px0 < 720 ? -1 : 1, tt = Math.max(0, (c.f - t0) / FPS - hh(i, 5) * 0.35);
  const px = modo === "salen" ? px0 + lado * tt * (330 + 120 * hh(i, 6)) : px0;
  const dd = profEn(c.prof, Math.max(50, Math.min(1390, px)), py), alto = 300 * (0.62 + 1.25 * dd) / 0.679 * (0.92 + 0.16 * hh(i, 4));
  const espaldas = !pov && hh(i, 7) < 0.35, giro = espaldas ? 0 : (hh(i, 9) < 0.5 ? -1 : 1) * (0.35 + 0.65 * hh(i, 10));
  const bob = Math.sin((c.f / (30 * 60 / BPM)) * Math.PI + i) * 6;
  // en «quietos», parejas que charlan mirándose (y en el plano del DJ, de espaldas a él: no le hacen caso)
  const charla = i % 3 !== 2, haciaPareja = i % 2 ? -1 : 1;
  const m: MunecoOpts = modo === "salen" ? { gesto: (["enfado", "duda", "triste"] as Gesto[])[i % 3], pose: "anda", fase: ((tt * 1.8 + i * 0.3) % 1 + 1) % 1, giro: lado, mira: lado }
    : modo === "quietos" ? (pov ? { espaldas: true, pose: i % 3 === 0 ? "brazosCruzados" : "quieto", inclina: bob * 0.5 }
        : { gesto: (["normal", "duda", "chulo", "sonrisa"] as Gesto[])[i % 4], pose: i % 4 === 0 ? "brazosCruzados" : i % 4 === 1 ? "sostiene" : "quieto",
            espaldas: charla ? false : espaldas, giro: charla ? haciaPareja * 0.85 : giro, mira: charla ? haciaPareja : giro, inclina: bob * 0.4 })
    : { gesto: (["duda", "sorpresa", "duda", "chulo"] as Gesto[])[i % 4], pose: i % 2 ? "baila" : "quieto", espaldas, giro, mira: giro,
        fase: (c.f / (2 * BEAT) * (0.5 + hh(i, 8)) + i * 0.21) % 1, inclina: bob };
  return P(`p${i}`, bailarin(i), px, py, alto, { mode: "stand", expr: "neutral", facing: 0 }, 70 + i, { m });
});
// plano desde la cabina: platos y mezclador en primer plano con las manos del DJ (1600 x 640)
const platos = (f: number) => (p: Pen) => {
  const g = p.g, INK = "#16101c", two = Math.PI * 2, beat = f / (30 * 60 / BPM);
  const rr = (x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient, lw = 6) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
  // mesa
  const mg = g.createLinearGradient(0, 120, 0, 640); mg.addColorStop(0, "#3a3046"); mg.addColorStop(1, "#15101c");
  rr(-20, 150, 1640, 520, 18, mg, 10);
  const plato = (cx: number, giro: number) => {
    rr(cx - 300, 175, 600, 440, 20, "#c9ccd2", 8);
    const pg = g.createRadialGradient(cx - 60, 330, 20, cx, 390, 230); pg.addColorStop(0, "#3a3a44"); pg.addColorStop(1, "#0d0d12");
    g.fillStyle = pg; g.beginPath(); g.arc(cx - 30, 395, 195, 0, two); g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 2; for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(cx - 30, 395, 90 + k * 11, 0, two); g.stroke(); }
    g.save(); g.translate(cx - 30, 395); g.rotate(giro);
    g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 190, -0.15, 0.15); g.fill();          // brillo que gira
    g.fillStyle = "#ff4fd8"; g.beginPath(); g.arc(0, 0, 58, 0, two); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.fillStyle = "#ffe14d"; g.fillRect(-30, -8, 60, 6); g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 8, 0, two); g.fill();
    g.restore();
    // brazo de la aguja
    g.lineWidth = 12; g.strokeStyle = "#e8eaee"; g.lineCap = "round"; g.beginPath(); g.moveTo(cx + 240, 215); g.lineTo(cx + 230, 420); g.lineTo(cx + 110, 520); g.stroke();
    g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); rr(cx + 90, 505, 46, 30, 5, "#2a2a30", 4); g.fillStyle = "#9aa0a8"; g.beginPath(); g.arc(cx + 240, 215, 26, 0, two); g.fill(); g.stroke();
    // botones y regulador de velocidad
    rr(cx - 280, 560, 70, 36, 6, "#e6e8ec", 4); rr(cx + 180, 330, 30, 210, 6, "#2a2a30", 4); rr(cx + 178, 420 + Math.sin(beat * 0.3) * 6, 34, 22, 4, "#e6e8ec", 3);
  };
  // el de la izquierda hace scratch (adelante y atrás), el de la derecha gira normal
  plato(330, Math.sin(beat * Math.PI) * 0.9);
  plato(1270, beat * 1.15);
  // mezclador
  rr(650, 165, 300, 460, 14, "#24202c", 8);
  for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) { const x = 720 + j * 160, y = 220 + k * 70; g.fillStyle = "#d8dce2"; g.beginPath(); g.arc(x, y, 20, 0, two); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    const a = -2 + ((beat * 0.2 + k + j) % 4); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(a) * 16, y - Math.cos(a) * 16); g.stroke(); }
  // vúmetros que saltan con el bombo
  const vu = 1 - ((beat % 1)) * 0.8;
  for (let j = 0; j < 2; j++) for (let k = 0; k < 10; k++) { const on = k / 10 < vu - j * 0.08; g.fillStyle = on ? (k > 7 ? "#ff4a2a" : k > 5 ? "#ffd23f" : "#7dff6a") : "#3a3442"; g.fillRect(790 + j * 16, 450 - k * 13, 11, 9); }
  // faders y crossfader
  for (let j = 0; j < 2; j++) { rr(705 + j * 170, 470, 14, 110, 4, "#0d0d12", 3); rr(694 + j * 170, 520 - j * 30, 36, 22, 4, "#e6e8ec", 3); }
  rr(730, 595, 140, 14, 4, "#0d0d12", 3);
  const xf = 760 + (0.5 + 0.5 * Math.sin(beat * Math.PI * 0.5)) * 70;
  rr(xf, 586, 28, 32, 4, "#e6e8ec", 3);
  // manos del DJ: brazos de palito que entran desde abajo
  const mano = (x: number, y: number, bx: number) => { g.lineWidth = 16; g.strokeStyle = INK; g.lineCap = "round"; g.beginPath(); g.moveTo(bx, 660); g.quadraticCurveTo((bx + x) / 2 + 40, 600, x, y + 20); g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x, y, 46, 38, 0, 0, two); g.fill(); g.lineWidth = 8; g.stroke();
    for (let k = -1; k <= 1; k++) { g.lineWidth = 7; g.beginPath(); g.moveTo(x + k * 18, y - 30); g.lineTo(x + k * 20, y - 44); g.stroke(); } };
  const sc = Math.sin(beat * Math.PI);
  mano(250 + sc * 40, 330 + sc * 30, 120);
  mano(xf + 14, 560, 980);
};
const cabina = (c: Ctx) => O(`platos|${c.f}`, 1600, 640, platos(c.f), 720, 2440, 1550, 620, 0.97);
// gente bailando hacia el DJ (la cámara): de frente, brazos arriba, como pidiendo más
const genteDJ = (c: Ctx) => {
  const out: Pieza[] = [];
  for (let i = 0; i < 24; i++) {
    const row = Math.floor(i / 6), col = i % 6;
    const py = 1600 + row * 95 + hh(i, 1) * 30, px = 200 + col * 205 + (row % 2) * 95 + (hh(i, 2) - 0.5) * 80;
    const dd = profEn(c.prof, px, py), alto = 300 * (0.62 + 1.25 * dd) / 0.679 * (0.9 + 0.2 * hh(i, 4));
    const e = estilo(i, c.f);
    out.push(P(`b${i}`, bailarin(i), px, py, alto, { mode: "stand", expr: "neutral", facing: 0 }, 40 + i,
      { m: { ...e, espaldas: false, giro: (e.giro ?? 0) * 0.3, mira: 0, pose: i % 3 === 1 ? "baila" : "brazosArriba", gesto: (["risa", "grito", "ojosCerrados", "sonrisa"] as Gesto[])[i % 4] } }));
  }
  return out;
};
// el tío tirado en el suelo pataleando (tarjeta 1200 x 760 dibujada a 1,5x para los primeros planos)
const TUMB: [number, number] = [700, 1945];
const HUECO: [number, number, number] = [700, 1900, 150];
const tumb = (c: Ctx, w = 640) => {
  const [fx, fy] = TUMB, h = w * 760 / 1200, cy = fy - h * (700 - 380) / 760;
  const d = profEn(c.prof, fx, fy), t = c.f / FPS;
  return O(`tumb|${c.f}`, 1800, 1140, (p: Pen) => { p.g.save(); p.g.scale(1.5, 1.5); tumbado({ t, bpm: BPM })(p); p.g.restore(); }, fx, cy, w, h, d);
};
const corro = (i: number, px: number): MunecoOpts | undefined => {
  if (i < 12) return undefined;   // los de atrás siguen a su bola; los cercanos le miran
  const lado = Math.sign(HUECO[0] - px) || 1;
  return { gesto: (["risa", "grito", "sorpresa", "risa"] as Gesto[])[i % 4], pose: i % 3 === 0 ? "brazosArriba" : "baila", rubor: true, espaldas: false, giro: lado * 0.7, mira: lado };
};
const ruedas = (c: Ctx, vel: number) => maq(c, 740, 1135, 330, 0.12, true, vel);
const pop = (c: Ctx, u0: number) => sm((c.u - u0) / 0.15);

const TOMAS: Toma[] = [
  // En 1987, un DJ de Chicago pinchó la misma canción cuatro veces en una noche. Y la pista se le vació.
  T(0, "club", { x: 719, y: 1290, z: 1.0 }, { x: 719, y: 1330, z: 1.2 }, (c) => [hardyPincha(c), ...pocos(c, 10, 0, "quietos")], "CHICAGO · 1987"),
  T(85, "club", { x: 730, y: 1290, z: 2.8 }, { x: 730, y: 1290, z: 3.3 }, (c) => [hardyPincha(c, "chulo")], "CHICAGO · 1987"),
  T(115, "club", { x: 730, y: 1300, z: 2.3 }, { x: 730, y: 1300, z: 2.8 }, (c) => [hardyPincha(c, "dientes"),
    ...(c.u > 0.25 ? [O("x4", 256, 256, rotulo("4", "#ffe14d"), 900, 1180, 170 * pop(c, 0.25), 170 * pop(c, 0.25), 0.03)] : [])], "CHICAGO · 1987"),
  T(153, "club", { x: 719, y: 1380, z: 1.15 }, { x: 719, y: 1360, z: 1.4 }, (c) => [hardy(c, { gesto: "triste" }), ...pocos(c, 12, 141, "salen")]),
  // La canción venía en una cinta. Se la habían dado tres chavales.
  T(204, "puerta", { x: 790, y: 1480, z: 3.4 }, { x: 790, y: 1480, z: 4.1 }, (c) => [...kidsPuerta(c, ["neutral", "grin", "neutral"]), cinta(c, 790, 1490, 130, 0.47)]),
  T(236, "puerta", { x: 719, y: 1350, z: 1.0 }, { x: 719, y: 1380, z: 1.25 }, (c) => [...kidsPuerta(c, ["grin", "smile", "grin"]), cinta(c, 790, 1490, 130, 0.47)]),
  // La habían hecho con una máquina fracasada: una caja de Roland pensada para hacer de bajo, que sonaba a pato enfadado.
  T(281, "misterio", { x: 722, y: 1450, z: 1.1 }, { x: 722, y: 1420, z: 1.6 }, (c) => [maq(c, 722, 1474, 300, 0.3, false),
    ...(c.u > 0.5 ? [O("interrG", 256, 256, rotulo("?", "#ffe14d"), 722, 1230, 220 * pop(c, 0.5), 220 * pop(c, 0.5), 0.3)] : [])]),
  T(342, "saldo", { x: 719, y: 1300, z: 1.0 }, { x: 715, y: 1270, z: 1.4 }, (c) => [maq(c, 715, 1275, 360, 0.06, false),
    ...(c.u > 0.2 ? [O("fracaso", 512, 256, rotulo("¡FRACASO!", "#ff4f4f"), 715, 1060, 420 * pop(c, 0.2), 210 * pop(c, 0.2), 0.06)] : [])]),
  T(373, "tienda", { x: 719, y: 1300, z: 1.0 }, { x: 860, y: 1260, z: 1.3 }, (c) => [guit(c, "smile"), maq(c, ...M_T, 300, 0.205, false)]),
  T(429, "tienda", { x: 1170, y: 1235, z: 3.0 }, { x: 1170, y: 1240, z: 3.7 }, (c) => [maq(c, ...M_T, 300, 0.205, true, 0.02)]),
  T(455, "tienda", { x: 1140, y: 1150, z: 2.5 }, { x: 1140, y: 1140, z: 3.0 }, (c) => [maq(c, ...M_T, 300, 0.205, true, 0.2), ...ondas(c, 1170, 1120, 420, 0.21),
    ...(c.u > 0.2 ? [O("niic", 512, 256, rotulo("¡ÑIIIC!", "#ff4fd8"), 1130, 880, 380 * pop(c, 0.2), 190 * pop(c, 0.2), 0.21)] : [])]),
  T(476, "tienda", { x: 760, y: 1300, z: 1.25 }, { x: 760, y: 1280, z: 1.5 }, (c) => {
    const q = sm(c.u / 0.8);
    return [guit(c, "stern", { m: { gesto: "susto", pose: "manosCabeza", sudor: true } }), maq(c, ...M_T, 300, 0.205, true, 0.2), ...ondas(c, 1170, 1120, 420, 0.21, 2),
      O(`pato|${Math.floor(c.f / 4) % 2}`, 256, 256, pato(Math.floor(c.f / 4) % 2), 1150 - q * 520, 1180 - Math.sin(q * Math.PI) * 330, 320, 320, 0.3),
      ...(c.u > 0.3 ? [O("cuac", 512, 256, rotulo("¡CUAC!", "#ffd23f"), 640, 880, 360, 180, 0.3)] : [])];
  }),
  // Uno de ellos la compró de segunda mano por unos cuarenta dólares.
  T(516, "saldo", { x: 719, y: 1300, z: 1.0 }, { x: 715, y: 1270, z: 1.4 }, (c) => [maq(c, 715, 1275, 360, 0.06, false)]),
  T(566, "saldo", { x: 860, y: 1230, z: 3.0 }, { x: 860, y: 1230, z: 3.6 }, (c) => [maq(c, 715, 1275, 360, 0.06, false), O("etq40", 384, 256, etiqueta("40 $", 0, ""), 905, 1180, 190, 127, 0.07)]),
  // No sabían programarla, así que giraban sus ruedas a ver qué pasaba.
  T(615, "sotano", { x: 740, y: 1250, z: 1.15 }, { x: 740, y: 1200, z: 1.45 }, (c) => [...kidsSotano(c, ["nervous", "nervous", "stern"]).map((k, j) => ({ ...k, m: { gesto: (["duda", "nervioso", "duda"] as Gesto[])[j], pose: j === 1 ? "manosCabeza" as const : "quieto" as const } })), ruedas(c, 0.02)]),
  T(663, "sotano", { x: 740, y: 1110, z: 3.2 }, { x: 740, y: 1100, z: 3.9 }, (c) => [ruedas(c, 0.35), ...ondas(c, 740, 1010, 420, 0.12, 4, 1.0)]),
  T(692, "sotano", { x: 740, y: 1000, z: 1.9 }, { x: 740, y: 1000, z: 2.3 }, (c) => [...kidsSotano(c, ["shock", "laugh", "shock"]), ruedas(c, 0.35),
    ...ondas(c, 740, 900, 520 * (1 + 0.25 * Math.sin(c.f / 3)), 0.1, 4, 1.2)]),
  // Ron Hardy escuchó la cinta entera sin decir nada. Y esa noche la pinchó.
  T(724, "club", { x: 730, y: 1300, z: 2.4 }, { x: 730, y: 1290, z: 3.0 }, (c) => [hardy(c, { gesto: "normal", pose: "sostiene" }), cinta(c, 790, 1360, 60, 0.035)]),
  T(780, "club", { x: 730, y: 1290, z: 3.4 }, { x: 730, y: 1290, z: 4.0 }, (c) => [hardy(c, { gesto: "duda", pose: "sostiene", mira: Math.sin(c.f / 20) }), cinta(c, 790, 1360, 60, 0.035)]),
  T(804, "club", { x: 730, y: 1330, z: 2.8 }, { x: 730, y: 1330, z: 3.3 }, (c) => [hardy(c, { gesto: "chulo", pose: "puno" })]),
  // La primera vez, nadie le hizo caso.
  T(852, "club", { x: 720, y: 1640, z: 1.5 }, { x: 720, y: 1640, z: 1.75 }, (c) => [...pocos(c, 9, 852, "quietos", true), cabina(c)], "1ª"),
  // La segunda, la gente se fue de la pista.
  T(907, "club", { x: 719, y: 1380, z: 1.15 }, { x: 719, y: 1360, z: 1.4 }, (c) => [hardyPincha(c, "dientes"), ...pocos(c, 12, 907, "salen")], "2ª"),
  // La tercera, bailaban sin saber muy bien qué era aquello.
  T(972, "club", { x: 719, y: 1550, z: 1.3 }, { x: 719, y: 1550, z: 1.55 }, (c) => [hardyPincha(c), ...pocos(c, 10, 972, "dudan")], "3ª"),
  T(1028, "club", { x: 700, y: 1720, z: 2.3 }, { x: 700, y: 1720, z: 2.7 }, (c) => [hardyPincha(c), ...pocos(c, 10, 972, "dudan")], "3ª"),
  // Y a la cuarta, la pista se volvió loca.  (el drop del tema cae en «cuarta», cuadro 1088)
  T(1072, "club", { x: 730, y: 1300, z: 3.0 }, { x: 730, y: 1300, z: 3.4 }, (c) => [hardyPincha(c, "chulo")], "4ª"),
  T(1088, "club", { x: 719, y: 1450, z: 1.35 }, { x: 719, y: 1450, z: 1.05 }, (c) => gente(c), "4ª"),
  T(1112, "club", { x: 1060, y: 1400, z: 2.6 }, { x: 1070, y: 1380, z: 3.6 }, (c) => gente(c), "4ª"),
  // Había un tío tirado en el suelo pataleando en el aire.
  T(1138, "club", { x: 720, y: 1520, z: 1.3 }, { x: 700, y: 1680, z: 2.1 }, (c) => [...gente(c, HUECO, corro), tumb(c)]),
  T(1193, "club", { x: 690, y: 1640, z: 2.6 }, { x: 660, y: 1630, z: 3.6 }, (c) => [...gente(c, HUECO, corro), tumb(c)]),
  // Aquel tema se llamó Acid Tracks. Y así nació el acid house.
  T(1235, "club", { x: 720, y: 1640, z: 1.45 }, { x: 720, y: 1640, z: 1.75 }, (c) => [...genteDJ(c), cabina(c)], "ACID TRACKS"),
  T(1300, "club", { x: 822, y: 1460, z: 2.2 }, { x: 822, y: 1440, z: 3.0 }, (c) => gente(c)),
  T(1333, "club", { x: 640, y: 1580, z: 2.0 }, { x: 630, y: 1560, z: 2.8 }, (c) => gente(c)),
  // ¿Tú habrías aguantado en la pista hasta la cuarta?
  T(1357, "club", { x: 600, y: 1650, z: 3.2 }, { x: 560, y: 1640, z: 4.4 }, (c) => [...gente(c, HUECO, corro), tumb(c)]),
];
export const TOTAL = TL.total;
const CIERRE = TL.cierre;

// ---------------- una toma en relieve ----------------
const Escena: React.FC<{ toma: Toma; d: number }> = ({ toma, d }) => {
  const f0 = useCurrentFrame(), f = f0 + toma.a, u = f0 / d;
  const { camera, scene, gl, invalidate } = useThree();
  const [prof, setProf] = React.useState<Prof | null>(null);
  const [tex, setTex] = React.useState<THREE.Texture | null>(null);
  const [h] = React.useState(() => delayRender("fondo " + toma.fondo));
  React.useEffect(() => {
    const tl = new Promise<THREE.Texture>((res) => new THREE.TextureLoader().load(staticFile(`fondos/${toma.fondo}.jpg`), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }));
    Promise.all([tl, cargaProf(staticFile(`fondos/${toma.fondo}_prof.png`))]).then(([t, p]) => { setTex(t); setProf(p); requestAnimationFrame(() => continueRender(h)); });
  }, [toma.fondo, h]);
  const mesh = useMemo(() => (prof && tex ? mallaRelieve(prof, tex) : null), [prof, tex]);
  const pool = useMemo(() => new Pool(), []), root = useMemo(() => new THREE.Group(), []);
  const actors = useMemo(() => [] as Actor[], []), fxs = useMemo(() => [] as Fx[], []);
  const luz = useMemo(() => { const g = new THREE.Group(); const s = new THREE.DirectionalLight("#ffffff", 2.4); s.position.set(-3, 6, 8); g.add(s, s.target, new THREE.HemisphereLight("#ffffff", "#806070", 0.4)); return g; }, []);
  const cam = camera as THREE.PerspectiveCamera, c = camEncuadre(toma.A, toma.B, u, f);
  cam.position.copy(c.pos); cam.lookAt(c.look); cam.fov = c.fov; cam.near = 0.05; cam.far = 200; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); cam.layers.enable(NOINK);
  scene.background = new THREE.Color("#000");
  const Lz = LUCES[toma.fondo];
  TONE.uLitCol.value.set(...Lz.lit); TONE.uShadeCol.value.set(...Lz.shade); TONE.uShadeLift.value.set(...Lz.lift);
  CHAR.uCharTint.value.set(...Lz.tint); CHAR.uCharShade.value = Lz.cs; CHAR.uSideTint.value.set(...Lz.side);
  if (prof) {
    const sunDir = new THREE.Vector3(...Lz.sol).normalize(), right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), light = light2D(sunDir, right);
    const st: Stage = { places: [], fx: [] };
    const ctx: Ctx = { f, u, bt: f / (FPS * 60 / BPM), prof };
    for (const p of toma.piezas(ctx)) {
      if (p.t === "p") {
        const w = mundo(p.px, p.py, prof, p.dOv), s = (p.alto / IH) * PH * w.k / 1.68, dist = cam.position.distanceTo(w.p);
        if (dist < 0.15) continue;
        const [tw, th, tk] = tier(dist / s * 0.9 * (cam.fov / 50));
        const o2 = { ...p.opts, light, seed: (p.i * 5 + 3) % 7 + 1, blink: (f + p.i * 23) % 80 < 3 ? 1 : 0 };
        const mo: MunecoOpts = { ...convierte(p.opts, p.key, p.i, f), ...(p.m ?? {}), parpadeo: o2.blink as number };
        const ro = ropaDe(p.key, p.i);
        st.places.push({ key: `${p.key}|${JSON.stringify(mo)}`, x: w.p.x, y: w.p.y + (p.salto ?? 0) * s, z: w.p.z, size: [tw, th, tk], scale: s, draw: (pp) => muneco(pp, ro, mo) });
        blob(st, sunDir, w.p.x, w.p.y, w.p.z, s * 1.1, 1.0);
      } else {
        const w = mundo(p.px, p.py, prof, p.dOv), k = PH / IH * w.k;
        st.fx.push({ key: p.key, cw: p.cw, ch: p.ch, draw: p.draw, x: w.p.x, y: w.p.y, z: w.p.z + 0.01, w: p.wpx * k, h: p.hpx * k });
      }
    }
    st.places.sort((a, b) => a.z - b.z);
    let ai = 0;
    for (const p of st.places) {
      while (actors.length <= ai) actors.push(new Actor(root));
      const a = actors[ai++], [w, hh2, k] = p.size, s = p.scale ?? 1;
      a.r = pool.req(p.key, w, hh2, k, p.draw); a.mesh.visible = true; a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0); a.mesh.scale.set(s, s, s); a.mesh.renderOrder = 10 + ai;
    }
    for (let i = ai; i < actors.length; i++) actors[i].mesh.visible = false;
    let fi = 0;
    for (const p of st.fx) {
      while (fxs.length <= fi) fxs.push(new Fx(root));
      const e = fxs[fi++]; e.r = pool.req(p.key, p.cw, p.ch, 1, p.draw); e.use(!!p.soft); e.mesh.visible = true; e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0); else e.mesh.rotation.set(0, 0, 0);
      e.mesh.scale.set(p.w, p.h, 1);
    }
    for (let i = fi; i < fxs.length; i++) fxs[i].mesh.visible = false;
    pool.flush(); for (let i = 0; i < ai; i++) actors[i].bind(); for (let i = 0; i < fi; i++) fxs[i].bind();
  }
  React.useEffect(() => { invalidate(); gl.render(scene, camera); });
  return (<>{mesh && <primitive object={mesh} />}<primitive object={root} /><primitive object={luz} /></>);
};

// ---------------- textos ----------------
const limpia = (s: string) => s.replace(/[.,:;]+$/g, "");
const Palabra: React.FC<{ f: number }> = ({ f }) => {
  if (f >= CIERRE.a) return null;
  const ps = TL.palabras;
  let k = -1;
  for (let i = 0; i < ps.length; i++) if (f >= ps[i].a - 1) k = i;
  if (k < 0) return null;
  const p = ps[k], sig = ps[k + 1];
  if (!sig && f > p.b + 10) return null;
  const pop = interpolate(f - p.a, [-1, 2, 5], [0.8, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = limpia(p.t).toLowerCase();
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 1150, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `scale(${pop})`, fontFamily: "Montserrat", fontWeight: 900, fontSize: t.length > 11 ? 66 : 78, color: "#ffffff",
        WebkitTextStroke: `11px ${TINTA}`, paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(0,0,0,0.3)", letterSpacing: -0.5 }}>{t}</div>
    </div>
  );
};
const Fecha: React.FC<{ texto: string; f: number; d: number }> = ({ texto, f, d }) => {
  const op = interpolate(f, [2, 8, d - 4, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (/^\dª$/.test(texto)) {   // contador de veces: grande, con golpe al entrar
    const sc = interpolate(f, [0, 5, 10], [0.4, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), cuarta = texto === "4ª";
    const pul = cuarta ? 1 + 0.06 * Math.pow(1 - ((f / (30 * 60 / BPM)) % 1), 2) : 1;
    return (
      <div style={{ position: "absolute", top: 170, left: 0, width: W, display: "flex", justifyContent: "center", opacity: op }}>
        <div style={{ transform: `scale(${sc * pul}) rotate(-4deg)`, fontFamily: "Montserrat", fontWeight: 900, fontSize: 170, color: cuarta ? "#ff4fd8" : "#ffe14d",
          WebkitTextStroke: `14px ${TINTA}`, paintOrder: "stroke fill", textShadow: cuarta ? "0 0 40px rgba(255,79,216,0.8)" : "0 8px 0 rgba(0,0,0,0.35)" }}>{texto}</div>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", top: 200, left: 0, width: W, display: "flex", justifyContent: "center", opacity: op }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 44, color: "#fff", background: "rgba(14,10,22,0.6)", borderRadius: 999, padding: "8px 28px", letterSpacing: 3 }}>{texto}</div>
    </div>
  );
};
const Cierre: React.FC = () => {
  const f = useCurrentFrame(), beat = f / (30 * 60 / BPM), pulso = Math.pow(1 - (beat % 1), 2);
  const entra = (k: number) => interpolate(f, [k, k + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0c0718", alignItems: "center", justifyContent: "center" }}>
      <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 1, 2].map((i) => <Onda key={i} x0={-40} x1={1120} y={1600 + i * 70} amp={50} f={f} color={["#7dff6a", "#ff4fd8", "#4fd8ff"][i]} fase={i * 2} vel={0.3} />)}
      </svg>
      <div style={{ marginTop: -180, fontFamily: "Montserrat", fontWeight: 900, textAlign: "center", color: "#fff", WebkitTextStroke: `10px ${TINTA}`, paintOrder: "stroke fill" }}>
        <div style={{ fontSize: 50, letterSpacing: 8, color: "#ffe14d", opacity: entra(0) }}>{TL.serie.toUpperCase()} · EP. {TL.episodio}</div>
        <div style={{ fontSize: 76, marginTop: 24, opacity: entra(4), padding: "0 60px", lineHeight: 1.05 }}>{TL.titulo}</div>
        <div style={{ fontSize: 150, marginTop: 90, opacity: entra(10), transform: `scale(${1 + 0.04 * pulso})` }}>NeNeMaNé</div>
        <div style={{ fontSize: 52, marginTop: 10, opacity: entra(14), color: "#4fd8ff", WebkitTextStroke: `8px ${TINTA}` }}>nenemane.com</div>
        <div style={{ fontSize: 44, marginTop: 60, opacity: entra(18), color: "#ff4fd8", letterSpacing: 2 }}>♪ 3I ATLAS COMING</div>
        <div style={{ fontSize: 56, marginTop: 40, opacity: entra(24), color: "#7dff6a" }}>Escúchalo en Spotify</div>
      </div>
    </AbsoluteFill>
  );
};

const dpr = () => (getInputProps() as { dpr?: number }).dpr;
export const Ep01e: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = React.useState(() => delayRender("fuentes"));
  React.useEffect(() => { document.fonts.ready.then(() => continueRender(h)); }, [h]);
  const fechaAct = (() => { let s: { t: string; a: number; b: number } | null = null; TOMAS.forEach((tm, i) => { const b = TOMAS[i + 1]?.a ?? CIERRE.a; if (tm.fecha && f >= tm.a && f < b) { let a = tm.a; for (let j = i - 1; j >= 0 && TOMAS[j].fecha === tm.fecha; j--) a = TOMAS[j].a; let bb = b; for (let j = i + 1; j < TOMAS.length && TOMAS[j].fecha === tm.fecha; j++) bb = TOMAS[j + 1]?.a ?? CIERRE.a; s = { t: tm.fecha, a, b: bb }; } }); return s as { t: string; a: number; b: number } | null; })();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: "brightness(1.1) contrast(1.18) saturate(1.04)" }}>
      {TOMAS.map((tm, i) => {
        const b = TOMAS[i + 1]?.a ?? CIERRE.a;
        return (
          <Sequence key={i} from={tm.a} durationInFrames={b - tm.a}>
            <ThreeCanvas width={1080} height={1920} {...(dpr() ? { dpr: dpr() } : {})} flat linear={false} camera={{ fov: 50 }} gl={{ antialias: true }}><Escena toma={tm} d={b - tm.a} /></ThreeCanvas>
          </Sequence>
        );
      })}
      </AbsoluteFill>
      {fechaAct && <Fecha texto={fechaAct.t} f={f - fechaAct.a} d={fechaAct.b - fechaAct.a} />}
      <Sequence from={CIERRE.a} durationInFrames={CIERRE.b - CIERRE.a}><Cierre /></Sequence>
      <Palabra f={f} />
      {!(getInputProps() as { mute?: boolean }).mute && <Audio src={staticFile("mezcla_ep01_v3.wav")} />}
    </AbsoluteFill>
  );
};
