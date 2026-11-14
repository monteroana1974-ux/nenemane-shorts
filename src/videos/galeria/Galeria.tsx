import React, { useEffect, useRef } from "react";
import { AbsoluteFill, delayRender, continueRender } from "remotion";
import { Pen } from "../../motor3d/toon";
import { muneco, Ropa, MunecoOpts } from "../../motor25d/muneco";
export const ELENCO: { r: Ropa; o: MunecoOpts; n: string }[] = [
  { n: "guitarrista", r: { camisa: "#2f5d9e", pantalon: "#2d3550", chaqueta: "#3b2a24", sombrero: "melena", pelo: "#6b3b1e", zapatos: "#3a2a20" }, o: { gesto: "sonrisa" } },
  { n: "guitarrista susto", r: { camisa: "#2f5d9e", pantalon: "#2d3550", chaqueta: "#3b2a24", sombrero: "melena", pelo: "#6b3b1e" }, o: { gesto: "susto", pose: "manosCabeza", sudor: true } },
  { n: "vendedor", r: { camisa: "#f2efe6", pantalon: "#3b3f52", chaleco: "#7a3a2a", cadena: true, pajarita: "#c2452f", sombrero: "bombin", bigote: true, pelo: "#2b1d1a" }, o: { gesto: "chulo" } },
  { n: "cliente duda", r: { camisa: "#e0a43a", pantalon: "#3b3f52", rayas: "#c98a26", sombrero: "gorra", colorSombrero: "#2f5d9e" }, o: { gesto: "duda", pose: "sostiene" } },
  { n: "chaval peto", r: { camisa: "#f1d06a", pantalon: "#2d4f86", peto: "#3d6fb6", parche: "#c2452f", sombrero: "gorra", colorSombrero: "#d33a3a", zapatos: "#f4f1ea" }, o: { gesto: "risa", rubor: true } },
  { n: "chaval 2", r: { camisa: "#3f9a62", pantalon: "#22283a", tirantes: "#1b1414", sombrero: "gorro", colorSombrero: "#8a5ac9", zapatos: "#f4f1ea" }, o: { gesto: "sorpresa", pose: "brazosArriba" } },
  { n: "DJ", r: { camisa: "#2b2b3a", pantalon: "#22283a", lunares: "#7dff6a", sombrero: "gorra", colorSombrero: "#111111", auriculares: true }, o: { gesto: "chulo", pose: "senala" } },
  { n: "coleccionista", r: { camisa: "#f2efe6", pantalon: "#22283a", chaqueta: "#2f3a5e", corbata: "#a02a2a", sombrero: "pelo", pelo: "#c9a06b", gafas: true }, o: { gesto: "grito", rubor: true } },
  { n: "enfado", r: { camisa: "#c2452f", pantalon: "#2d3550", sombrero: "canotier", colorSombrero: "#2f5d9e", pajarita: "#2f5d9e", lunares: "#f2c9c0" }, o: { gesto: "dientes", pose: "puno" } },
  { n: "bailarina", r: { camisa: "#d64fb4", pantalon: "#2d3550", sombrero: "melena", pelo: "#1b1414", lunares: "#ffd1f0" }, o: { gesto: "risa", pose: "baila", fase: 0.3 } },
];
export const Galeria: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [h] = React.useState(() => delayRender("galeria"));
  useEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!; g.fillStyle = "#cfc6b8"; g.fillRect(0, 0, c.width, c.height);
    ELENCO.forEach((e, i) => { g.save(); g.translate((i % 5) * 384, Math.floor(i / 5) * 640); g.scale(0.64, 0.64); muneco(new Pen(g), e.r, e.o); g.restore(); });
    continueRender(h);
  }, [h]);
  return <AbsoluteFill><canvas ref={ref} width={1920} height={1280} /></AbsoluteFill>;
};
