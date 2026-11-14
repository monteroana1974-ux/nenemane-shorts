// Muñeco al estilo de los shorts de referencia: cabeza blanca grande con tinta gruesa y sombra suave,
// cejas muy expresivas, ojos pequeños, bocas con dientes; cuerpo de judía con ropa detallada (botones,
// costuras, parches, pajaritas, chalecos con cadena, sombreros con cinta); brazos y piernas de palito negro.
// Tarjeta de 600 x 1000 unidades, pies en y = 975 (igual que bodyFront, para usar el mismo motor).
import { Pen } from "../motor3d/toon";

type P2 = [number, number];
const INK = "#16101c";
const elp = (cx: number, cy: number, rx: number, ry: number, n = 48, a0 = 0, a1 = 360): P2[] => {
  const o: P2[] = [];
  for (let i = 0; i <= n; i++) { const a = ((a0 + (a1 - a0) * i / n) * Math.PI) / 180; o.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  return o;
};
const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map((s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

export type Sombrero = "nada" | "pelo" | "gorra" | "bombin" | "canotier" | "chistera" | "gorro" | "auriculares" | "melena" | "gorraAtras" | "cinta" | "cresta" | "rizos";
export type Ropa = {
  camisa: string; pantalon: string; zapatos?: string;
  chaleco?: string; chaqueta?: string; peto?: string; parche?: string;
  pajarita?: string; corbata?: string; lunares?: string; rayas?: string; tirantes?: string; cadena?: boolean;
  sombrero?: Sombrero; colorSombrero?: string; pelo?: string; bigote?: boolean; gafas?: boolean; auriculares?: boolean; gafasSol?: string; estampado?: "rayo" | "estrella" | "cara"; colorEstampado?: string;
};
export type Gesto = "normal" | "sonrisa" | "risa" | "sorpresa" | "susto" | "enfado" | "dientes" | "duda" | "nervioso" | "chulo" | "triste" | "grito" | "ojosCerrados";
export type Pose = "quieto" | "anda" | "baila" | "brazosArriba" | "manosCabeza" | "sostiene" | "senala" | "brazosCruzados" | "puno";
export type MunecoOpts = { gesto?: Gesto; pose?: Pose; fase?: number; mira?: number; parpadeo?: number; luz?: number; sudor?: boolean; rubor?: boolean; inclina?: number; giro?: number; espaldas?: boolean };

export const muneco = (p: Pen, r: Ropa, o: MunecoOpts = {}) => {
  const g = p.g;
  const { gesto = "normal", pose = "quieto", fase = 0, mira = 0, parpadeo = 0, sudor = false, rubor = false, inclina = 0, giro = 0, espaldas = false } = o;
  const two = Math.PI * 2;
  // proporciones
  const sole = 975, legL = 265, torH = 215, torW = 178, headR = 122;
  // baile acid: pies casi quietos, rodillas que rebotan a cada golpe, balanceo de cadera/torso cada dos golpes,
  // hombros que suben y bajan alternos y la cabeza que se deja llevar
  const bailando = pose === "baila" || pose === "brazosArriba";
  const S = bailando ? Math.sin(two * fase) : 0;
  const bob = pose === "anda" ? 10 * Math.abs(Math.cos(two * fase)) : bailando ? 12 * Math.abs(Math.sin(two * fase * 2)) : 0;
  const hip = sole - legL - bob, torTop = hip - torH, cx = 300 + S * 18;
  const hcx = cx + inclina * 1.2 + S * 16, hcy = torTop - headR * 0.78 + Math.abs(S) * 4;
  const OL = 9;
  const stroke = (pts: P2[], w: number, col = INK) => p.stroke(pts, w, col);
  const shape = (pts: P2[], fill: string | CanvasGradient, ol = OL) => {
    p.path(pts, true); g.fillStyle = fill; g.fill();
    if (ol) { g.lineWidth = ol; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
  };
  const sombreado = (pts: P2[], dx: number, dy: number, alpha = 0.22) => { // media luna de sombra (luz desde arriba-izquierda)
    p.clip(pts, () => { const [x0, y0] = pts.reduce((a, b) => [a[0] + b[0] / pts.length, a[1] + b[1] / pts.length], [0, 0]);
      const gr = g.createRadialGradient(x0 - dx, y0 - dy, 10, x0 - dx, y0 - dy, Math.hypot(dx, dy) * 3.2);
      gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.62, "rgba(0,0,0,0)"); gr.addColorStop(1, `rgba(20,10,40,${alpha})`);
      g.fillStyle = gr; g.fillRect(0, 0, 600, 1000); });
  };

  // ---------- piernas y zapatos ----------
  const pierna = (lado: number, ph: number) => {
    const hx = cx + lado * 40, sw = pose === "anda" ? Math.sin(two * (fase + ph)) * 34 : 0;
    const fx = (bailando ? 300 + lado * 46 : hx + sw) + lado * 6, fy = sole - (pose === "anda" ? Math.max(0, Math.sin(two * (fase + ph))) * 22 : 0);
    const kx = (hx + fx) / 2 + lado * (6 + (bailando ? bob * 0.9 : 0)), ky = (hip + fy) / 2;
    stroke([[hx, hip - 10], [kx, ky], [fx, fy - 12]], 15);
    const zc = r.zapatos ?? INK;
    shape(elp(fx + lado * 16, fy - 8, 30, 15), zc, zc === INK ? 0 : 6);
  };
  pierna(-1, 0); pierna(1, 0.5);

  // ---------- brazos (detrás el izquierdo, delante el derecho) ----------
  const hombro = (lado: number): P2 => [cx + lado * torW * 0.44, torTop + 46 - (bailando ? lado * S * 12 : 0)];
  type Brazo = { codo: P2; mano: P2 };
  const brazo = (lado: number): Brazo => {
    const [sx, sy] = hombro(lado), osc = Math.sin(two * fase) * lado;
    switch (pose) {
      case "anda": return { codo: [sx + lado * 22 + osc * 18, sy + 70], mano: [sx + lado * 30 + osc * 46, sy + 150] };
      case "baila": return { codo: [sx + lado * 96 + S * 30, sy - 110 + lado * S * 18], mano: [sx + lado * 66 + S * 80, sy - 290 + lado * S * 26] };
      case "brazosArriba": return { codo: [sx + lado * 80 + S * 14, sy - 140], mano: [sx + lado * 118 + S * 40, sy - 300 + Math.abs(Math.sin(two * fase * 2)) * 14] };
      case "manosCabeza": return { codo: [sx + lado * 95, sy - 60], mano: [hcx + lado * (headR * 0.98), hcy + 10] };
      case "sostiene": return { codo: [sx + lado * 40, sy + 85], mano: [cx + lado * 62, sy + 120] };
      case "senala": return lado > 0 ? { codo: [sx + 70, sy + 10], mano: [sx + 150, sy - 10] } : { codo: [sx - 22, sy + 70], mano: [sx - 26, sy + 150] };
      case "brazosCruzados": return { codo: [sx + lado * 36, sy + 92], mano: [cx - lado * 40, sy + 70] };
      case "puno": return lado > 0 ? { codo: [sx + 60, sy - 30], mano: [sx + 70, sy - 140] } : { codo: [sx - 22, sy + 70], mano: [sx - 26, sy + 150] };
      default: return { codo: [sx + lado * 26, sy + 75], mano: [sx + lado * 32, sy + 155] };
    }
  };
  const pintaBrazo = (lado: number) => {
    const b = brazo(lado);
    stroke([hombro(lado), b.codo, b.mano], 14);
    p.dot(b.mano[0], b.mano[1], 21, INK);
    p.dot(b.mano[0] - 6, b.mano[1] - 6, 5, "rgba(255,255,255,0.18)");
  };
  pintaBrazo(-1);

  // ---------- torso: judía con camisa, chaleco/chaqueta/peto y detalles ----------
  const tor: P2[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * two, sx = Math.cos(a), sy = Math.sin(a);
    const w = torW / 2 * (sy > 0 ? 1.0 : 0.86 + 0.14 * (1 + sy)), h = torH / 2;
    tor.push([cx + sx * w, torTop + torH / 2 + sy * h]);
  }
  shape(tor, r.camisa);
  p.clip(tor, () => {
    if (r.lunares) for (let y = torTop + 20; y < hip; y += 34) for (let x = cx - 100 + ((y / 34) % 2) * 17; x < cx + 100; x += 34) p.dot(x, y, 6.5, r.lunares);
    if (r.rayas) for (let x = cx - 100; x < cx + 100; x += 26) { g.fillStyle = r.rayas; g.fillRect(x, torTop, 11, torH); }
    if (r.estampado && !espaldas) {
      const ex = cx, ey = torTop + torH * 0.42, ce = r.colorEstampado ?? "#ffe14a";
      if (r.estampado === "rayo") shape([[ex + 8, ey - 52], [ex - 30, ey + 6], [ex - 4, ey + 6], [ex - 14, ey + 54], [ex + 30, ey - 8], [ex + 4, ey - 8]], ce, 5);
      else if (r.estampado === "estrella") { const pts: P2[] = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? 20 : 46; pts.push([ex + Math.cos(a) * rr, ey + Math.sin(a) * rr]); } shape(pts, ce, 5); }
      else { p.ell(ex, ey, 44, 44, ce, 5); p.ell(ex - 15, ey - 10, 5, 9, INK, 0); p.ell(ex + 15, ey - 10, 5, 9, INK, 0); p.arc(ex, ey + 2, 26, 22, 20, 160, 5); }
    }
    if (r.chaqueta) {
      shape([[cx - 120, torTop - 10], [cx - 14, torTop + 70], [cx - 22, hip + 10], [cx - 120, hip + 10]], r.chaqueta, 6);
      shape([[cx + 120, torTop - 10], [cx + 14, torTop + 70], [cx + 22, hip + 10], [cx + 120, hip + 10]], r.chaqueta, 6);
      shape([[cx - 60, torTop + 8], [cx - 14, torTop + 70], [cx - 50, torTop + 70]], mix(r.chaqueta, "#000000", 0.25), 5);
      shape([[cx + 60, torTop + 8], [cx + 14, torTop + 70], [cx + 50, torTop + 70]], mix(r.chaqueta, "#000000", 0.25), 5);
    }
    if (r.chaleco) {
      shape([[cx - 110, torTop + 20], [cx - 10, torTop + 66], [cx - 4, hip - 18], [cx - 110, hip]], r.chaleco, 6);
      shape([[cx + 110, torTop + 20], [cx + 10, torTop + 66], [cx + 4, hip - 18], [cx + 110, hip]], r.chaleco, 6);
      for (let k = 0; k < 4; k++) p.dot(cx + 16, torTop + 88 + k * 26, 6, "#e8e2d0");
      if (r.cadena) { const pts: P2[] = []; for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push([cx + 18 + t * 64, torTop + 140 + Math.sin(t * Math.PI) * 26]); }
        pts.forEach(([x, y], k) => k % 1 === 0 && p.ell(x, y, 5, 3.5, "#d9b44a", 2)); }
    }
    if (r.peto) {
      shape([[cx - 62, torTop + 70], [cx + 62, torTop + 70], [cx + 70, hip + 10], [cx - 70, hip + 10]], r.peto, 6);
      g.setLineDash([9, 7]); g.lineWidth = 3; g.strokeStyle = "#f2d16a";
      p.path([[cx - 50, torTop + 82], [cx + 50, torTop + 82], [cx + 56, hip], [cx - 56, hip]], true); g.stroke(); g.setLineDash([]);
      stroke([[cx - 62, torTop + 72], [cx - 74, torTop + 4]], 16, r.peto); stroke([[cx + 62, torTop + 72], [cx + 74, torTop + 4]], 16, r.peto);
      p.dot(cx - 60, torTop + 80, 9, "#e8c35a"); p.dot(cx + 60, torTop + 80, 9, "#e8c35a");
      if (r.parche) { shape([[cx + 6, torTop + 110], [cx + 52, torTop + 106], [cx + 54, torTop + 148], [cx + 8, torTop + 150]], r.parche, 4);
        g.lineWidth = 4; g.strokeStyle = "#fff4e0"; for (let k = 0; k < 3; k++) { const x = cx + 14 + k * 14; p.stroke([[x, torTop + 116], [x + 10, torTop + 128]], 4, "#fff4e0"); p.stroke([[x + 10, torTop + 116], [x, torTop + 128]], 4, "#fff4e0"); } }
    }
    if (r.tirantes) { stroke([[cx - 52, torTop - 4], [cx - 44, hip + 6]], 12, r.tirantes); stroke([[cx + 52, torTop - 4], [cx + 44, hip + 6]], 12, r.tirantes); }
    if (!r.chaleco && !r.chaqueta && !r.peto) for (let k = 0; k < 3; k++) p.dot(cx, torTop + 70 + k * 36, 5.5, mix(r.camisa, "#ffffff", 0.55));
    // cinturilla del pantalón
    shape([[cx - 120, hip - 22], [cx + 120, hip - 22], [cx + 120, hip + 20], [cx - 120, hip + 20]], r.pantalon, 0);
  });
  sombreado(tor, -30, -26, 0.3);
  p.poly(tor, null, OL);
  // cuello: corbata o pajarita
  if (r.corbata) shape([[cx - 10, torTop + 6], [cx + 10, torTop + 6], [cx + 16, torTop + 110], [cx, torTop + 128], [cx - 16, torTop + 110]], r.corbata, 5);
  if (r.pajarita) {
    const pjY = torTop + 30;
    shape([[cx, pjY], [cx - 46, pjY - 22], [cx - 46, pjY + 22]], r.pajarita, 5); shape([[cx, pjY], [cx + 46, pjY - 22], [cx + 46, pjY + 22]], r.pajarita, 5);
    p.dot(cx - 28, pjY - 7, 5, "#ffffff"); p.dot(cx - 32, pjY + 10, 5, "#ffffff"); p.dot(cx + 28, pjY - 7, 5, "#ffffff"); p.dot(cx + 32, pjY + 10, 5, "#ffffff");
    shape(elp(cx, pjY, 11, 13, 16), mix(r.pajarita, "#000000", 0.2), 5);
  }

  // ---------- cabeza ----------
  const head = elp(hcx, hcy, headR, headR * 0.94, 64);
  if (r.sombrero === "melena") shape(elp(hcx, hcy + 20, headR * 1.08, headR * 1.0, 48, 150, 390), r.pelo ?? "#3a2a20", OL);
  shape(head, "#fbfbf8");
  sombreado(head, -34, -36, 0.28);
  p.poly(head, null, OL + 2);
  // la cara se desplaza hacia un lado si la persona está girada; de espaldas no se ve
  const fcx = hcx + giro * 50;
  if (!espaldas) {
  if (rubor) { p.ell(fcx - 64, hcy + 30, 22, 12, "rgba(240,110,120,0.45)", 0); p.ell(fcx + 64, hcy + 30, 22, 12, "rgba(240,110,120,0.45)", 0); }

  // ---------- cara ----------
  const ex = 40, ey = hcy - 8, mx = mira * 7;
  const ojoPunto = (x: number) => { p.ell(x + mx, ey, 9, 13, INK, 0); p.dot(x + mx - 3, ey - 5, 3, "#ffffff"); };
  const ojoGrande = (x: number) => { p.ell(x, ey, 22, 25, "#ffffff", 6); p.ell(x + mx * 1.4, ey + 2, 10, 12, INK, 0); p.dot(x + mx * 1.4 - 3, ey - 3, 3, "#ffffff"); };
  const ojoCerrado = (x: number, arriba = true) => p.arc(x, ey + (arriba ? 6 : -4), 17, 11, arriba ? 200 : 20, arriba ? 340 : 160, 7);
  const parpa = parpadeo > 0.5 && gesto !== "risa" && gesto !== "ojosCerrados";
  // cejas
  const ceja = (x: number, lado: number, tipo: string) => {
    const y = ey - 42;
    const pts: Record<string, P2[]> = {
      normal: [[x - 22, y + 2], [x + 22, y - 2]],
      arriba: [[x - 22, y - 2], [x, y - 14], [x + 22, y - 4]],
      enfado: [[x - 24 * lado, y - 12], [x + 22 * lado, y + 10]],
      triste: [[x - 22 * lado, y + 8], [x + 22 * lado, y - 10]],
      duda: lado < 0 ? [[x - 22, y + 4], [x + 22, y + 4]] : [[x - 22, y - 6], [x, y - 20], [x + 22, y - 8]],
      chulo: lado < 0 ? [[x - 22, y + 6], [x + 22, y + 2]] : [[x - 22, y - 6], [x + 22, y - 14]],
    };
    p.stroke(pts[tipo] ?? pts.normal, 11);
  };
  const tipoCeja: Record<Gesto, string> = { normal: "normal", sonrisa: "normal", risa: "arriba", sorpresa: "arriba", susto: "arriba", enfado: "enfado", dientes: "enfado",
    duda: "duda", nervioso: "triste", chulo: "chulo", triste: "triste", grito: "enfado", ojosCerrados: "normal" };
  ceja(fcx - ex, -1, tipoCeja[gesto]); ceja(fcx + ex, 1, tipoCeja[gesto]);
  // ojos
  for (const [x, lado] of [[fcx - ex, -1], [fcx + ex, 1]] as const) {
    if (parpa) { ojoCerrado(x, false); continue; }
    if (gesto === "risa" || gesto === "ojosCerrados") ojoCerrado(x, true);
    else if (gesto === "sorpresa" || gesto === "susto") ojoGrande(x);
    else if (gesto === "chulo") { ojoPunto(x); p.stroke([[x - 14, ey - 6], [x + 14, ey - 6]], 7); }
    else if (gesto === "enfado" || gesto === "dientes" || gesto === "grito") { ojoPunto(x); p.stroke([[x - 14 * lado, ey - 12], [x + 14 * lado, ey - 2]], 6); }
    else ojoPunto(x);
  }
  if (r.gafas) { p.ell(fcx - ex, ey, 30, 26, null, 6); p.ell(fcx + ex, ey, 30, 26, null, 6); p.stroke([[fcx - 10, ey], [fcx + 10, ey]], 6); }
  if (r.gafasSol) { shape([[fcx - ex - 36, ey - 22], [fcx - 8, ey - 22], [fcx - 12, ey + 14], [fcx - ex - 30, ey + 18]], r.gafasSol, 6); shape([[fcx + ex + 36, ey - 22], [fcx + 8, ey - 22], [fcx + 12, ey + 14], [fcx + ex + 30, ey + 18]], r.gafasSol, 6);
    p.stroke([[fcx - 8, ey - 16], [fcx + 8, ey - 16]], 6); p.stroke([[fcx - ex - 24, ey - 12], [fcx - ex - 8, ey - 2]], 4, "rgba(255,255,255,0.45)"); p.stroke([[fcx + ex - 4, ey - 12], [fcx + ex + 12, ey - 2]], 4, "rgba(255,255,255,0.45)"); }
  // boca
  const my = hcy + 52;
  const boca = () => {
    switch (gesto) {
      case "sonrisa": p.arc(fcx, my - 16, 34, 20, 20, 160, 8); break;
      case "risa": shape([[fcx - 44, my - 10], [fcx + 44, my - 10], [fcx + 30, my + 26], [fcx, my + 36], [fcx - 30, my + 26]], "#5a1a26", 7);
        shape([[fcx - 36, my - 8], [fcx + 36, my - 8], [fcx + 30, my + 4], [fcx - 30, my + 4]], "#ffffff", 0); p.ell(fcx, my + 22, 18, 9, "#e06070", 0); break;
      case "sorpresa": shape(elp(fcx, my, 16, 22, 24), "#5a1a26", 7); break;
      case "susto": shape(elp(fcx, my + 4, 28, 30, 28), "#5a1a26", 7); p.ell(fcx, my + 22, 16, 8, "#e06070", 0); break;
      case "grito": shape([[fcx - 40, my - 18], [fcx + 40, my - 18], [fcx + 26, my + 34], [fcx - 26, my + 34]], "#5a1a26", 7);
        shape([[fcx - 34, my - 15], [fcx + 34, my - 15], [fcx + 31, my - 4], [fcx - 31, my - 4]], "#ffffff", 0); break;
      case "dientes": shape([[fcx - 40, my - 14], [fcx + 40, my - 14], [fcx + 40, my + 14], [fcx - 40, my + 14]], "#ffffff", 7);
        p.stroke([[fcx - 40, my], [fcx + 40, my]], 4); for (let k = -2; k <= 2; k++) p.stroke([[fcx + k * 16, my - 14], [fcx + k * 16, my + 14]], 4); break;
      case "enfado": p.arc(fcx, my + 16, 30, 16, 200, 340, 8); break;
      case "triste": p.arc(fcx, my + 14, 26, 14, 200, 340, 7); break;
      case "duda": p.stroke([[fcx - 26, my + 4], [fcx + 24, my - 6]], 8); break;
      case "nervioso": { const pts: P2[] = []; for (let k = 0; k <= 8; k++) pts.push([fcx - 30 + k * 7.5, my + (k % 2 ? -6 : 6)]); p.stroke(pts, 6); break; }
      case "chulo": p.stroke([[fcx - 28, my + 2], [fcx + 6, my + 4], [fcx + 32, my - 10]], 8); break;
      case "ojosCerrados": p.arc(fcx, my - 10, 22, 12, 20, 160, 7); break;
      default: p.stroke([[fcx - 22, my], [fcx + 22, my]], 8);
    }
  };
  boca();
  if (r.bigote) { shape([[fcx, my - 22], [fcx - 46, my - 12], [fcx - 54, my - 26], [fcx - 20, my - 36]], r.pelo ?? INK, 0); shape([[fcx, my - 22], [fcx + 46, my - 12], [fcx + 54, my - 26], [fcx + 20, my - 36]], r.pelo ?? INK, 0); }
  if (sudor) { shape([[fcx + headR * 0.78, hcy - 44], [fcx + headR * 0.7, hcy - 10], [fcx + headR * 0.86, hcy - 8]], "#7fd0ff", 4); }

  }
  // ---------- sombrero / pelo ----------
  const cs = r.colorSombrero ?? "#2a2430";
  const top = hcy - headR * 0.94;
  if (espaldas && r.sombrero !== "gorro") {
    const col = r.sombrero === "cresta" ? mix(r.pelo ?? "#2b1d1a", "#ffffff", 0.15) : r.pelo ?? "#2b1d1a";
    p.clip(head, () => { g.fillStyle = col; g.beginPath(); g.ellipse(hcx, hcy - headR * 0.25, headR * 1.05, headR * 0.95, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 4; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(hcx + k * 24, hcy - headR * 0.8); g.quadraticCurveTo(hcx + k * 30, hcy, hcx + k * 26, hcy + headR * 0.5); g.stroke(); } });
    p.poly(head, null, OL + 2);
  }
  switch (r.sombrero ?? "pelo") {
    case "rizos": {
      const col = r.pelo ?? "#2b1d1a";
      for (let k = 0; k <= 12; k++) { const a = Math.PI * (0.92 + (k / 12) * 1.16); p.ell(hcx + Math.cos(a) * headR * 0.98, hcy + Math.sin(a) * headR * 0.92 - 6, 34, 32, col, 6); }
      shape(elp(hcx, hcy - headR * 0.55, headR * 0.92, headR * 0.5, 30, 180, 360), col, 0);
      for (let k = 0; k < 5; k++) p.arc(hcx - 60 + k * 30, hcy - headR * 0.8, 10, 9, 200, 340, 3, "rgba(255,255,255,0.22)");
      break;
    }
    case "cresta": {
      const col = r.colorSombrero ?? "#ff3d8b";
      shape(elp(hcx, hcy, headR * 1.0, headR * 0.98, 24, 205, 335), mix(r.pelo ?? "#2b1d1a", "#ffffff", 0.15), 5);
      const pts: P2[] = [[hcx - 56, top + 40]];
      for (let k = 0; k < 5; k++) { const x = hcx - 46 + k * 23; pts.push([x - 4, top - 60 - (k === 2 ? 20 : k % 2 ? 6 : 0)]); pts.push([x + 10, top + 16]); }
      pts.push([hcx + 60, top + 40]);
      shape(pts, col, 7); break;
    }
    case "pelo": case "melena": case "cinta": {
      const largo = r.sombrero === "melena", pts: P2[] = [];
      for (let k = 0; k <= 24; k++) { const a = Math.PI * (1 + k / 24); pts.push([hcx + Math.cos(a) * headR * 1.04, hcy + Math.sin(a) * headR * 1.0]); }
      // flequillo: mechones de derecha a izquierda
      const fy = hcy - headR * 0.6, n = 6;
      for (let k = 0; k <= n; k++) { const x = hcx + headR * 1.0 - (2 * headR * 1.0 * k) / n; pts.push([x, fy + (k % 2 ? 26 : 0) + (largo && (k === 0 || k === n) ? 90 : 0)]); }
      shape(pts, r.pelo ?? "#3a2a20", 8);
      p.stroke([[hcx - 30, top + 20], [hcx - 10, fy + 6]], 4, "rgba(255,255,255,0.18)"); p.stroke([[hcx + 26, top + 18], [hcx + 40, fy + 4]], 4, "rgba(255,255,255,0.18)");
      if (r.sombrero === "cinta") { shape(elp(hcx, fy + 14, headR * 1.06, 22, 40), cs, 6); p.clip(elp(hcx, fy + 14, headR * 1.06, 22, 40), () => { g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(hcx - headR * 1.1, fy + 8, headR * 2.2, 6); }); }
      break;
    }
    case "gorra": {
      shape(elp(hcx, top + 46, headR * 0.98, 70, 40, 180, 360), cs, OL);
      shape([[hcx - 20, top + 40], [hcx + headR * 1.25, top + 34], [hcx + headR * 1.3, top + 52], [hcx - 10, top + 58]], mix(cs, "#000000", 0.2), 7);
      g.setLineDash([8, 6]); p.arc(hcx, top + 46, headR * 0.8, 52, 200, 340, 3, "#fff2d0"); g.setLineDash([]);
      p.dot(hcx, top - 22, 9, mix(cs, "#000000", 0.3)); break;
    }
    case "gorraAtras": {
      shape(elp(hcx, top + 46, headR * 0.98, 70, 40, 180, 360), cs, OL);
      shape([[hcx + 10, top + 40], [hcx - headR * 1.22, top + 18], [hcx - headR * 1.26, top + 36], [hcx, top + 58]], mix(cs, "#000000", 0.25), 7);
      shape([[hcx - 20, top + 2], [hcx + 20, top + 2], [hcx + 18, top + 18], [hcx - 18, top + 18]], mix(cs, "#ffffff", 0.35), 4);
      p.dot(hcx, top - 22, 9, mix(cs, "#000000", 0.3)); break;
    }
    case "bombin": shape(elp(hcx, top + 34, headR * 1.15, 20, 32), cs, OL); shape(elp(hcx, top + 20, headR * 0.72, 62, 40, 180, 360), cs, OL);
      shape([[hcx - headR * 0.72, top + 14], [hcx + headR * 0.72, top + 14], [hcx + headR * 0.72, top + 26], [hcx - headR * 0.72, top + 26]], "#7a2a2a", 0); break;
    case "canotier": shape(elp(hcx, top + 36, headR * 1.2, 18, 32), "#e6c27a", OL);
      shape([[hcx - 76, top + 30], [hcx - 72, top - 20], [hcx + 72, top - 20], [hcx + 76, top + 30]], "#e6c27a", OL);
      shape([[hcx - 75, top + 4], [hcx + 75, top + 4], [hcx + 75, top + 22], [hcx - 75, top + 22]], cs, 5); break;
    case "chistera": shape(elp(hcx, top + 34, headR * 1.15, 18, 32), cs, OL); shape([[hcx - 66, top + 30], [hcx - 66, top - 110], [hcx + 66, top - 110], [hcx + 66, top + 30]], cs, OL);
      shape([[hcx - 66, top + 4], [hcx + 66, top + 4], [hcx + 66, top + 24], [hcx - 66, top + 24]], "#a02a2a", 0); break;
    case "gorro": shape(elp(hcx, top + 50, headR * 0.98, 80, 40, 180, 360), cs, OL);
      shape([[hcx - headR, top + 40], [hcx + headR, top + 40], [hcx + headR, top + 66], [hcx - headR, top + 66]], mix(cs, "#ffffff", 0.25), 7); p.dot(hcx, top - 34, 18, "#fff4e0"); break;
    default: break;
  }
  if (r.auriculares) {
    p.arc(hcx, hcy - 10, headR * 1.04, headR * 1.0, 190, 350, 16);
    shape([[hcx - headR - 16, hcy - 30], [hcx - headR + 12, hcy - 30], [hcx - headR + 12, hcy + 34], [hcx - headR - 16, hcy + 34]], "#3a3a48", 7);
    shape([[hcx + headR - 12, hcy - 30], [hcx + headR + 16, hcy - 30], [hcx + headR + 16, hcy + 34], [hcx + headR - 12, hcy + 34]], "#3a3a48", 7);
  }
  pintaBrazo(1);
};
