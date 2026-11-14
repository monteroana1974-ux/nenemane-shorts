// El tío tirado en el suelo pataleando en el aire (Acid Tracks, cuarta vez): dibujo detallado para primer plano.
// Tarjeta de 1200 x 760; el suelo está en y = 700. Mismo estilo que muneco.ts: tinta gruesa, cabeza blanca con
// media luna de sombra, brazos y piernas de palito, zapatillas grandes con suela y cordones.
import { Pen } from "../motor3d/toon";

type P2 = [number, number];
const INK = "#16101c";

export type TumbadoOpts = { t: number; bpm: number; camisa?: string; estampado?: string; pantalon?: string; pelo?: string; cinta?: string; zapa?: string; raya?: string; luz?: string };

export const tumbado = (o: TumbadoOpts) => (p: Pen) => {
  const g = p.g, two = Math.PI * 2;
  const { t, bpm } = o;
  const camisa = o.camisa ?? "#d64fb4", estampado = o.estampado ?? "#ffe14a", pantalon = o.pantalon ?? "#2d3550";
  const pelo = o.pelo ?? "#2b1d1a", cinta = o.cinta ?? "#3df2ff", zapa = o.zapa ?? "#f4f1ea", raya = o.raya ?? "#ff3d8b";
  const beat = (t * bpm) / 60, ph = two * beat;          // una patada por golpe, piernas alternas
  const sacude = Math.sin(ph * 2) * 4;                     // todo el cuerpo tiembla un poco con el bombo
  const OL = 9;
  const shape = (pts: P2[], fill: string | CanvasGradient, ol = OL) => { p.path(pts, true); g.fillStyle = fill; g.fill(); if (ol) { g.lineWidth = ol; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); } };
  const elp = (cx: number, cy: number, rx: number, ry: number, rot = 0, n = 44): P2[] => {
    const c = Math.cos(rot), s = Math.sin(rot), out: P2[] = [];
    for (let i = 0; i <= n; i++) { const a = (i / n) * two, x = rx * Math.cos(a), y = ry * Math.sin(a); out.push([cx + x * c - y * s, cy + x * s + y * c]); }
    return out;
  };
  const sombra = (pts: P2[], dx: number, dy: number, alpha = 0.26) => p.clip(pts, () => {
    const [x0, y0] = pts.reduce((a, b) => [a[0] + b[0] / pts.length, a[1] + b[1] / pts.length], [0, 0]);
    const gr = g.createRadialGradient(x0 - dx, y0 - dy, 10, x0 - dx, y0 - dy, Math.hypot(dx, dy) * 3.2);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.6, "rgba(0,0,0,0)"); gr.addColorStop(1, `rgba(20,10,40,${alpha})`);
    g.fillStyle = gr; g.fillRect(0, 0, 1200, 760);
  });

  // ---------- charco de luz en el suelo y sombra de contacto ----------
  const luz = g.createRadialGradient(600, 690, 20, 600, 690, 520);
  luz.addColorStop(0, o.luz ?? "rgba(255,90,220,0.55)"); luz.addColorStop(0.5, "rgba(255,90,220,0.18)"); luz.addColorStop(1, "rgba(255,90,220,0)");
  g.fillStyle = luz; g.beginPath(); g.ellipse(600, 690, 520, 70, 0, 0, two); g.fill();
  g.fillStyle = "rgba(10,4,20,0.45)"; g.beginPath(); g.ellipse(560, 700, 330, 26, 0, 0, two); g.fill();

  // ---------- la gorra que se le ha caído, en el suelo ----------
  g.save(); g.translate(150, 676); g.rotate(-0.25);
  shape(elp(0, 0, 62, 34), "#ffe14a", 7); shape([[30, 6], [110, 16], [104, 34], [24, 24]], "#c9a81f", 6);
  g.restore();

  // ---------- piernas (detrás la izquierda) ----------
  const hip: P2 = [690, 612 + sacude];
  const pierna = (k: number) => {
    const f = ph + k * Math.PI;
    const hx = hip[0] + (k ? 36 : -6), hy = hip[1];
    const at = -0.55 + 0.42 * Math.sin(f) + k * 0.25;           // muslo: hacia arriba y a la derecha
    const kx = hx + Math.sin(at) * 150, ky = hy - Math.cos(at) * 150;
    const as = at + 0.75 + 0.75 * Math.cos(f);                  // espinilla: se dobla y se estira
    const fx = kx + Math.sin(as) * 150, fy = ky - Math.cos(as) * 150;
    // pantalón ancho (baggy) hasta la rodilla
    const nx = Math.cos(at), ny = Math.sin(at), wq = 34;
    shape([[hx - nx * wq, hy - ny * wq], [kx - nx * 26, ky - ny * 26], [kx + nx * 26, ky + ny * 26], [hx + nx * wq, hy + ny * wq]], k ? pantalon : mixc(pantalon, -0.15), 8);
    // costura
    g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 3; g.setLineDash([8, 7]); g.beginPath(); g.moveTo(hx, hy); g.lineTo(kx, ky); g.stroke(); g.setLineDash([]);
    // espinilla de palito con calcetín a rayas
    p.stroke([[kx, ky], [fx, fy]], 16);
    const sx = kx + (fx - kx) * 0.62, sy = ky + (fy - ky) * 0.62;
    p.stroke([[sx, sy], [fx, fy]], 26, "#f2f2f2"); p.stroke([[sx + (fx - sx) * 0.2, sy + (fy - sy) * 0.2], [sx + (fx - sx) * 0.38, sy + (fy - sy) * 0.38]], 26, raya);
    // zapatilla con la suela mirando al cielo
    g.save(); g.translate(fx, fy); g.rotate(as - Math.PI / 2);
    shape([[-20, -34], [70, -30], [92, -12], [90, 14], [-24, 16]], zapa, 8);                  // empeine
    shape([[-28, 12], [96, 12], [98, 30], [-30, 30]], "#ececec", 7);                         // suela
    for (let s = 0; s < 6; s++) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(-20 + s * 19, 20, 9, 6); }
    p.stroke([[6, -8], [54, -26]], 7, raya); p.stroke([[16, 2], [64, -16]], 7, raya);           // rayas laterales
    for (let s = 0; s < 3; s++) p.stroke([[-4 + s * 12, -30], [6 + s * 12, -20]], 4, INK);     // cordones
    g.restore();
    // líneas de movimiento junto al pie
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 6; g.lineCap = "round";
    const mv = Math.cos(f);
    for (let s = 0; s < 3; s++) { g.beginPath(); g.arc(fx, fy, 96 + s * 22, -Math.PI / 2 - 0.7 + mv * 0.3, -Math.PI / 2 - 0.25 + mv * 0.3); g.stroke(); }
  };
  pierna(0);

  // ---------- brazo de atrás: arriba, agitándose ----------
  const sh2: P2 = [470, 560 + sacude];
  const ag = Math.sin(ph * 2);
  const codo: P2 = [sh2[0] + 30 + ag * 12, sh2[1] - 110];
  const mano: P2 = [sh2[0] - 10 + ag * 50, sh2[1] - 230];
  p.stroke([sh2, codo, mano], 15);
  p.ell(mano[0], mano[1], 26, 24, "#ffffff", 7);
  p.stroke([[mano[0] - 8, mano[1] - 22], [mano[0] - 12, mano[1] - 46]], 9); p.stroke([[mano[0] + 10, mano[1] - 20], [mano[0] + 16, mano[1] - 44]], 9); // dedos en V
  g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 5; g.lineCap = "round";
  for (let s = 0; s < 2; s++) { g.beginPath(); g.arc(mano[0], mano[1], 52 + s * 18, Math.PI + 0.3 - ag * 0.4, Math.PI + 1.0 - ag * 0.4); g.stroke(); }
  // ---------- torso tumbado: camiseta ancha con estampado ----------
  const tor = elp(560, 612 + sacude, 190, 92, -0.04);
  shape(tor, camisa);
  p.clip(tor, () => {
    // pliegues de la camiseta holgada
    g.strokeStyle = "rgba(0,0,0,0.18)"; g.lineWidth = 5;
    for (let s = 0; s < 4; s++) { g.beginPath(); g.moveTo(430 + s * 70, 540); g.quadraticCurveTo(450 + s * 70, 600, 430 + s * 70, 680); g.stroke(); }
    // carita sonriente (estampado)
    const ex = 575, ey = 600 + sacude;
    p.ell(ex, ey, 46, 46, estampado, 6); p.ell(ex - 15, ey - 12, 5, 9, INK, 0); p.ell(ex + 15, ey - 12, 5, 9, INK, 0); p.arc(ex, ey + 2, 26, 22, 20, 160, 6);
    // cinturilla del pantalón
    shape([[720, 520], [780, 520], [780, 720], [720, 720]], pantalon, 0);
    g.fillStyle = "#3a2a20"; g.fillRect(722, 520, 16, 200);
  });
  sombra(tor, -40, -30, 0.32);
  p.poly(tor, null, OL);
  // cordón con silbato (clásico de las fiestas acid)
  g.strokeStyle = "#ff8a3d"; g.lineWidth = 5; g.beginPath(); g.moveTo(400, 560 + sacude); g.quadraticCurveTo(470, 640 + sacude, 520, 618 + sacude); g.stroke();
  shape([[512, 604 + sacude], [556, 600 + sacude], [560, 626 + sacude], [516, 632 + sacude]], "#d9dce2", 5); p.dot(548, 614 + sacude, 7, INK);
  // mancha de sudor en la camiseta
  g.fillStyle = "rgba(0,0,0,0.12)"; g.beginPath(); g.ellipse(500, 590 + sacude, 40, 22, 0.2, 0, two); g.fill();

  pierna(1);
  // ---------- brazo de delante: golpea el suelo al ritmo ----------
  const sh: P2 = [470, 652 + sacude];
  const golpe = Math.max(0, Math.sin(ph));
  const manoSuelo: P2 = [650, 708 - 90 * (1 - golpe)];
  const codoS: P2 = [565, 692 - 46 * (1 - golpe)];
  p.stroke([sh, codoS, manoSuelo], 15);
  { const dx = manoSuelo[0] - codoS[0], dy = manoSuelo[1] - codoS[1], n = Math.hypot(dx, dy), bx = codoS[0] + dx * 0.72, by = codoS[1] + dy * 0.72;
    g.save(); g.translate(bx, by); g.rotate(Math.atan2(dy, dx)); shape([[-10, -16], [10, -16], [10, 16], [-10, 16]], "#c6ff3d", 5); g.restore(); void n; }
  p.ell(manoSuelo[0] + 8, manoSuelo[1] - 6, 24, 20, "#ffffff", 7);
  if (golpe > 0.85) { // polvo y estrellitas del golpe
    for (let s = 0; s < 5; s++) { const a = Math.PI + (s / 4) * Math.PI; p.stroke([[manoSuelo[0] + Math.cos(a) * 34, manoSuelo[1] + Math.sin(a) * 20], [manoSuelo[0] + Math.cos(a) * 60, manoSuelo[1] + Math.sin(a) * 36]], 5, "#fff6c8"); }
  }


  // ---------- cabeza, apoyada en el suelo y un poco girada hacia la cámara ----------
  const hcx = 300, hcy = 588 + sacude * 0.5, R = 124, rot = -0.32 + Math.sin(ph) * 0.06;
  g.save(); g.translate(hcx, hcy); g.rotate(rot);
  // pelo rizado por arriba (rizos) y la cabeza
  for (let s2 = 0; s2 <= 12; s2++) { const a = Math.PI * (0.98 + (s2 / 12) * 1.04); p.ell(Math.cos(a) * R * 0.96, Math.sin(a) * R * 0.92 - 4, 34, 32, pelo, 6); }
  const cab = elp(0, 0, R, R * 0.98);
  shape(cab, "#ffffff");
  p.clip(cab, () => { g.fillStyle = pelo; g.beginPath(); g.ellipse(0, -R * 0.62, R * 1.0, R * 0.5, 0, Math.PI, two); g.fill(); });
  sombra(cab, -30, -26, 0.28);
  p.poly(cab, null, OL);
  for (let s2 = 0; s2 < 5; s2++) p.arc(-60 + s2 * 30, -R * 0.86, 10, 8, 200, 340, 3, "rgba(255,255,255,0.22)");
  // cinta en la frente
  p.clip(cab, () => { shape([[-R, -R * 0.52], [R, -R * 0.52], [R, -R * 0.3], [-R, -R * 0.3]], cinta, 6); g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(-R, -R * 0.47, R * 2, 5); });
  p.poly(cab, null, OL);
  // gafas de sol subidas a la cinta
  shape([[-70, -R * 0.62], [-12, -R * 0.62], [-16, -R * 0.36], [-64, -R * 0.34]], "#141018", 6); shape([[70, -R * 0.62], [12, -R * 0.62], [16, -R * 0.36], [64, -R * 0.34]], "#141018", 6);
  p.stroke([[-12, -R * 0.58], [12, -R * 0.58]], 6); p.stroke([[-56, -R * 0.56], [-40, -R * 0.44]], 4, "rgba(255,255,255,0.55)"); p.stroke([[26, -R * 0.56], [42, -R * 0.44]], 4, "rgba(255,255,255,0.55)");
  // cara de éxtasis: ojos ^ ^ apretados, cejas arriba, boca enorme riendo con lengua, rubor y sudor
  const ey = 4, ex = 40, my = 56;
  p.arc(-ex, ey + 6, 20, 13, 200, 340, 8); p.arc(ex, ey + 6, 20, 13, 200, 340, 8);
  p.stroke([[-ex - 22, ey - 22], [-ex, ey - 32], [-ex + 20, ey - 26]], 8); p.stroke([[ex - 20, ey - 26], [ex, ey - 32], [ex + 22, ey - 22]], 8);
  const bocaA = 1 + 0.15 * Math.abs(Math.sin(ph));
  const bk: P2[] = [[-52, my - 14], [52, my - 14], [40, my + 26 * bocaA], [0, my + 42 * bocaA], [-40, my + 26 * bocaA]];
  shape(bk, "#5a1a26", 8);
  p.clip(bk, () => {
    g.fillStyle = "#ffffff"; g.fillRect(-52, my - 14, 104, 14);                                    // dientes de arriba
    g.fillStyle = "#e0566e"; g.beginPath(); g.ellipse(0, my + 36 * bocaA, 28, 18, 0, 0, two); g.fill(); // lengua
  });
  g.fillStyle = "rgba(255,120,150,0.45)"; g.beginPath(); g.ellipse(-ex - 30, my - 20, 22, 12, 0, 0, two); g.ellipse(ex + 30, my - 20, 22, 12, 0, 0, two); g.fill();
  g.restore();
  // gotas de sudor que salen volando
  for (let s = 0; s < 4; s++) {
    const q = ((beat * 0.5 + s * 0.25) % 1), a = -2.4 + s * 0.45, d = 140 + q * 110;
    const x = hcx + Math.cos(a) * d, y = hcy + Math.sin(a) * d * 0.9;
    g.globalAlpha = 1 - q; shape([[x, y - 16], [x - 10, y + 6], [x + 10, y + 6]], "#7fd0ff", 4); p.ell(x, y + 6, 10, 10, "#7fd0ff", 0); g.globalAlpha = 1;
  }

};

const mixc = (hex: string, k: number) => {
  const v = parseInt(hex.slice(1), 16), c = [16, 8, 0].map((s) => Math.max(0, Math.min(255, Math.round(((v >> s) & 255) * (1 + k)))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
