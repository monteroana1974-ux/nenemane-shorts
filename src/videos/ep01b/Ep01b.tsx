// Techno Old School · Ep. 1 «La máquina que nadie quería» — versión con fondos pintados (Nano Banana) en relieve.
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
import { Onda, W, TINTA } from "../../motor2d/base";
import TL from "../../../datos/tb303.json";

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

// ---------------- piezas de cada toma ----------------
type Ctx = { f: number; u: number; bt: number; prof: Prof };
type Persona = { t: "p"; key: string; o: Outfit; px: number; py: number; alto: number; opts: Parameters<typeof bodyFront>[2]; i: number; dOv?: number; salto?: number };
type Obj = { t: "o"; key: string; cw: number; ch: number; draw: (p: Pen) => void; px: number; py: number; wpx: number; hpx: number; dOv?: number };
type Pieza = Persona | Obj;
type Toma = { a: number; fondo: string; A: Encuadre; B: Encuadre; fecha?: string; piezas: (c: Ctx) => Pieza[] };

const P = (key: string, o: Outfit, px: number, py: number, alto: number, opts: Parameters<typeof bodyFront>[2], i: number, extra: Partial<Persona> = {}): Persona => ({ t: "p", key, o, px, py, alto, opts, i, ...extra });
const O = (key: string, cw: number, ch: number, draw: (p: Pen) => void, px: number, py: number, wpx: number, hpx: number, dOv?: number): Obj => ({ t: "o", key, cw, ch, draw, px, py, wpx, hpx, dOv });
const maq = (c: Ctx, px: number, py: number, w: number, d: number, vivo: boolean, vel = 0.05) =>
  O(`maq|${vivo ? Math.floor(c.f / 3) : 0}`, 512, 200, maquina(vivo ? c.f * vel : 0.4, vivo ? Math.floor(c.f / 3.5) % 16 : -1), px, py, w, w * 0.39, d);
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
const gente = (c: Ctx) => {
  const out: Pieza[] = [P("dj", DJ, 730, 1445, 300, { mode: "stand", expr: "grin", facing: 0, wave: Math.sin(c.bt * Math.PI) }, 30, { dOv: 0.03 })];
  for (let i = 0; i < 24; i++) {
    const row = Math.floor(i / 6), col = i % 6;
    const py = 1600 + row * 85 + hh(i, 1) * 30, px = 240 + col * 190 + (row % 2) * 95 + (hh(i, 2) - 0.5) * 60;
    const dd = profEn(c.prof, px, py), alto = 300 * (0.62 + 1.25 * dd) / 0.679 * (0.9 + 0.2 * hh(i, 4));
    const ex: Expr = (["laugh", "grin", "shout", "smile_closed"] as Expr[])[i % 4];
    out.push(P(`b${i}`, bailarin(i), px, py, alto, { mode: "stand", expr: ex, facing: 0, wave: i % 2 ? Math.round(Math.sin(c.bt * Math.PI + i) * 2) / 2 : undefined, headTilt: Math.round(Math.sin(c.bt * Math.PI) * 2) * 3 }, 40 + i,
      { salto: Math.abs(Math.sin(Math.PI * (c.bt + hh(i, 3) * 0.3))) * 0.06 }));
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
const TOMAS: Toma[] = [
  // 1981 · la tienda
  T(0, "tienda", { x: 719, y: 1300, z: 1.0 }, { x: 860, y: 1260, z: 1.3 }, (c) => [guit(c, "smile"), maq(c, ...M_T, 300, 0.205, false)], "1981"),
  T(58, "tienda", { x: 1170, y: 1235, z: 3.0 }, { x: 1170, y: 1240, z: 3.7 }, (c) => [maq(c, ...M_T, 300, 0.205, true, 0.02)]),
  T(100, "tienda", { x: 640, y: 1500, z: 1.7 }, { x: 700, y: 1460, z: 2.0 }, (c) => [guit(c, "smile"), maq(c, ...M_T, 300, 0.205, false)]),
  T(150, "tienda", { x: 560, y: 1330, z: 2.8 }, { x: 560, y: 1320, z: 3.3 }, (c) => [guit(c, "grin")]),
  // fue un desastre
  T(182, "tienda", { x: 1120, y: 1150, z: 2.4 }, { x: 1120, y: 1140, z: 2.9 }, (c) => [maq(c, ...M_T, 300, 0.205, true, 0.2), ...ondas(c, 1170, 1120, 420, 0.21),
    ...(c.u > 0.1 ? [O("niic", 512, 256, rotulo("¡ÑIIIC!", "#ff4fd8"), 1130, 880, 380 * sm((c.u - 0.1) / 0.15), 190 * sm((c.u - 0.1) / 0.15), 0.21)] : [])]),
  T(228, "tienda", { x: 600, y: 1420, z: 1.8 }, { x: 640, y: 1400, z: 2.2 }, (c) => [guit(c, c.u < 0.4 ? "shock" : "pained", { opts: { mode: "stand", expr: c.u < 0.4 ? "shock" : "pained", facing: 0, look: 1, headTilt: Math.round(Math.sin(c.f / 3)) * 4 } }),
    maq(c, ...M_T, 300, 0.205, true, 0.2), ...ondas(c, 1170, 1120, 420, 0.21, 2)]),
  T(290, "tienda", { x: 1150, y: 1120, z: 3.0 }, { x: 1150, y: 1110, z: 3.6 }, (c) => [maq(c, ...M_T, 300, 0.205, true, 0.3), ...ondas(c, 1170, 1150, 380, 0.21, 4, 2.2)]),
  T(350, "tienda", { x: 760, y: 1300, z: 1.25 }, { x: 760, y: 1280, z: 1.5 }, (c) => {
    const q = sm(c.u / 0.8);
    return [guit(c, "stern"), maq(c, ...M_T, 300, 0.205, true, 0.2), ...ondas(c, 1170, 1120, 420, 0.21, 2),
      O(`pato|${Math.floor(c.f / 4) % 2}`, 256, 256, pato(Math.floor(c.f / 4) % 2), 1150 - q * 520, 1180 - Math.sin(q * Math.PI) * 330, 320, 320, 0.3),
      ...(c.u > 0.35 ? [O("cuac", 512, 256, rotulo("¡CUAC!", "#ffd23f"), 640, 880, 360, 180, 0.3)] : [])];
  }),
  // sin manual en inglés
  T(405, "tienda", { x: 800, y: 1350, z: 1.5 }, { x: 820, y: 1330, z: 1.8 }, (c) => [P("cli", CLIENTE, 760, 1900, 720, { mode: "stand", expr: "nervous", facing: 0, look: 1 }, 3),
    O("manual", 512, 384, manualDraw, 820, 1490, 300, 225, 0.47), maq(c, ...M_T, 300, 0.205, false)]),
  T(462, "tienda", { x: 800, y: 1420, z: 2.3 }, { x: 810, y: 1440, z: 2.7 }, (c) => [P("cli", CLIENTE, 760, 1900, 720, { mode: "stand", expr: "nervous", facing: 0, look: 1 }, 3),
    O("manual", 512, 384, manualDraw, 820, 1490, 300, 225, 0.47)]),
  T(502, "tienda", { x: 760, y: 1280, z: 2.6 }, { x: 760, y: 1270, z: 3.1 }, (c) => [P("cli", CLIENTE, 760, 1900, 720, { mode: "stand", expr: "pained", facing: 0, look: 0, headTilt: 8 }, 3),
    ...[0, 1, 2].map((k) => { const ph = ((c.f + k * 17) % 51) / 51; return O("interr", 256, 256, rotulo("?", "#ffe14d"), 640 + k * 120, 1080 - ph * 140, 110 + ph * 50, 110 + ph * 50, 0.46); })]),
  // 1984 · segunda mano
  T(560, "saldo", { x: 719, y: 1300, z: 1.0 }, { x: 715, y: 1270, z: 1.35 }, (c) => [maq(c, 715, 1275, 360, 0.06, false)], "1984"),
  T(646, "saldo", { x: 715, y: 1250, z: 2.5 }, { x: 715, y: 1255, z: 3.1 }, (c) => [maq(c, 715, 1275, 360, 0.06, false),
    ...Array.from({ length: 14 }, (_, k) => O("polvo", 64, 64, (p: Pen) => { const g = p.g, gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,240,210,0.9)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); },
      520 + hh(k, 6) * 400, 1050 + ((hh(k, 4) * 300 + (c.f - 646) * (0.6 + hh(k, 5))) % 300), 14, 14, 0.08))]),
  T(705, "saldo", { x: 880, y: 1225, z: 3.3 }, { x: 880, y: 1225, z: 3.9 }, (c) => {
    const tach = sm((c.u - 0.15) / 0.3), sal = c.u > 0.55;
    return [maq(c, 715, 1275, 360, 0.06, false), O(`etq|${Math.round(tach * 6)}|${sal}`, 384, 256, etiqueta("395 $", tach, sal ? "SALDO" : ""), 905, 1180, 190, 127, 0.07)];
  }),
  // misterio
  T(744, "misterio", { x: 722, y: 1450, z: 1.1 }, { x: 722, y: 1440, z: 1.5 }, (c) => [maq(c, 722, 1474, 300, 0.3, false)]),
  T(798, "misterio", { x: 722, y: 1380, z: 2.0 }, { x: 722, y: 1360, z: 2.5 }, (c) => [maq(c, 722, 1474, 300, 0.3, false),
    ...(c.u > 0.3 ? [O("interrG", 256, 256, rotulo("?", "#ffe14d"), 722, 1220 + Math.sin(c.f / 12) * 8, 240 * sm((c.u - 0.3) / 0.2), 240 * sm((c.u - 0.3) / 0.2), 0.3)] : [])]),
  // Chicago · los chavales
  T(857, "chicago", { x: 719, y: 1288, z: 1.0 }, { x: 720, y: 1340, z: 1.25 }, (c) => kidsCalle(c, 857), "CHICAGO"),
  T(898, "chicago", { x: 720, y: 1600, z: 1.5 }, { x: 720, y: 1620, z: 1.8 }, (c) => [...kidsCalle(c, 857), maqEnManos(c, 857)]),
  T(960, "chicago", { x: 720, y: 1640, z: 2.3 }, { x: 720, y: 1640, z: 2.7 }, (c) => [...kidsCalle(c, 857), maqEnManos(c, 857)]),
  // el sótano · giran las ruedas
  T(1017, "sotano", { x: 740, y: 1250, z: 1.15 }, { x: 740, y: 1200, z: 1.45 }, (c) => [...kidsSotano(c, ["grin", "smile", "grin"]), maq(c, 740, 1135, 330, 0.12, true, 0.05)]),
  T(1058, "sotano", { x: 740, y: 1110, z: 3.2 }, { x: 740, y: 1100, z: 3.9 }, (c) => [maq(c, 740, 1135, 330, 0.12, true, 0.35), ...ondas(c, 740, 1010, 420, 0.12, 4, 1.0)]),
  T(1100, "sotano", { x: 740, y: 1000, z: 1.9 }, { x: 740, y: 1000, z: 2.3 }, (c) => [...kidsSotano(c, ["shock", "laugh", "shock"]), maq(c, 740, 1135, 330, 0.12, true, 0.35), ...ondas(c, 740, 900, 520, 0.1, 4, 1.0)]),
  // 1987 · el club (el corte del drop cae en el compás 21 = cuadro 1163)
  T(1138, "club", { x: 730, y: 1290, z: 3.0 }, { x: 730, y: 1290, z: 3.4 }, (c) => [P("dj", DJ, 730, 1445, 300, { mode: "stand", expr: "smile", facing: 0 }, 30, { dOv: 0.03 })], "1987 · ACID TRACKS"),
  T(1163, "club", { x: 719, y: 1450, z: 1.25 }, { x: 719, y: 1450, z: 1.05 }, (c) => gente(c), "1987 · ACID TRACKS"),
  T(1222, "club", { x: 720, y: 1700, z: 1.8 }, { x: 720, y: 1700, z: 2.15 }, (c) => gente(c)),
  T(1279, "club", { x: 719, y: 1288, z: 1.0 }, { x: 719, y: 1350, z: 1.2 }, (c) => gente(c)),
  // hoy · la vitrina
  T(1340, "museo", { x: 719, y: 1300, z: 1.0 }, { x: 730, y: 1290, z: 1.3 }, (c) => [maq(c, 738, 1285, 300, 0.16, true, 0.01),
    P("col1", COLE[0], 330, 1800, 680, { mode: "stand", expr: "smile", facing: 0, look: 1 }, 50), P("col2", COLE[1], 1110, 1800, 680, { mode: "stand", expr: "grin", facing: 0, look: -1 }, 51)], "HOY"),
  T(1395, "museo", { x: 860, y: 1140, z: 2.5 }, { x: 860, y: 1130, z: 3.0 }, (c) => {
    const n = Math.min(4, Math.floor(sm(c.u / 0.9) * 4.99));
    return [maq(c, 738, 1285, 300, 0.16, true, 0.01), O(`etqM|${n}`, 384, 256, etiqueta(["395 $", "×2", "×3", "×4", "×5"][n], 0, "", n ? "#1f8a3a" : "#3a2d20"), 960, 1060 - n * 18, 220 * (1 + n * 0.08), 147 * (1 + n * 0.08), 0.2)];
  }),
  T(1438, "museo", { x: 1080, y: 1260, z: 2.6 }, { x: 1080, y: 1250, z: 3.1 }, (c) => [P("col2", COLE[1], 1110, 1800, 680, { mode: "stand", expr: "shock", facing: 0, look: -1 }, 51),
    O("etqM|4", 384, 256, etiqueta("×5", 0, "", "#1f8a3a"), 960, 990, 280, 187, 0.2)]),
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
        st.places.push({ key: `${p.key}|${JSON.stringify(o2)}`, x: w.p.x, y: w.p.y + (p.salto ?? 0) * s, z: w.p.z, size: [tw, th, tk], scale: s, draw: (pp) => bodyFront(pp, p.o, o2) });
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
        {[0, 1, 2].map((i) => <Onda key={i} x0={-40} x1={1120} y={1420 + i * 70} amp={50} f={f} color={["#7dff6a", "#ff4fd8", "#4fd8ff"][i]} fase={i * 2} vel={0.3} />)}
      </svg>
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, textAlign: "center", color: "#fff", WebkitTextStroke: `10px ${TINTA}`, paintOrder: "stroke fill" }}>
        <div style={{ fontSize: 50, letterSpacing: 8, color: "#ffe14d", opacity: entra(0) }}>{TL.serie.toUpperCase()} · EP. {TL.episodio}</div>
        <div style={{ fontSize: 76, marginTop: 24, opacity: entra(4), padding: "0 60px", lineHeight: 1.05 }}>{TL.titulo}</div>
        <div style={{ fontSize: 150, marginTop: 120, opacity: entra(10), transform: `scale(${1 + 0.04 * pulso})` }}>NeNeMaNé</div>
        <div style={{ fontSize: 46, marginTop: 30, opacity: entra(16), color: "#7dff6a" }}>Escúchalo en Spotify</div>
      </div>
    </AbsoluteFill>
  );
};

