// Episodio TB-303 · prueba de estilo 3D. Cadena de post del motor: tinta -> desenfoque de lente -> bloom ->
// mapeo de tono NEUTRAL -> corrección de color (MSAA 4). Encima, en 2D: fecha/lugar arriba y subtítulos de 1-2 palabras.
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps, delayRender, continueRender } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import "@fontsource/montserrat/900.css";
import { World } from "./world";
import { InkPass, noInkFallback } from "../../motor3d/ink";
import { LensBlur } from "../../motor3d/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../../motor3d/grade";
import { SHOTS, layersAt, dofAt, PALABRAS, CIERRE, SERIE, BPM } from "./story";
import { Onda, W, TINTA } from "../../motor2d/base";
import { Sequence, interpolate } from "remotion";
import { Subtitulos, Fecha } from "../../motor2d/textos";

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.7, luminanceThreshold: 1.0, luminanceSmoothing: 0.25, mipmapBlur: true, levels: 6, radius: 0.65 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const Inner: React.FC<{ id: number }> = ({ id }) => {
  const f = useCurrentFrame();
  const { camera, scene, gl, size } = useThree();
  const world = useMemo(() => new World(), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { multisampling: 4, frameBufferType: THREE.HalfFloatType });
    c.addPass(new RenderPass(scene, camera));
    c.addPass(fx.ink);
    c.addPass(new EffectPass(camera, fx.lens.pre));
    c.addPass(new EffectPass(camera, fx.lens.main));
    c.addPass(new EffectPass(camera, fx.bloom, fx.tone, fx.grade));
    return c;
  }, [gl, scene, camera, fx]);
  useEffect(() => { composer.setSize(size.width, size.height); }, [composer, size.width, size.height]);
  useFrame(() => { composer.render(); }, 1);
  const cam = camera as THREE.PerspectiveCamera;
  const target = world.update(id, f, cam, scene);
  noInkFallback(world.root);
  const d = dofAt(id, f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, ["tienda", "saldo"].includes(SHOTS[id - 1].luz) ? "golden" : "day");
  return <primitive object={world.root} dispose={null} />;
};

const dprOverride = () => (getInputProps() as { dpr?: number }).dpr;
const ShotView: React.FC<{ id: number; alpha: number }> = ({ id, alpha }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows
      gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.05, far: 1200 }}>
      <Inner id={id} />
    </ThreeCanvas>
  </AbsoluteFill>
);

const Cierre: React.FC = () => {
  const f = useCurrentFrame();
  const beat = f / (30 * 60 / BPM), pulso = Math.pow(1 - (beat % 1), 2);
  const entra = (k: number) => interpolate(f, [k, k + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0c0718", alignItems: "center", justifyContent: "center", opacity: interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" }) }}>
      <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 1, 2].map((i) => <Onda key={i} x0={-40} x1={1120} y={1420 + i * 70} amp={50} f={f} color={["#7dff6a", "#ff4fd8", "#4fd8ff"][i]} fase={i * 2} vel={0.3} />)}
      </svg>
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, textAlign: "center", color: "#fff", WebkitTextStroke: `10px ${TINTA}`, paintOrder: "stroke fill" }}>
        <div style={{ fontSize: 50, letterSpacing: 8, color: "#ffe14d", opacity: entra(0) }}>{SERIE.serie.toUpperCase()} · EP. {SERIE.episodio}</div>
        <div style={{ fontSize: 76, marginTop: 24, opacity: entra(4), padding: "0 60px", lineHeight: 1.05 }}>{SERIE.titulo}</div>
        <div style={{ fontSize: 150, marginTop: 120, opacity: entra(10), transform: `scale(${1 + 0.04 * pulso})` }}>NeNeMaNé</div>
        <div style={{ fontSize: 46, marginTop: 30, opacity: entra(16), color: "#7dff6a" }}>Escúchalo en Spotify</div>
      </div>
    </AbsoluteFill>
  );
};

export const Ep01: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = React.useState(() => delayRender("fuentes"));
  React.useEffect(() => { document.fonts.ready.then(() => continueRender(h)); }, [h]);
  const s = SHOTS.find((q) => f >= q.a && f < q.b);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {layersAt(f).map((l) => <ShotView key={`shot${l.id}`} id={l.id} alpha={l.alpha} />)}
      {s && <Fecha texto={s.fecha} f={f - s.a} d={s.b - s.a} />}
      <Sequence from={CIERRE.a} durationInFrames={CIERRE.b - CIERRE.a}><Cierre /></Sequence>
      <Subtitulos f={f} palabras={PALABRAS} hasta={CIERRE.a} />
      {!(getInputProps() as { mute?: boolean }).mute && <Audio src={staticFile("mezcla_ep01.wav")} />}
    </AbsoluteFill>
  );
};
