// Objetos de la historia dibujados en 2D (tarjetas): rótulos, ondas, pato, manual, etiqueta, la máquina.
import { Pen } from "../motor3d/toon";

export const FUENTE = "900 150px Montserrat, Arial Black, sans-serif";
/** onomatopeya / signo grande con borde de tinta (512 x 256) */
export const rotulo = (txt: string, col: string) => (p: Pen) => {
  const g = p.g, cw = txt.length <= 1 ? 256 : 512;
  g.font = txt.length <= 1 ? "900 220px Montserrat, Arial Black, sans-serif" : FUENTE; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = 26; g.strokeStyle = "#120c18"; g.strokeText(txt, cw / 2, 134); g.fillStyle = col; g.fillText(txt, cw / 2, 134);
};

/** onda de sonido de neón (512 x 192) */
export const ondaDraw = (col: string, fase: number) => (p: Pen) => {
  const g = p.g, pts: [number, number][] = [];
  for (let x = 10; x <= 502; x += 6) { const u = (x - 10) / 492, env = Math.sin(Math.PI * u); pts.push([x, 96 + env * 62 * (Math.sin(x * 0.045 + fase) + 0.45 * Math.sin(x * 0.12 - fase * 1.7))]); }
  g.lineCap = "round"; g.lineJoin = "round";
  for (const [w, c] of [[22, "#120c18"], [12, col], [4, "#ffffff"]] as const) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
};

/** el pato enfadado (256 x 256), dos fotogramas de aleteo */
export const pato = (k: number) => (p: Pen) => {
  p.ell(118, 150, 70, 52, "#ffd23f", 6); p.ell(168, 92, 40, 38, "#ffd23f", 6);
  p.poly([[198, 88], [248, 98], [198, 112]], "#ff8a1f", 5);
  p.ell(176, 84, 7, 7, "#120c18", 0); p.stroke([[156, 66], [190, 76]], 7, "#120c18");
  p.poly(k ? [[80, 130], [150, 70], [160, 140]] : [[80, 150], [150, 200], [160, 150]], "#f5c230", 5);
};

/** manual abierto lleno de signos que no se entienden (512 x 384) */
export const manualDraw = (p: Pen) => {
  p.poly([[10, 40], [250, 20], [256, 360], [16, 370]], "#fbf6e6", 6); p.poly([[256, 20], [500, 40], [494, 370], [256, 360]], "#f2ecd8", 6);
  const g = p.g; g.strokeStyle = "#3a3040"; g.lineWidth = 6; g.lineCap = "round";
  for (let r = 0; r < 9; r++) for (const x0 of [40, 290]) { let x = x0; while (x < x0 + 180) { const w = 10 + ((x * 7 + r * 13) % 22); g.beginPath(); g.moveTo(x, 70 + r * 32); g.lineTo(x + w, 70 + r * 32 + ((x + r) % 3 - 1) * 6); g.stroke(); x += w + 12; } }
};

/** etiqueta de precio (384 x 256): tachón progresivo y texto extra */
export const etiqueta = (txt: string, tach: number, extra: string, col = "#3a2d20") => (p: Pen) => {
  const g = p.g;
  p.poly([[40, 30], [344, 30], [344, 226], [40, 226]], "#fff4c9", 8);
  p.ell(70, 60, 12, 12, "#c9b07a", 4);
  g.font = "900 96px Montserrat, Arial Black, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(txt, 200, extra ? 105 : 130);
  if (tach > 0) p.stroke([[80, 108], [80 + 240 * tach, 100]], 16, "#d0302a");
  if (extra) { g.font = "900 64px Montserrat, Arial Black, sans-serif"; g.fillStyle = "#d0302a"; g.fillText(extra, 196, 186); }
};

