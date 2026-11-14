import React from "react";
import { Easing, interpolate } from "remotion";

export const W = 1080, H = 1920;
export const TINTA = "#120c18";
export const CONTORNO = "#241726";
export const LINEA = 7;

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smoother = (x: number) => { const t = clamp(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const mezcla = (a: number, b: number, t: number) => a + (b - a) * t;
export const suave = (f: number, a: number, b: number, v0 = 0, v1 = 1) =>
  interpolate(f, [a, b], [v0, v1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.2, 0.7, 0.2, 1) });

/** Pseudo-aleatorio estable por semilla. */
export const azar = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export type Cam = { x: number; y: number; z: number; rot?: number };
export type Llave = Cam & { t: number };

/** Cámara: interpola llaves (t = 0..1 de la toma) con smootherstep; nunca se queda quieta (deriva lenta). */
export const camara = (llaves: Llave[], p: number, f: number, temblor = 0): Cam => {
  let i = 0;
  while (i < llaves.length - 2 && p > llaves[i + 1].t) i++;
  const A = llaves[i], B = llaves[Math.min(i + 1, llaves.length - 1)];
  const k = B.t === A.t ? 1 : smoother((p - A.t) / (B.t - A.t));
  const deriva = Math.sin(f / 47) * 6;
  const sx = temblor ? Math.sin(f * 2.9) * temblor : 0;
  const sy = temblor ? Math.cos(f * 3.7) * temblor : 0;
  return {
    x: mezcla(A.x, B.x, k) + deriva + sx,
    y: mezcla(A.y, B.y, k) + Math.cos(f / 61) * 4 + sy,
    z: mezcla(A.z, B.z, k) * (1 + 0.0004 * f),
    rot: mezcla(A.rot ?? 0, B.rot ?? 0, k),
  };
};

/** Capa con paralaje: p = 0 fija (cielo), 1 = plano principal, >1 primer plano. */
export const Capa: React.FC<{ cam: Cam; p: number; blur?: number; children: React.ReactNode; opacity?: number }> = ({ cam, p, blur = 0, children, opacity = 1 }) => {
  const s = 1 + (cam.z - 1) * p;
  const tr = `translate(${W / 2}px, ${H / 2}px) rotate(${(cam.rot ?? 0) * p}deg) scale(${s}) translate(${-W / 2 - cam.x * p}px, ${-H / 2 - cam.y * p}px)`;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: tr, filter: blur ? `blur(${blur}px)` : undefined, opacity }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", position: "absolute" }}>
        {children}
      </svg>
    </div>
  );
};

/** Viñeta y grano de color para unificar el look. */
export const Vineta: React.FC<{ fuerza?: number; tinte?: string }> = ({ fuerza = 0.55, tinte = "#000" }) => (
  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, ${tinte} 140%)`, opacity: fuerza, pointerEvents: "none" }} />
);

/** Haz de luz cónico (foco / láser). */
export const Haz: React.FC<{ x: number; y: number; ang: number; largo: number; ancho: number; color: string; op?: number }> = ({ x, y, ang, largo, ancho, color, op = 0.35 }) => {
  const id = `haz${Math.round(x)}_${Math.round(y)}_${Math.round(ang)}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`} style={{ mixBlendMode: "screen" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={op} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`M -14 0 L 14 0 L ${ancho / 2} ${largo} L ${-ancho / 2} ${largo} Z`} fill={`url(#${id})`} />
    </g>
  );
};

/** Ondas de sonido "acid": línea de neón que serpentea. */
export const Onda: React.FC<{ x0: number; x1: number; y: number; amp: number; f: number; color: string; k?: number; grosor?: number; vel?: number; fase?: number }> = ({ x0, x1, y, amp, f, color, k = 0.035, grosor = 8, vel = 0.25, fase = 0 }) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 12) {
    const u = (x - x0) / (x1 - x0);
    const env = Math.sin(Math.PI * u);
    const v = Math.sin(x * k + f * vel + fase) + 0.45 * Math.sin(x * k * 2.7 - f * vel * 1.7 + fase);
    pts.push(`${x.toFixed(1)},${(y + v * amp * env).toFixed(1)}`);
  }
  const d = `M ${pts.join(" L ")}`;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <path d={d} stroke={color} strokeWidth={grosor * 3.2} fill="none" opacity={0.22} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={grosor} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke="#ffffff" strokeWidth={grosor * 0.3} fill="none" opacity={0.7} strokeLinecap="round" />
    </g>
  );
};

/** Texto dibujado en la escena (carteles, onomatopeyas). */
export const Rotulo: React.FC<{ x: number; y: number; texto: string; tam: number; color: string; rot?: number; escala?: number; borde?: string }> = ({ x, y, texto, tam, color, rot = 0, escala = 1, borde = TINTA }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${escala})`}>
    <text textAnchor="middle" dominantBaseline="middle" fontFamily="Montserrat" fontWeight={900} fontSize={tam} fill={color} stroke={borde} strokeWidth={tam * 0.16} paintOrder="stroke" strokeLinejoin="round">{texto}</text>
  </g>
);
