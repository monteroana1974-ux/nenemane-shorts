// Mundo 3D del episodio TB-303 (prueba de estilo): tres decorados en un solo mundo three.js, posado por cuadro.
// Piezas del motor (MIT, LuisPa / Mr omi): materiales de dos tonos, texturas pintadas, personajes como tarjetas
// iluminadas con sombra de contacto, tinta del mundo. Lo nuevo: interiores (tienda y club), calle de noche, la
// máquina en 3D de verdad, pista de baile con luces que laten al BPM, haces de luz y gente bailando.
import * as THREE from "three";
import { Pen, bodyFront, Outfit, Expr, SKINS } from "../../motor3d/toon";
import { Pool, Actor, Fx, Stage, tier, light2D, blob } from "../../motor3d/troop";
import { NOINK } from "../../motor3d/ink";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../../motor3d/lights";
import { TONE, CHAR, twoTone, untone } from "../../motor3d/shade";
import { planksHD, brick, ctex, rep, rng } from "../../motor3d/paint";
import { FPS, SHOTS, SET, Luz, camAt, kidsZ, gait, beatAt, pulse, uOf, clamp01, smooth } from "./story";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const lam = (p: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(p));
const glow = (r: number, g: number, b: number) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), fog: false }); return m; };

// ---------------- luces por decorado ----------------
const PRESET: Record<Luz, LightPreset> = {
  tienda: { ...LIGHTS.golden, el: 58, lit: [1.5, 1.12, 0.74], shade: [0.42, 0.28, 0.22], lift: [0.1, 0.06, 0.04], term: 0.12,
    charTint: [1.0, 0.9, 0.78], charShade: 0.86, sideTint: [0.9, 0.84, 0.9], fog: "#3a2418", sunCol: "#ffcf98", sunI: 3.0,
    sky: "#c8a090", ground: "#5a3a30", hemiI: 0.4, actorShadow: false, bias: -0.0004, normalBias: 0.02 },
  noche: { ...LIGHTS.day, el: 34, lit: [0.62, 0.74, 1.3], shade: [0.1, 0.1, 0.25], lift: [0.03, 0.03, 0.1], term: 0.15,
    charTint: [0.8, 0.86, 1.08], charShade: 0.78, sideTint: [0.78, 0.8, 1.0], fog: "#221b44", sunCol: "#a8baff", sunI: 2.2,
    sky: "#5060a0", ground: "#30283c", hemiI: 0.35, actorShadow: false, bias: -0.0004, normalBias: 0.02 },
  club: { ...LIGHTS.golden, el: 62, lit: [1.32, 0.56, 1.28], shade: [0.1, 0.06, 0.24], lift: [0.04, 0.02, 0.1], term: 0.12,
    charTint: [1.0, 0.74, 1.0], charShade: 0.8, sideTint: [0.7, 0.85, 1.0], fog: "#1a0e2c", sunCol: "#ff8ae0", sunI: 3.0,
    sky: "#603070", ground: "#201030", hemiI: 0.35, actorShadow: false, bias: -0.0004, normalBias: 0.02 },
  saldo: { ...LIGHTS.golden, el: 50, lit: [1.25, 1.05, 0.8], shade: [0.3, 0.26, 0.3], lift: [0.07, 0.06, 0.08], term: 0.12,
    charTint: [1.0, 0.92, 0.82], charShade: 0.84, sideTint: [0.88, 0.86, 0.95], fog: "#2a241e", sunCol: "#ffe0b0", sunI: 2.6,
    sky: "#a09080", ground: "#4a4038", hemiI: 0.35, actorShadow: false, bias: -0.0004, normalBias: 0.02 },
  misterio: { ...LIGHTS.day, el: 70, lit: [1.2, 1.22, 1.45], shade: [0.05, 0.05, 0.1], lift: [0.02, 0.02, 0.05], term: 0.12,
    charTint: [0.9, 0.92, 1.05], charShade: 0.7, sideTint: [0.7, 0.72, 0.95], fog: "#07060e", sunCol: "#dfe6ff", sunI: 3.0,
    sky: "#303050", ground: "#101018", hemiI: 0.2, actorShadow: false, bias: -0.0004, normalBias: 0.02 },
  sotano: { ...LIGHTS.golden, el: 64, lit: [0.9, 1.35, 0.85], shade: [0.14, 0.08, 0.24], lift: [0.05, 0.03, 0.1], term: 0.12,
    charTint: [0.85, 1.0, 0.9], charShade: 0.8, sideTint: [0.95, 0.75, 1.0], fog: "#160c24", sunCol: "#b0ff90", sunI: 2.8,
    sky: "#503070", ground: "#201030", hemiI: 0.3, actorShadow: false, bias: -0.0004, normalBias: 0.02 },
  museo: { ...LIGHTS.day, el: 62, lit: [1.45, 1.36, 1.2], shade: [0.16, 0.18, 0.3], lift: [0.04, 0.05, 0.1], term: 0.12,
    charTint: [1.0, 0.96, 0.92], charShade: 0.82, sideTint: [0.85, 0.88, 1.0], fog: "#141a2c", sunCol: "#fff0d6", sunI: 3.0,
    sky: "#405070", ground: "#202838", hemiI: 0.3, actorShadow: false, bias: -0.0004, normalBias: 0.02 },
};
const SKY: Record<Luz, WorldLook> = {
  saldo: { ...LOOK.golden, sky: { c: ["#2a241e", "#2a241e", "#2a241e", "#2a241e", "#2a241e"], e: [0, 4, 10, 20, 40] }, sat: 0.85 },
  misterio: { ...LOOK.day, sky: { c: ["#07060e", "#07060e", "#07060e", "#07060e", "#07060e"], e: [0, 4, 10, 20, 40] }, sat: 1.0 },
  sotano: { ...LOOK.golden, sky: { c: ["#160c24", "#160c24", "#160c24", "#160c24", "#160c24"], e: [0, 4, 10, 20, 40] }, sat: 1.1 },
  museo: { ...LOOK.day, sky: { c: ["#141a2c", "#141a2c", "#141a2c", "#141a2c", "#141a2c"], e: [0, 4, 10, 20, 40] }, sat: 1.0 },
  tienda: { ...LOOK.golden, sky: { c: ["#3a2430", "#3a2430", "#3a2430", "#3a2430", "#3a2430"], e: [0, 4, 10, 20, 40] }, sat: 1.0 },
  noche: { ...LOOK.day, sky: { c: ["#4a3a72", "#33296a", "#221d55", "#151440", "#0a0a26"], e: [0, 4, 12, 24, 50] }, sat: 0.95 },
  club: { ...LOOK.golden, sky: { c: ["#120a1e", "#120a1e", "#120a1e", "#120a1e", "#120a1e"], e: [0, 4, 10, 20, 40] }, sat: 1.05 },
};