/** la máquina dibujada en 2D (512 x 200), ruedas que giran */
export const maquina = (giro: number, paso: number) => (p: Pen) => {
  // caja de ritmos genérica (sin marca ni modelo), 512 x 240: panel metálico, ruedas, teclado de pasos con luces
  const g = p.g, INK = "#120c18";
  const rr = (x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient, lw = 5) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
  // grosor frontal (sensación de volumen)
  const fr = g.createLinearGradient(0, 196, 0, 232); fr.addColorStop(0, "#b8bec8"); fr.addColorStop(1, "#6d737d");
  rr(10, 150, 492, 82, 14, fr, 8);
  // panel superior con brillo metálico cepillado
  const gr = g.createLinearGradient(0, 14, 0, 205); gr.addColorStop(0, "#f7f8fa"); gr.addColorStop(0.45, "#d5d9df"); gr.addColorStop(1, "#a9afb8");
  rr(10, 14, 492, 192, 14, gr, 8);
  g.save(); g.beginPath(); g.roundRect(14, 18, 484, 184, 12); g.clip();
  for (let y = 20; y < 204; y += 3) { g.fillStyle = `rgba(255,255,255,${0.05 + 0.05 * Math.sin(y * 1.7)})`; g.fillRect(14, y, 484, 1); }
  const br = g.createLinearGradient(14, 0, 498, 0); br.addColorStop(0, "rgba(255,255,255,0)"); br.addColorStop(0.35, "rgba(255,255,255,0.35)"); br.addColorStop(0.5, "rgba(255,255,255,0)"); g.fillStyle = br; g.fillRect(14, 18, 484, 184);
  g.restore();
  // líneas de panel y tornillos
  g.strokeStyle = "rgba(18,12,24,0.55)"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(20, 66); g.lineTo(492, 66); g.moveTo(20, 122); g.lineTo(492, 122); g.stroke();
  for (const [x, y] of [[26, 28], [486, 28], [26, 192], [486, 192]]) { g.fillStyle = "#8a9099"; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.stroke(); }
  // marcas de rótulos (sin letras)
  g.fillStyle = "rgba(18,12,24,0.55)";
  for (let i = 0; i < 6; i++) g.fillRect(222 + i * 46, 20, 20, 3);
  g.fillRect(40, 30, 70, 9); g.fillRect(40, 44, 44, 5);
  // rueda con anillo moleteado
  const rueda = (cx: number, cy: number, r: number, a: number) => {
    g.strokeStyle = "rgba(18,12,24,0.5)"; g.lineWidth = 2;
    for (let k = 0; k <= 10; k++) { const t = -2.4 + (4.8 * k) / 10; g.beginPath(); g.moveTo(cx + Math.sin(t) * (r + 5), cy - Math.cos(t) * (r + 5)); g.lineTo(cx + Math.sin(t) * (r + 10), cy - Math.cos(t) * (r + 10)); g.stroke(); }
    g.fillStyle = "#3a3e46"; g.beginPath(); g.arc(cx, cy + 3, r, 0, 7); g.fill();
    const kg = g.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 1, cx, cy, r); kg.addColorStop(0, "#ffffff"); kg.addColorStop(0.6, "#d8dce2"); kg.addColorStop(1, "#8e949d");
    g.fillStyle = kg; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = "rgba(18,12,24,0.35)"; g.lineWidth = 1.5;
    for (let k = 0; k < 18; k++) { const t = (k / 18) * 6.283; g.beginPath(); g.moveTo(cx + Math.cos(t) * r * 0.78, cy + Math.sin(t) * r * 0.78); g.lineTo(cx + Math.cos(t) * r * 0.95, cy + Math.sin(t) * r * 0.95); g.stroke(); }
    g.strokeStyle = INK; g.lineWidth = 4.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a) * r * 0.75, cy - Math.cos(a) * r * 0.75); g.stroke();
  };
  // fila superior: 6 ruedas pequeñas
  for (let i = 0; i < 6; i++) rueda(232 + i * 46, 40, 13, -2.2 + ((giro * (1 + i * 0.37) + i * 0.7) % 4.4));
  // fila media: 4 ruedas grandes (la segunda, selector con marcas alrededor)
  rueda(62, 94, 21, -2 + ((giro * 0.6) % 4));
  g.fillStyle = "rgba(18,12,24,0.6)"; for (let k = 0; k < 8; k++) { const t = -2.3 + k * 0.66; g.fillRect(178 + Math.sin(t) * 34 - 3, 94 - Math.cos(t) * 34 - 3, 6, 6); }
  rueda(178, 94, 21, -2.3 + 0.66 * (Math.floor(giro * 0.15) % 8));
  rueda(292, 94, 21, -0.8 + Math.sin(giro * 0.2) * 0.4);
  rueda(452, 94, 21, 0.8 + Math.sin(giro) * 0.5);
  // panel inferior
  rr(18, 126, 476, 74, 6, "#c4c6c3", 4);
  g.strokeStyle = "rgba(18,12,24,0.45)"; g.lineWidth = 2; g.beginPath(); g.moveTo(94, 128); g.lineTo(94, 198); g.moveTo(376, 128); g.lineTo(376, 198); g.moveTo(20, 160); g.lineTo(92, 160); g.stroke();
  const luzRoja = (x: number, y: number, on: boolean) => {
    if (on) { const hg = g.createRadialGradient(x, y, 0, x, y, 14); hg.addColorStop(0, "rgba(255,80,50,0.85)"); hg.addColorStop(1, "rgba(255,80,50,0)"); g.fillStyle = hg; g.fillRect(x - 14, y - 14, 28, 28); }
    g.fillStyle = on ? "#ff4a2a" : "#6a2020"; g.beginPath(); g.arc(x, y, 3.5, 0, 7); g.fill(); g.lineWidth = 1.2; g.strokeStyle = INK; g.stroke();
  };
  const tecla = (x: number, y: number, w: number, h: number, c: string, abajo = false) => {
    rr(x, y + (abajo ? 2 : 0), w, h, 3, c, 3); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x + 3, y + 3 + (abajo ? 2 : 0), w - 6, 3);
    if (!abajo) { g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(x + 3, y + h - 5, w - 6, 3); }
  };
  const st = paso >= 0 ? paso % 8 : -1, marcha = paso >= 0;
  // izquierda: botón ancho arriba + pequeño; abajo botón grande de marcha + pequeño con luz
  tecla(24, 136, 40, 16, "#8c8f94"); tecla(70, 138, 18, 12, "#3b3f47");
  tecla(24, 168, 40, 26, "#8c8f94", marcha); luzRoja(44, 164, marcha && Math.floor(paso / 2) % 2 === 0);
  tecla(70, 172, 18, 20, "#8c8f94"); luzRoja(79, 166, false);
  // centro: 5 teclas negras arriba y 8 botones de paso abajo, cada uno con su luz
  for (const b of [0, 1, 3, 4, 5]) tecla(118 + b * 33, 132, 14, 26, "#1f2126", st >= 0 && (st === b || st === b + 1) && st % 3 === 1);
  for (let k = 0; k < 8; k++) { const x = 102 + k * 33; luzRoja(x + 11, 165, st === k); tecla(x, 172, 22, 22, "#9a9da2", st === k); }
  // derecha: 4 botones con luz y 2 grandes
  for (let k = 0; k < 4; k++) { const x = 382 + k * 21; luzRoja(x + 8, 165, st >= 0 && ((st + k) % 4 === 0) && k > 1); tecla(x, 172, 16, 20, k > 1 ? "#5a5d63" : "#8c8f94"); }
  tecla(382, 136, 37, 14, "#3b3f47");
  tecla(468, 134, 22, 22, "#8c8f94"); tecla(468, 166, 22, 28, "#8c8f94", st === 7);

};