const dpr = () => (getInputProps() as { dpr?: number }).dpr;
export const Ep01b: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = React.useState(() => delayRender("fuentes"));
  React.useEffect(() => { document.fonts.ready.then(() => continueRender(h)); }, [h]);
  const fechaAct = (() => { let s: { t: string; a: number; b: number } | null = null; TOMAS.forEach((tm, i) => { const b = TOMAS[i + 1]?.a ?? CIERRE.a; if (tm.fecha && f >= tm.a && f < b) { let a = tm.a; for (let j = i - 1; j >= 0 && TOMAS[j].fecha === tm.fecha; j--) a = TOMAS[j].a; let bb = b; for (let j = i + 1; j < TOMAS.length && TOMAS[j].fecha === tm.fecha; j++) bb = TOMAS[j + 1]?.a ?? CIERRE.a; s = { t: tm.fecha, a, b: bb }; } }); return s as { t: string; a: number; b: number } | null; })();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {TOMAS.map((tm, i) => {
        const b = TOMAS[i + 1]?.a ?? CIERRE.a;
        return (
          <Sequence key={i} from={tm.a} durationInFrames={b - tm.a}>
            <ThreeCanvas width={1080} height={1920} {...(dpr() ? { dpr: dpr() } : {})} flat linear={false} camera={{ fov: 50 }} gl={{ antialias: true }}><Escena toma={tm} d={b - tm.a} /></ThreeCanvas>
          </Sequence>
        );
      })}
      {fechaAct && <Fecha texto={fechaAct.t} f={f - fechaAct.a} d={fechaAct.b - fechaAct.a} />}
      <Sequence from={CIERRE.a} durationInFrames={CIERRE.b - CIERRE.a}><Cierre /></Sequence>
      <Palabra f={f} />
      {!(getInputProps() as { mute?: boolean }).mute && <Audio src={staticFile("mezcla_ep01.wav")} />}
    </AbsoluteFill>
  );
};