// ---------------- reparto ----------------
const GUITARRISTA: Outfit = { jacket: "#2f5d9e", pants: "#2d3550", boots: "#3a2a20", hat: "hair", hair: "#6b3b1e", skin: SKINS[0] };
const VENDEDOR: Outfit = { jacket: "#a8432f", pants: "#3b3f52", boots: "#2a2020", hat: "hair", hair: "#2b1d1a", skin: SKINS[1], moustache: "#2b1d1a", build: "stout" };
const CHAVALES: Outfit[] = [
  { jacket: "#e0a43a", pants: "#2d3550", boots: "#f4f1ea", hat: "cap", cap: "#d33a3a", skin: SKINS[3] },
  { jacket: "#3f9a62", pants: "#22283a", boots: "#f4f1ea", hat: "hair", hair: "#1b1414", skin: "#8a5a3c" },
  { jacket: "#c2452f", pants: "#2d3550", boots: "#1b1414", hat: "cap", cap: "#2f5d9e", skin: "#6e4430" },
];
const ROPA = ["#e0a43a", "#3f9a62", "#c2452f", "#2f5d9e", "#d64fb4", "#5ad0c8", "#f1d06a", "#8a5ac9"];
const PIEL = [SKINS[0], SKINS[1], SKINS[3], "#8a5a3c", "#6e4430", SKINS[2]];
const PELO = ["#2b1d1a", "#6b3b1e", "#1b1414", "#c9a06b", "#3a2a20"];
const bailarin = (i: number): Outfit => ({
  jacket: ROPA[i % ROPA.length], pants: ["#22283a", "#2d3550", "#3b3f52"][i % 3], boots: i % 2 ? "#f4f1ea" : "#1b1414",
  hat: i % 3 === 0 ? "cap" : "hair", cap: ROPA[(i + 3) % ROPA.length], hair: PELO[i % PELO.length], skin: PIEL[(i * 5) % PIEL.length],
});
const CLIENTE: Outfit = { jacket: "#e0a43a", pants: "#3b3f52", boots: "#2a2020", hat: "cap", cap: "#2f5d9e", skin: SKINS[2] };
const COLECC: Outfit[] = [
  { jacket: "#2f5d9e", pants: "#22283a", boots: "#1b1414", hat: "hair", hair: "#c9a06b", skin: SKINS[0] },
  { jacket: "#c2452f", pants: "#2d3550", boots: "#3a2a20", hat: "hair", hair: "#1b1414", skin: "#8a5a3c", moustache: "#1b1414" },
];
const DJ: Outfit = { jacket: "#3f9a62", pants: "#22283a", boots: "#1b1414", hat: "cap", cap: "#111111", skin: "#8a5a3c" };

// ---------------- texturas pintadas ----------------
const paredTienda = () => ctex("paredTienda", 2048, 1024, (g, r) => {
  g.fillStyle = "#b5694a"; g.fillRect(0, 0, 2048, 1024);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,220,190" : "70,30,20"},0.06)`; g.beginPath(); g.ellipse(r() * 2048, r() * 1024, 30 + r() * 90, 15 + r() * 40, 0, 0, 7); g.fill(); }
  // zócalo de madera
  g.fillStyle = "#5e3522"; g.fillRect(0, 700, 2048, 324);
  for (let x = 0; x < 2048; x += 128) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x, 700, 5, 324); }
  g.fillStyle = "#3e2216"; g.fillRect(0, 690, 2048, 18);
  // carteles de conciertos inventados
  const cols = [["#e0a43a", "#c2452f"], ["#2f5d9e", "#f1d06a"], ["#3f9a62", "#1d1630"], ["#d64fb4", "#ffe9b0"], ["#f1d06a", "#2f5d9e"]];
  for (let k = 0; k < 7; k++) {
    const x = 90 + k * 280 + r() * 30, y = 150 + r() * 120, w = 170, h = 240, [a, b] = cols[k % 5];
    g.save(); g.translate(x + w / 2, y + h / 2); g.rotate((r() - 0.5) * 0.12);
    g.fillStyle = a; g.fillRect(-w / 2, -h / 2, w, h);
    g.fillStyle = b; g.beginPath(); g.arc(0, -20, 52, 0, 7); g.fill();
    g.fillRect(-60, 60, 120, 16); g.fillRect(-45, 88, 90, 10);
    g.strokeStyle = "#241726"; g.lineWidth = 6; g.strokeRect(-w / 2, -h / 2, w, h);
    g.restore();
  }
});
const frenteAmpli = () => ctex("ampli", 512, 512, (g) => {
  g.fillStyle = "#1e1a1c"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#3a3236"; for (let y = 120; y < 500; y += 10) for (let x = 20; x < 492; x += 10) g.fillRect(x, y, 6, 6);
  g.fillStyle = "#c9b07a"; g.fillRect(0, 0, 512, 90);
  for (let k = 0; k < 6; k++) { g.fillStyle = "#1e1a1c"; g.beginPath(); g.arc(60 + k * 75, 45, 18, 0, 7); g.fill(); }
  g.fillStyle = "#f4efe2"; g.font = "bold 46px sans-serif"; g.fillText("~", 440, 60);
});
const fachadaNoche = (k: number, wm: number, hm: number) => ctex("facN" + k, Math.round(wm * 40), Math.round(hm * 40), (g, r) => {
  const W = Math.round(wm * 40), H = Math.round(hm * 40);
  g.fillStyle = g.createPattern(brick().image as HTMLCanvasElement, "repeat")!; g.fillRect(0, 0, W, H);
  g.fillStyle = ["rgba(40,20,60,0.45)", "rgba(20,30,60,0.5)", "rgba(60,30,30,0.4)"][k % 3]; g.fillRect(0, 0, W, H);
  const floors = Math.floor(hm / 3.2), nWin = Math.max(1, Math.floor(wm / 2.4));
  for (let fl = 0; fl < floors; fl++) for (let i = 0; i < nWin; i++) {
    const cx = ((i + 0.5) * W) / nWin, y0 = H - (fl + 1) * 3.2 * 40 + 30, ww = 1.0 * 40, wh = 1.6 * 40;
    const on = r() > 0.45;
    g.fillStyle = "#14101c"; g.fillRect(cx - ww / 2 - 5, y0 - 5, ww + 10, wh + 10);
    if (on) { const gr = g.createLinearGradient(0, y0, 0, y0 + wh); gr.addColorStop(0, "#ffe7a0"); gr.addColorStop(1, "#f0a040"); g.fillStyle = gr; }
    else g.fillStyle = "#2a2850";
    g.fillRect(cx - ww / 2, y0, ww, wh);
    g.fillStyle = "#14101c"; g.fillRect(cx - 2, y0, 4, wh); g.fillRect(cx - ww / 2, y0 + wh / 2 - 2, ww, 4);
  }
  // escaleras de incendios
  g.strokeStyle = "#0e0c14"; g.lineWidth = 4;
  for (let fl = 1; fl < floors; fl++) { const y = H - fl * 3.2 * 40; g.strokeRect(W * 0.2, y - 10, W * 0.6, 8); for (let x = W * 0.2; x < W * 0.8; x += 14) { g.beginPath(); g.moveTo(x, y - 10); g.lineTo(x, y - 40); g.stroke(); } g.beginPath(); g.moveTo(W * 0.2, y - 40); g.lineTo(W * 0.8, y - 40); g.stroke(); }
});
const asfalto = () => ctex("asfalto", 512, 512, (g, r) => {
  g.fillStyle = "#3a3646"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? "rgba(20,18,26,0.35)" : "rgba(110,104,130,0.18)"; g.fillRect(r() * 512, r() * 512, 2 + r() * 3, 2 + r() * 3); }
});
const paredClub = () => ctex("paredClub", 1024, 512, (g, r) => {
  g.fillStyle = "#1c1030"; g.fillRect(0, 0, 1024, 512);
  for (let x = 0; x < 1024; x += 64) { g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x, 0, 6, 512); }
  for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(255,255,255,0.03)"; g.fillRect(r() * 1024, r() * 512, 60, 3); }
});
const frenteAltavoz = () => ctex("altavoz", 512, 1024, (g) => {
  g.fillStyle = "#141018"; g.fillRect(0, 0, 512, 1024);
  for (const [y, rad] of [[200, 150], [560, 190], [880, 90]] as const) {
    g.fillStyle = "#2a2430"; g.beginPath(); g.arc(256, y, rad, 0, 7); g.fill();
    g.fillStyle = "#0a080c"; g.beginPath(); g.arc(256, y, rad * 0.62, 0, 7); g.fill();
    g.fillStyle = "#3a3440"; g.beginPath(); g.arc(256, y, rad * 0.2, 0, 7); g.fill();
  }
});
const frenteCabina = () => ctex("cabina", 1024, 384, (g) => {
  g.fillStyle = "#2a1a40"; g.fillRect(0, 0, 1024, 384);
  const gr = g.createLinearGradient(0, 0, 1024, 0); gr.addColorStop(0, "#7dff6a"); gr.addColorStop(0.5, "#ff4fd8"); gr.addColorStop(1, "#4fd8ff");
  g.fillStyle = gr; g.fillRect(0, 40, 1024, 18); g.fillRect(0, 320, 1024, 10);
  g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 6; for (let x = 0; x < 1024; x += 128) { g.beginPath(); g.moveTo(x, 70); g.lineTo(x, 310); g.stroke(); }
});
const panelMaquina = () => ctex("panel303", 1024, 512, (g) => {
  g.fillStyle = "#c9ced6"; g.fillRect(0, 0, 1024, 512);
  g.fillStyle = "#2c2f36"; g.fillRect(30, 30, 964, 210);
  g.fillStyle = "#f1f2f4"; g.fillRect(30, 262, 964, 26);
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 4 === 0 ? "#f2f2f2" : "#3b3f47"; g.fillRect(40 + i * 60, 320, 50, 150); g.strokeStyle = "#141018"; g.lineWidth = 4; g.strokeRect(40 + i * 60, 320, 50, 150); }
});
// tarjetas planas de efectos
const guitarra = (col: string) => (p: Pen) => { // 256 x 512, colgada de la pared
  p.poly([[118, 20], [138, 20], [138, 300], [118, 300]], "#c9a06b", 4);
  p.poly([[104, 0], [152, 0], [152, 50], [104, 50]], "#2a2220", 4);
  p.poly([[60, 290], [40, 360], [70, 420], [50, 470], [128, 505], [206, 470], [186, 420], [216, 360], [196, 290], [128, 300]], col, 6);
  p.poly([[96, 380], [160, 380], [160, 396], [96, 396]], "#eee", 3);
  p.ell(128, 440, 10, 10, "#222", 0);
};
/** haz de foco pintado (256 x 512): trapecio que se desvanece hacia abajo */
const hazDraw = (r: number, g0: number, b: number) => (p: Pen) => {
  const g = p.g, gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, `rgba(${r},${g0},${b},0.55)`); gr.addColorStop(1, `rgba(${r},${g0},${b},0.05)`);
  g.fillStyle = gr; g.beginPath(); g.moveTo(108, 0); g.lineTo(148, 0); g.lineTo(256, 512); g.lineTo(0, 512); g.closePath(); g.fill();
};
const charco = (col: string) => (p: Pen) => { // 256 x 256 resplandor en el suelo
  const g = p.g, gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
};

