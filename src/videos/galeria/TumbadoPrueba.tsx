import React, { useEffect, useRef } from "react";
import { AbsoluteFill, delayRender, continueRender } from "remotion";
import { Pen } from "../../motor3d/toon";
import { tumbado } from "../../motor25d/tumbado";
export const TumbadoPrueba: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [h] = React.useState(() => delayRender("tumbado"));
  useEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!; g.fillStyle = "#3a2350"; g.fillRect(0, 0, c.width, c.height);
    [0, 0.12, 0.23, 0.35].forEach((t, i) => { g.save(); g.translate((i % 2) * 960, Math.floor(i / 2) * 608); g.scale(0.8, 0.8); tumbado({ t, bpm: 130 })(new Pen(g)); g.restore(); });
    continueRender(h);
  }, [h]);
  return <AbsoluteFill><canvas ref={ref} width={1920} height={1216} /></AbsoluteFill>;
};
