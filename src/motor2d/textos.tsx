import React from "react";
import { interpolate } from "remotion";
import { TINTA, W } from "./base";

type Palabra = { t: string; a: number; b: number };

/** Agrupa en trozos de 1-2 palabras (como los shorts de referencia). */
export const trozos = (ps: Palabra[]) => {
  const out: { texto: string; a: number; b: number; idx: number[] }[] = [];
  let i = 0;
  while (i < ps.length) {
    const p = ps[i], q = ps[i + 1];
    const fin = /[.,:?!;]$/.test(p.t);
    if (q && !fin && (p.t.length + q.t.length) <= 11) {
      out.push({ texto: `${p.t} ${q.t}`, a: p.a, b: q.b, idx: [i, i + 1] }); i += 2;
    } else { out.push({ texto: p.t, a: p.a, b: p.b, idx: [i] }); i += 1; }
  }
  return out;
};

const limpia = (s: string) => s.replace(/[.,:;]$/g, "").replace(/^¿/, "¿");

export const Subtitulos: React.FC<{ f: number; palabras: Palabra[]; hasta: number }> = ({ f, palabras, hasta }) => {
  if (f >= hasta) return null;
  const tz = trozos(palabras);
  let k = -1;
  for (let i = 0; i < tz.length; i++) if (f >= tz[i].a - 1) k = i;
  if (k < 0) return null;
  const tr = tz[k];
  const sig = tz[k + 1];
  if (!sig && f > tr.b + 12) return null;
  if (sig && f >= sig.a - 1) return null;
  const pop = interpolate(f - tr.a, [-1, 3, 6], [0.7, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const texto = limpia(tr.texto).toUpperCase();
  const clave = /\d|ACID|PHUTURE|CHICAGO|ROLAND|SALDO|DESASTRE|NADIE/.test(texto);
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 1400, display: "flex", justifyContent: "center" }}>
      <div style={{
        transform: `scale(${pop})`, fontFamily: "Montserrat", fontWeight: 900, fontSize: texto.length > 12 ? 104 : 124,
        color: clave ? "#ffe14d" : "#ffffff", letterSpacing: -1, textAlign: "center", lineHeight: 1,
        WebkitTextStroke: `14px ${TINTA}`, paintOrder: "stroke fill", textShadow: "0 10px 0 rgba(0,0,0,0.35)",
        padding: "0 40px",
      }}>{texto}</div>
    </div>
  );
};

/** Cifra o lugar discreto arriba del cuadro. */
export const Fecha: React.FC<{ texto: string; f: number; d: number }> = ({ texto, f, d }) => {
  if (!texto) return null;
  const op = interpolate(f, [4, 12, d - 6, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [4, 14], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 210 + y, left: 0, width: W, display: "flex", justifyContent: "center", opacity: op }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 64, color: "#fff", background: "rgba(14,10,22,0.72)", border: "5px solid #ffe14d", borderRadius: 999, padding: "10px 38px", letterSpacing: 4 }}>{texto}</div>
    </div>
  );
};