const paredSucia = () => ctex("paredSucia", 1024, 512, (g, r) => {
  g.fillStyle = "#9c8c76"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(${r() > 0.6 ? "60,50,40" : "200,190,170"},0.07)`; g.beginPath(); g.ellipse(r() * 1024, r() * 512, 20 + r() * 70, 10 + r() * 40, 0, 0, 7); g.fill(); }
  for (let i = 0; i < 8; i++) { g.fillStyle = "rgba(70,55,40,0.12)"; g.fillRect(r() * 1024, 0, 6 + r() * 10, 512); }
});
const paredMuseo = () => ctex("paredMuseo", 1024, 512, (g, r) => {
  g.fillStyle = "#26304a"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 80; i++) { g.fillStyle = "rgba(255,255,255,0.03)"; g.beginPath(); g.ellipse(r() * 1024, r() * 512, 40 + r() * 80, 20 + r() * 40, 0, 0, 7); g.fill(); }
  g.fillStyle = "#1a2236"; g.fillRect(0, 420, 1024, 92);
});
const cuadro = (k: number) => ctex("cuadro" + k, 256, 340, (g) => {
  g.fillStyle = k ? "#e0a43a" : "#4f7cc4"; g.fillRect(0, 0, 256, 340);
  g.fillStyle = k ? "#c2452f" : "#f1d06a"; g.beginPath(); g.arc(128, 150, 70, 0, 7); g.fill();
  g.fillStyle = "#1d1630"; g.fillRect(40, 260, 176, 20);
});
const FUENTE = "900 150px Montserrat, Arial Black, sans-serif";
/** onomatopeya / signo grande con borde de tinta (512 x 256) */
const rotulo = (txt: string, col: string) => (p: Pen) => {
  const g = p.g, cw = txt.length <= 1 ? 256 : 512;
  g.font = txt.length <= 1 ? "900 220px Montserrat, Arial Black, sans-serif" : FUENTE; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = 26; g.strokeStyle = "#120c18"; g.strokeText(txt, cw / 2, 134); g.fillStyle = col; g.fillText(txt, cw / 2, 134);
};
/** onda de sonido de neón (512 x 192) */
const ondaDraw = (col: string, fase: number) => (p: Pen) => {
  const g = p.g, pts: [number, number][] = [];
  for (let x = 10; x <= 502; x += 6) { const u = (x - 10) / 492, env = Math.sin(Math.PI * u); pts.push([x, 96 + env * 62 * (Math.sin(x * 0.045 + fase) + 0.45 * Math.sin(x * 0.12 - fase * 1.7))]); }
  g.lineCap = "round"; g.lineJoin = "round";
  for (const [w, c] of [[22, "#120c18"], [12, col], [4, "#ffffff"]] as const) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
};
/** el pato enfadado (256 x 256), dos fotogramas de aleteo */
const pato = (k: number) => (p: Pen) => {
  p.ell(118, 150, 70, 52, "#ffd23f", 6); p.ell(168, 92, 40, 38, "#ffd23f", 6);
  p.poly([[198, 88], [248, 98], [198, 112]], "#ff8a1f", 5);
  p.ell(176, 84, 7, 7, "#120c18", 0); p.stroke([[156, 66], [190, 76]], 7, "#120c18");
  p.poly(k ? [[80, 130], [150, 70], [160, 140]] : [[80, 150], [150, 200], [160, 150]], "#f5c230", 5);
};
/** manual abierto lleno de signos que no se entienden (512 x 384) */
const manualDraw = (p: Pen) => {
  p.poly([[10, 40], [250, 20], [256, 360], [16, 370]], "#fbf6e6", 6); p.poly([[256, 20], [500, 40], [494, 370], [256, 360]], "#f2ecd8", 6);
  const g = p.g; g.strokeStyle = "#3a3040"; g.lineWidth = 6; g.lineCap = "round";
  for (let r = 0; r < 9; r++) for (const x0 of [40, 290]) { let x = x0; while (x < x0 + 180) { const w = 10 + ((x * 7 + r * 13) % 22); g.beginPath(); g.moveTo(x, 70 + r * 32); g.lineTo(x + w, 70 + r * 32 + ((x + r) % 3 - 1) * 6); g.stroke(); x += w + 12; } }
};
/** etiqueta de precio (384 x 256): tachón progresivo y texto extra */
const etiqueta = (txt: string, tach: number, extra: string, col = "#3a2d20") => (p: Pen) => {
  const g = p.g;
  p.poly([[40, 30], [344, 30], [344, 226], [40, 226]], "#fff4c9", 8);
  p.ell(70, 60, 12, 12, "#c9b07a", 4);
  g.font = "900 96px Montserrat, Arial Black, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(txt, 200, extra ? 105 : 130);
  if (tach > 0) p.stroke([[80, 108], [80 + 240 * tach, 100]], 16, "#d0302a");
  if (extra) { g.font = "900 64px Montserrat, Arial Black, sans-serif"; g.fillStyle = "#d0302a"; g.fillText(extra, 196, 186); }
};

// ---------------- la máquina en 3D ----------------
class Maquina {
  g = new THREE.Group(); knobs: THREE.Mesh[] = []; keys: THREE.Mesh[] = []; led: THREE.Mesh;
  private keyOn = glow(2.6, 0.5, 0.25); private keyOff: THREE.Material[];
  constructor(parent: THREE.Object3D, s = 1) {
    const W = 0.72 * s, D = 0.36 * s, H = 0.09 * s;
    const top = lam({ map: panelMaquina(), color: "#ffffff" }), side = lam({ color: "#9aa1ab" });
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [side, side, top, side, side, side]);
    body.position.y = H / 2; body.castShadow = true; body.receiveShadow = true; this.g.add(body);
    const knobM = lam({ color: "#e6e8ec" });
    for (let i = 0; i < 7; i++) {
      const k = new THREE.Mesh(new THREE.CylinderGeometry(0.026 * s, 0.03 * s, 0.035 * s, 20), knobM);
      k.position.set(-W / 2 + 0.075 * s + i * 0.095 * s, H + 0.017 * s, -D / 2 + 0.085 * s); k.castShadow = true;
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.006 * s, 0.004 * s, 0.024 * s), lam({ color: "#141018" }));
      mark.position.set(0, 0.019 * s, -0.012 * s); k.add(mark);
      this.knobs.push(k); this.g.add(k);
    }
    this.keyOff = [lam({ color: "#f2f2f2" }), lam({ color: "#3b3f47" })];
    for (let i = 0; i < 16; i++) {
      const k = new THREE.Mesh(new THREE.BoxGeometry(0.034 * s, 0.012 * s, 0.075 * s), this.keyOff[i % 4 === 0 ? 0 : 1]);
      k.position.set(-W / 2 + 0.05 * s + i * 0.0415 * s, H + 0.006 * s, D / 2 - 0.08 * s); this.keys.push(k); this.g.add(k);
    }
    this.led = new THREE.Mesh(new THREE.SphereGeometry(0.012 * s, 12, 8), glow(3, 0.3, 0.2));
    this.led.position.set(W / 2 - 0.04 * s, H + 0.008 * s, -D / 2 + 0.04 * s); this.g.add(this.led);
    parent.add(this.g);
  }
  pose(f: number, giro: number, vivo: boolean) {
    this.knobs.forEach((k, i) => { k.rotation.y = -2.2 + ((giro * (1 + i * 0.37) + i * 0.7) % 4.4); });
    const step = Math.floor(f / 3.5) % 16;
    this.keys.forEach((k, i) => { k.material = vivo && i === step ? this.keyOn : this.keyOff[i % 4 === 0 ? 0 : 1]; });
    (this.led.material as THREE.MeshBasicMaterial).color.setRGB(vivo && Math.floor(f / 7) % 2 === 0 ? 3 : 0.4, 0.25, 0.2);
  }
}

// ---------------- mundo ----------------
export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#000000", 20, 200);
  private sunCache = new Map<number, THREE.Vector3>();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();
  private m303: Maquina; private m303b: Maquina; private m303c: Maquina; private m303d!: Maquina; private m303e!: Maquina; private m303f!: Maquina; private m303g!: Maquina;
  private tiles: THREE.MeshBasicMaterial[] = []; private beams: THREE.Mesh[] = [];
  private kidBox: THREE.Group;
  constructor() {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 0.5);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);
    const box = (w: number, h: number, d: number, m: THREE.Material | THREE.Material[], x: number, y: number, z: number, cast = true) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = cast; b.receiveShadow = true; R.add(b); return b;
    };

    // ===== TIENDA DE MÚSICA (1981) =====
    {
      const X = SET.tienda;
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2), lam({ map: rep(planksHD(), 3, 3), color: "#d8a070" }));
      suelo.position.set(X, 0, 0); suelo.receiveShadow = true; R.add(suelo);
      const pared = lam({ map: paredTienda(), color: "#ffffff" });
      box(12, 4, 0.2, pared, X, 2, -3.2, false);
      const lado = lam({ map: rep(paredTienda(), 0.6, 1), color: "#e8d0c0" });
      box(0.2, 4, 10, lado, X - 4.2, 2, 1.5, false);
      box(0.2, 4, 10, lado, X + 4.6, 2, 1.5, false);
      // mesa y la máquina nueva
      const madera = lam({ color: "#7a4a2c" }), oscura = lam({ color: "#4a2c1c" });
      box(1.7, 0.07, 0.95, madera, X + 1.2, 0.86, -0.55);
      for (const [dx, dz] of [[-0.78, -0.4], [0.78, -0.4], [-0.78, 0.4], [0.78, 0.4]]) box(0.07, 0.83, 0.07, oscura, X + 1.2 + dx, 0.415, -0.55 + dz);
      this.m303 = new Maquina(R); this.m303.g.position.set(X + 1.2, 0.895, -0.55); this.m303.g.rotation.y = -0.12;
      // amplis y estanterías
      const ampF = lam({ map: frenteAmpli(), color: "#ffffff" }), ampL = lam({ color: "#241e20" });
      for (const [x, z, s] of [[-2.6, -2.5, 1.0], [-1.5, -2.6, 0.8], [3.4, -2.4, 1.1], [3.6, -1.2, 0.7]] as const) {
        const a = box(0.9 * s, 0.9 * s, 0.5 * s, [ampL, ampL, ampL, ampL, ampF, ampL], X + x, 0.45 * s, z); a.rotation.y = x > 0 ? -0.4 : 0.15;
      }
      box(3.2, 0.06, 0.4, madera, X - 1.6, 2.6, -2.95, false);
      for (let k = 0; k < 6; k++) box(0.34, 0.24 + hh(k) * 0.2, 0.3, lam({ color: ["#c2452f", "#2f5d9e", "#e0a43a", "#3f9a62"][k % 4] }), X - 2.9 + k * 0.52, 2.75, -2.95);
      // lámpara colgante
      const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.28, 24, 1, true), lam({ color: "#2f4a3a", side: THREE.DoubleSide }));
      lamp.position.set(X + 1.2, 2.55, -0.55); R.add(lamp);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 10), glow(4, 3, 1.6)); bulb.position.set(X + 1.2, 2.45, -0.55); bulb.layers.set(NOINK); R.add(bulb);
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4), lam({ color: "#111" })); cable.position.set(X + 1.2, 3.35, -0.55); R.add(cable);
    }

    // ===== CHICAGO DE NOCHE =====
    {
      const X = SET.chicago;
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(14, 260).rotateX(-Math.PI / 2), lam({ map: rep(asfalto(), 6, 110), color: "#ffffff" }));
      suelo.position.set(X, 0, -90); suelo.receiveShadow = true; R.add(suelo);
      const acera = lam({ color: "#5a5468" });
      box(3, 0.16, 260, acera, X - 5.5, 0.08, -90, false); box(3, 0.16, 260, acera, X + 5.5, 0.08, -90, false);
      const raya = glow(0.9, 0.75, 0.3);
      for (let z = 10; z > -200; z -= 6) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 2.6).rotateX(-Math.PI / 2), raya); m.position.set(X, 0.012, z); m.layers.set(NOINK); R.add(m); }
      let z = 12;
      for (let k = 0; z > -200; k++) {
        const w = 7 + hh(k, 1) * 6, h = 12 + hh(k, 2) * 26;
        for (const sd of [-1, 1]) {
          const hm = h * (0.7 + hh(k, sd + 5) * 0.6), d = 8;
          const fac = lam({ map: fachadaNoche(k * 2 + (sd > 0 ? 1 : 0), w, hm), color: "#ffffff" }), dark = lam({ color: "#241e34" });
          const mats = sd < 0 ? [fac, dark, dark, dark, dark, dark] : [dark, fac, dark, dark, dark, dark];
          box(d, hm, w, mats, X + sd * (7 + d / 2), hm / 2, z - w / 2, false);
          // cornisa
          box(d + 0.4, 0.5, w + 0.2, lam({ color: "#3a3048" }), X + sd * (7 + d / 2), hm + 0.25, z - w / 2, false);
        }
        z -= w + 0.4;
      }
      // farolas
      const poste = lam({ color: "#20202a" });
      for (let k = 0; k < 9; k++) for (const sd of [-1, 1]) {
        const zz = 6 - k * 14 - (sd > 0 ? 7 : 0), xx = X + sd * 5.2;
        box(0.14, 5, 0.14, poste, xx, 2.5, zz, false);
        box(1.2, 0.1, 0.12, poste, xx - sd * 0.55, 5, zz, false);
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), glow(4, 3.2, 1.6)); b.position.set(xx - sd * 1.1, 4.85, zz); b.layers.set(NOINK); R.add(b);
      }
      // la luna
      const luna = new THREE.Mesh(new THREE.CircleGeometry(16, 48), glow(2.2, 2.1, 1.8)); luna.position.set(X + 60, 150, -500); luna.lookAt(X, 0, 30); luna.layers.set(NOINK); R.add(luna);
      // la caja que llevan los chavales
      this.kidBox = new THREE.Group(); R.add(this.kidBox);
      this.m303b = new Maquina(this.kidBox, 0.9);
    }

    // ===== CLUB (1987) =====
    {
      const X = SET.club;
      const negro = lam({ color: "#1a1424" });
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(30, 40).rotateX(-Math.PI / 2), negro); suelo.position.set(X, 0, 0); suelo.receiveShadow = true; R.add(suelo);
      // pista: baldosas que laten
      for (let i = 0; i < 10; i++) for (let j = 0; j < 12; j++) {
        const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.1, 0.05, 0.15) }); this.tiles.push(m);
        const t = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 1.12).rotateX(-Math.PI / 2), m);
        t.position.set(X - 5.4 + i * 1.2, 0.01, -3.6 + j * 1.2); t.layers.set(NOINK); R.add(t);
      }
      const pc = lam({ map: rep(paredClub(), 3, 1), color: "#ffffff" });
      box(30, 9, 0.3, pc, X, 4.5, -8, false); box(0.3, 9, 40, pc, X - 9, 4.5, 6, false); box(0.3, 9, 40, pc, X + 9, 4.5, 6, false);
      // tiras de neón en las paredes
      for (const [c, y] of [[[0.5, 3, 0.4], 3.2], [[3, 0.4, 2.4], 5.4]] as const) {
        const n = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.08, 0.08), glow(c[0], c[1], c[2])); n.position.set(X, y, -7.8); n.layers.set(NOINK); R.add(n);
        for (const sd of [-1, 1]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 30), glow(c[0], c[1], c[2])); s.position.set(X + sd * 8.8, y, 7); s.layers.set(NOINK); R.add(s); }
      }
      // cabina del DJ
      const cab = lam({ map: frenteCabina(), color: "#ffffff" }), cabL = lam({ color: "#2a1a40" });
      box(3.4, 1.12, 1.1, [cabL, cabL, cabL, cabL, cab, cabL], X, 0.56, -5.2);
      box(3.6, 0.06, 1.25, lam({ color: "#0e0a14" }), X, 1.15, -5.2);
      this.m303c = new Maquina(R, 0.85); this.m303c.g.position.set(X + 0.5, 1.18, -5.1); this.m303c.g.rotation.y = 0.15;
      const plato = lam({ color: "#26222c" });
      for (const dx of [-1.15, -0.45]) { const p = box(0.55, 0.08, 0.45, plato, X + dx, 1.22, -5.15); p.castShadow = false; const v = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.012, 32), lam({ color: "#0a0a0e" })); v.position.set(X + dx, 1.27, -5.15); R.add(v); }
      // altavoces
      const altF = lam({ map: frenteAltavoz(), color: "#ffffff" }), altL = lam({ color: "#141018" });
      for (const sd of [-1, 1]) for (const y of [1.25, 3.6]) box(1.4, 2.4, 1.0, [altL, altL, altL, altL, altF, altL], X + sd * 3.4, y, -5.6);
      // haces de luz desde el techo
      for (let k = 0; k < 6; k++) {
        const geo = new THREE.ConeGeometry(1.4, 9, 24, 1, true); geo.translate(0, -4.5, 0);
        const col = geo.attributes.position, cs: number[] = [];
        for (let i = 0; i < col.count; i++) { const a = (col.getY(i) + 9) / 9; cs.push(a, a, a); }
        geo.setAttribute("color", new THREE.Float32BufferAttribute(cs, 3));
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
        m.position.set(X - 6 + k * 2.4, 8.6, -6.5); m.layers.set(NOINK); m.renderOrder = 6; this.beams.push(m); R.add(m);
      }
    }

    // ===== TIENDA DE SEGUNDA MANO (1984) =====
    {
      const X = SET.saldo;
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(12, 12).rotateX(-Math.PI / 2), lam({ map: rep(planksHD(), 3, 3), color: "#9a8a78" }));
      suelo.position.set(X, 0, 0); suelo.receiveShadow = true; R.add(suelo);
      box(10, 4.5, 0.2, lam({ map: paredSucia(), color: "#ffffff" }), X, 2.25, -2.4, false);
      box(0.2, 4.5, 8, lam({ map: rep(paredSucia(), 0.7, 1), color: "#d8d0c4" }), X - 3.6, 2.25, 1.5, false);
      const est = lam({ color: "#6e4a2e" }), estO = lam({ color: "#4a3020" });
      for (const y of [0.45, 1.42, 2.39, 3.3]) box(5.6, 0.06, 0.62, est, X, y, -1.95);
      for (const x of [-2.8, -0.95, 0.95, 2.8]) box(0.07, 3.4, 0.62, estO, X + x, 1.7, -1.95);
      const cols = ["#8a6f5a", "#5f6f7a", "#7a5a6a", "#6a7a5a", "#8a7a4a", "#6a5a4a"];
      let k = 0;
      for (const y of [0.48, 1.45, 2.42]) for (let i = 0; i < 9; i++, k++) {
        const x = -2.55 + i * 0.6 + (hh(k, 1) - 0.5) * 0.1;
        if (y === 1.45 && (i === 4 || i === 5)) continue;
        const h = 0.25 + hh(k, 2) * 0.45, w = 0.32 + hh(k, 3) * 0.18;
        const b = box(w, h, 0.42, lam({ color: cols[k % cols.length] }), X + x, y + h / 2, -1.98); b.rotation.y = (hh(k, 4) - 0.5) * 0.2;
      }
      this.m303d = new Maquina(R, 0.9); this.m303d.g.position.set(X + 0.02, 1.45, -1.92); this.m303d.g.rotation.y = 0.08;
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), glow(2.6, 2.2, 1.6)); lamp.position.set(X + 0.5, 3.9, 0.2); lamp.layers.set(NOINK); R.add(lamp);
    }

    // ===== EL MISTERIO: la máquina sola bajo un foco =====
    {
      const X = SET.misterio;
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), lam({ color: "#09080f" })); suelo.position.set(X, 0, 0); suelo.receiveShadow = true; R.add(suelo);
      box(0.9, 0.95, 0.9, lam({ color: "#7a7890" }), X, 0.475, 0);
      this.m303e = new Maquina(R, 1.0); this.m303e.g.position.set(X, 0.95, 0.02);
      const geo = new THREE.ConeGeometry(1.7, 7, 32, 1, true); geo.translate(0, -3.5, 0);
      const pos = geo.attributes.position, cs: number[] = [];
      for (let i = 0; i < pos.count; i++) { const a = 0.15 + 0.85 * (pos.getY(i) + 7) / 7; cs.push(a * 0.8, a * 0.85, a); }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(cs, 3));
      const haz = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      haz.position.set(X, 7.0, 0); haz.layers.set(NOINK); haz.renderOrder = 6; haz.visible = false; void R;
      const disco = new THREE.Mesh(new THREE.CircleGeometry(1.75, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.32, 0.33, 0.42), fog: false }));
      disco.position.set(X, 0.01, 0); disco.layers.set(NOINK); R.add(disco);
    }

    // ===== EL SÓTANO DE CHICAGO: giran las ruedas =====
    {
      const X = SET.sotano;
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(12, 12).rotateX(-Math.PI / 2), lam({ color: "#3a3040" })); suelo.position.set(X, 0, 0); suelo.receiveShadow = true; R.add(suelo);
      const lad = lam({ map: rep(brick(), 4, 2), color: "#a080a0" });
      box(10, 4, 0.2, lad, X, 2, -2.2, false); box(0.2, 4, 8, lad, X - 3, 2, 1.5, false); box(0.2, 4, 8, lad, X + 3, 2, 1.5, false);
      const madera = lam({ color: "#5a3a2a" });
      box(1.6, 0.07, 0.8, madera, X, 0.86, -0.1);
      for (const [dx, dz] of [[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]]) box(0.07, 0.83, 0.07, madera, X + dx, 0.415, -0.1 + dz);
      this.m303f = new Maquina(R, 1.0); this.m303f.g.position.set(X, 0.895, -0.08);
      for (const [x, z, s] of [[-2.2, -1.7, 1.1], [2.2, -1.6, 0.9]] as const) box(0.8 * s, 1.2 * s, 0.6 * s, [lam({ color: "#141018" }), lam({ color: "#141018" }), lam({ color: "#141018" }), lam({ color: "#141018" }), lam({ map: frenteAltavoz(), color: "#ffffff" }), lam({ color: "#141018" })], X + x, 0.6 * s, z);
      for (const [c, x] of [[[0.4, 2.6, 0.5], -1.2], [[2.6, 0.4, 2.0], 1.2]] as const) { const n = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.06), glow(c[0], c[1], c[2])); n.position.set(X + x, 3.1, -2.05); n.layers.set(NOINK); R.add(n); }
    }

    // ===== HOY: la vitrina del coleccionista =====
    {
      const X = SET.museo;
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2), lam({ color: "#2a3044" })); suelo.position.set(X, 0, 0); suelo.receiveShadow = true; R.add(suelo);
      box(14, 5, 0.2, lam({ map: paredMuseo(), color: "#ffffff" }), X, 2.5, -2.6, false);
      box(0.9, 1.05, 0.9, lam({ color: "#ece6da" }), X, 0.525, 0);
      box(1.0, 0.05, 1.0, lam({ color: "#f8f4ec" }), X, 1.075, 0);
      this.m303g = new Maquina(R, 0.95); this.m303g.g.position.set(X, 1.1, 0.02); this.m303g.g.rotation.y = -0.1;
      const vidrio = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.62, 0.98), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.7, 0.85), transparent: true, opacity: 0.12, depthWrite: false }));
      vidrio.position.set(X, 1.41, 0); vidrio.renderOrder = 7; R.add(vidrio);
      const borde = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.98, 0.62, 0.98)), new THREE.LineBasicMaterial({ color: "#e8f4ff" }));
      borde.position.copy(vidrio.position); borde.layers.set(NOINK); R.add(borde);
      const geo = new THREE.ConeGeometry(1.2, 5, 32, 1, true); geo.translate(0, -2.5, 0);
      const pos = geo.attributes.position, cs: number[] = [];
      for (let i = 0; i < pos.count; i++) { const a = 0.1 + 0.9 * (pos.getY(i) + 5) / 5; cs.push(a, a * 0.92, a * 0.75); }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(cs, 3));
      const haz = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      haz.visible = false;
      for (const x of [-4, 4]) { const c = box(1.4, 1.8, 0.08, lam({ color: "#c9a06b" }), X + x, 2.4, -2.45, false); void c; box(1.2, 1.6, 0.1, lam({ map: cuadro(x > 0 ? 1 : 0), color: "#ffffff" }), X + x, 2.4, -2.4, false); }
    }
  }
  /** sol relativo a la cámara, fijo por toma */
  private shotSun(id: number) {
    let v = this.sunCache.get(id);
    if (v) return v;
    const s = SHOTS[id - 1], L = PRESET[s.luz];
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) { const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(s.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const S = SHOTS[id - 1], L = PRESET[S.luz], K = SKY[S.luz], t = f / FPS;
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 1200; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const focus = V(...c.look), dist = cam.position.distanceTo(focus), sunDir = this.shotSun(id);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.2 + 6, 8, 40);
    this.sun.position.copy(focus).addScaledVector(sunDir, 100); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 5; sc.far = 260; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce);
    TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color);
    if (S.luz === "noche") { this.fog.near = 30; this.fog.far = 220; } else { this.fog.near = 12; this.fog.far = 60; }
    scene.fog = this.fog; scene.background = null;

    // ---- animación del mundo ----
    const pl = pulse(f), bt = beatAt(f);
    this.m303.pose(f, t * 0.4, f > 20);
    this.m303c.pose(f, t * 3.2, true);
    const kz = kidsZ(f);
    this.kidBox.position.set(SET.chicago + 0.05, 1.02, kz + 0.42); this.kidBox.rotation.set(0.25, 0.05, 0);
    this.m303b.pose(f, 0, false);
    this.m303d.pose(f, 0, false); this.m303e.pose(f, 0, false); this.m303f.pose(f, t * 3.8, true); this.m303g.pose(f, 0.4, true);
    const enDesastre = S.key === "desastre"; if (enDesastre) this.m303.pose(f, t * 5, true);
    const COLS = [[0.2, 1.6, 0.3], [1.6, 0.2, 1.2], [0.2, 1.0, 1.6], [1.6, 1.2, 0.2]];
    this.tiles.forEach((m, k) => {
      const i = Math.floor(k / 12), j = k % 12, on = (Math.floor(bt) + i + j * 2) % 4 === 0;
      const cc = COLS[(i + j + Math.floor(bt / 4)) % 4], a = on ? 0.35 + 0.65 * pl : 0.06;
      m.color.setRGB(cc[0] * a + 0.04, cc[1] * a + 0.02, cc[2] * a + 0.06);
    });
    this.beams.forEach((b, k) => {
      b.rotation.set(0.35 * Math.sin(t * 0.9 + k * 1.3) + 0.25, 0, 0.45 * Math.sin(t * 0.7 + k * 2.1));
      const cc = COLS[(k + Math.floor(bt / 2)) % 4];
      (b.material as THREE.MeshBasicMaterial).color.setRGB(cc[0] * 0.6, cc[1] * 0.6, cc[2] * 0.6);
    });

    // ---- reparto ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const light = light2D(sunDir, right);
    const st: Stage = { places: [], fx: [] };
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const lidAt = (i: number) => {
      let s = Math.round(-60 * hh(i, 9));
      for (let n = 0; s <= f && n < 80; n++) { const k = f - s; if (k >= 0 && k < 4) return [0.5, 1, 1, 0.5][k]; s += Math.round(15 + 54 * hh(i * 31 + n, 13)); }
      return 0;
    };
    const visible = (x: number, y: number, z: number, r: number) => this.frustum.intersectsSphere(this.sph.set(this.v.set(x, y, z), r));
    const person = (who: string, o: Outfit, x: number, y: number, z: number, opts: Parameters<typeof bodyFront>[2], i: number, contact = true) => {
      if (!visible(x, y + 1.1, z, 2.5)) return;
      const d = cam.position.distanceTo(this.v.set(x, y + 1.2, z));
      if (d < 1.7) return;
      const [w, h, k] = tier(d), near = d < 16;
      const o2 = { ...opts, light, seed: (i * 5 + 3) % 7 + 1, blink: near ? lidAt(i) : 0 };
      st.places.push({ key: `${who}|${JSON.stringify(o2)}`, x, y, z, size: [w, h, k], draw: (p) => bodyFront(p, o, o2) });
      if (contact && d < 40) blob(st, sunDir, x, Math.max(0, y - 0.0), z);
    };
    const u = uOf(id, f);
    const fx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, extra: Partial<{ flat: boolean; soft: boolean; rot: number }> = {}) =>
      st.fx.push({ key, cw, ch, draw, x, y, z, w, h, ...extra });
    const onda = (k: number, x: number, y: number, z: number, w: number, h: number, col: string, vel = 1) =>
      fx(`onda|${col}|${Math.floor(f * vel) % 24}|${k}`, 512, 192, ondaDraw(col, (Math.floor(f * vel) % 24) / 24 * Math.PI * 2 + k), x, y, z, w, h);
    const tienda = SET.tienda;
    const guitarras = () => {
      for (const [k, x, col] of [[0, -2.2, "#d8432f"], [1, -0.9, "#3d6fb6"], [2, 0.5, "#f0b43c"], [3, 2.6, "#2b8a5a"]] as const)
        fx(`guit|${k}`, 256, 512, guitarra(col), tienda + x, 1.75, -3.05, 0.55, 1.1);
      fx("charcoT", 256, 256, charco("rgba(255,200,120,0.55)"), tienda + 1.2, 0.02, -0.4, 3.4, 3.0, { flat: true, soft: true });
    };
    switch (S.key) {
      case "tienda": {
        person("guit", GUITARRISTA, tienda + 0.3, 0, -0.1, { mode: "stand", expr: u > 0.55 ? "shock" : "smile", facing: 0, look: 1 }, 1);
        person("vend", VENDEDOR, tienda + 2.55, 0, -1.6, { mode: "stand", expr: "grin", facing: 0, look: -1 }, 2);
        guitarras(); break;
      }
      case "desastre": {
        person("guit", GUITARRISTA, tienda + 0.3, 0, -0.1, { mode: "stand", expr: u < 0.3 ? "shock" : "pained", facing: 0, look: 1, headTilt: Math.round(Math.sin(f / 3)) * 4 }, 1);
        person("vend", VENDEDOR, tienda + 2.55, 0, -1.6, { mode: "stand", expr: "nervous", facing: 0, look: -1 }, 2);
        guitarras();
        ["#7dff6a", "#ff4fd8", "#4fd8ff"].forEach((c, k) => onda(k, tienda + 1.25 + k * 0.08, 1.25 + k * 0.22, -0.45, 1.5, 0.56, c, 1.6));
        const pop = smooth((u - 0.02) / 0.08);
        if (pop > 0) fx("niic", 512, 256, rotulo("¡ÑIIIC!", "#ff4fd8"), tienda + 1.25, 2.05, -0.4, 0.8 * pop, 0.4 * pop);
        const q = clamp01((u - 0.55) / 0.4);
        if (q > 0) {
          fx(`pato|${Math.floor(f / 4) % 2}`, 256, 256, pato(Math.floor(f / 4) % 2), tienda + 1.2 - q * 1.5, 1.05 + Math.sin(q * Math.PI) * 0.75 + q * 0.3, -0.3, 0.55, 0.55);
          if (q > 0.3) fx("cuac", 512, 256, rotulo("¡CUAC!", "#ffd23f"), tienda + 0.25, 2.2, -0.2, 0.6, 0.3);
        }
        break;
      }
      case "manual": {
        person("cli", CLIENTE, tienda + 2.25, 0, -0.95, { mode: "stand", expr: "nervous", facing: 0, look: -1, headTilt: 6 }, 3);
        guitarras();
        fx("manual", 512, 384, manualDraw, tienda + 2.12, 1.15, -0.62, 0.62, 0.46);
        for (let k = 0; k < 3; k++) {
          const ph = ((f + k * 17) % 51) / 51;
          fx("interr", 256, 256, rotulo("?", "#ffe14d"), tienda + 1.95 + k * 0.28, 2.05 + ph * 0.5, -0.9, 0.32 + ph * 0.2, 0.32 + ph * 0.2);
        }
        break;
      }
      case "saldo": {
        const X = SET.saldo;
        const tach = smooth((u - 0.45) / 0.12), sal = smooth((u - 0.62) / 0.1);
        fx(`etq|${Math.round(tach * 6)}|${sal > 0.5}`, 384, 256, etiqueta("395 $", tach, sal > 0.5 ? "SALDO" : ""), X + 0.25, 1.72, -1.7, 0.34, 0.23);
        for (let k = 0; k < 26; k++) {
          const y = ((hh(k, 4) * 3 + t * (0.05 + hh(k, 5) * 0.08)) % 3), x = X - 2 + hh(k, 6) * 4, z = -1.8 + hh(k, 7) * 3;
          fx("polvo", 64, 64, charco("rgba(255,240,210,0.8)"), x, 0.2 + y, z, 0.035, 0.035, { soft: true });
        }
        break;
      }
      case "misterio": {
        const X = SET.misterio, pop = smooth((u - 0.5) / 0.15);
        fx("charcoM", 256, 256, charco("rgba(200,210,255,0.6)"), X, 0.02, 0.1, 3.6, 3.0, { flat: true, soft: true });
        if (pop > 0) fx("interrG", 256, 256, rotulo("?", "#ffe14d"), X, 1.85 + Math.sin(f / 12) * 0.04, 0, 0.55 * pop, 0.55 * pop);
        break;
      }
      case "chicago": {
        const X = SET.chicago, ph = gait(t, 1.0);
        const exprs: Expr[] = ["grin", "laugh", "smile"];
        CHAVALES.forEach((o, k) => person(`kid${k}`, o, X - 0.75 + k * 0.75, 0, kz - (k === 1 ? 0 : 0.3), { mode: "march", phase: (ph + k * 0.33) % 1, expr: exprs[k], facing: 0, lift: 40 }, 10 + k));
        for (let k = 0; k < 9; k++) for (const sd of [-1, 1]) {
          const zz = 6 - k * 14 - (sd > 0 ? 7 : 0);
          fx("charcoN", 256, 256, charco("rgba(255,200,110,0.5)"), X + sd * 5.2 - sd * 1.1, 0.03, zz, 5, 5, { flat: true, soft: true });
        }
        break;
      }
      case "ruedas": {
        const X = SET.sotano;
        const exprs: Expr[] = ["grin", "shock", "laugh"];
        CHAVALES.forEach((o, k) => person(`kidS${k}`, o, X - 0.8 + k * 0.8, 0, -0.95 - (k === 1 ? 0.15 : 0), { mode: "stand", expr: exprs[k], facing: 0, look: k === 0 ? 1 : k === 2 ? -1 : 0, headTilt: Math.round(Math.sin(beatAt(f) * Math.PI + k) * 2) * 3 }, 20 + k));
        ["#7dff6a", "#ff4fd8", "#4fd8ff", "#ffe14d"].forEach((c, k) => onda(k + 5, X + (k - 1.5) * 0.25, 1.45 + k * 0.28, -0.55, 2.4, 0.7, c, 0.8));
        break;
      }
      case "club": {
        const X = SET.club;
        person("dj", DJ, X + 0.3, 0.35, -5.75, { mode: "stand", expr: "grin", facing: 0, wave: Math.sin(bt * Math.PI) }, 30, false);
        const r = rng(7);
        for (let i = 0; i < 46; i++) {
          const x = X - 6 + (i % 9) * 1.45 + (r() - 0.5) * 0.6, z = -3.4 + Math.floor(i / 9) * 1.5 + (r() - 0.5) * 0.5;
          const sal = Math.abs(Math.sin(Math.PI * (bt + hh(i, 3) * 0.3))) * 0.1;
          const ex: Expr = (["laugh", "grin", "shout", "smile_closed"] as Expr[])[i % 4];
          person(`b${i}`, bailarin(i), x, sal, z, { mode: "stand", expr: ex, facing: 0, wave: i % 2 ? Math.round(Math.sin(bt * Math.PI + i) * 2) / 2 : undefined, headTilt: Math.round(Math.sin(bt * Math.PI) * 2) * 3 }, 40 + i);
        }
        break;
      }
      case "remate": {
        const X = SET.museo, sube = clamp01((u - 0.3) / 0.6), n = Math.min(4, Math.floor(sube * 4.99));
        person("col1", COLECC[0], X - 0.78, 0, 0.75, { mode: "stand", expr: n >= 2 ? "shock" : "smile", facing: 0, look: 1 }, 50);
        person("col2", COLECC[1], X + 0.78, 0, 0.75, { mode: "stand", expr: n >= 3 ? "shock" : "grin", facing: 0, look: -1 }, 51);
        fx("hazMu", 256, 512, hazDraw(255, 236, 190), X, 2.7, -0.3, 2.2, 5.4, { soft: true });
        const txt = ["395 $", "×2", "×3", "×4", "×5"][n];
        fx(`etqM|${n}`, 384, 256, etiqueta(txt, 0, "", n > 0 ? "#1f8a3a" : "#3a2d20"), X + 0.42, 1.8 + sube * 0.2, 0.45, 0.34 * (1 + sube * 0.4), 0.23 * (1 + sube * 0.4));
        break;
      }
    }
    // ---- volcar a mallas ----
    let ai = 0;
    for (const p of st.places) {
      const a = this.actor(ai++), [w, h, k] = p.size, s = p.scale ?? 1;
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true; a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0);
      a.mesh.scale.set(p.mirror ? -s : s, s, s);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    for (const p of st.fx) {
      if (!visible(p.x, p.y, p.z, Math.max(p.w, p.h))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft); e.mesh.visible = true; e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else e.mesh.rotation.set(0, 0, 0);
      e.mesh.scale.set(p.w, p.h, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (let i = 0; i < ai; i++) this.actors[i].bind();
    for (let i = 0; i < fi; i++) this.fxs[i].bind();
    return focus;
  }
}
