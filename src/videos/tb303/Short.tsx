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
import { SHOTS, layersAt, dofAt } from "./story";
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
  gradeFor(fx.grade, SHOTS[id - 1].luz === "tienda" ? "golden" : "day");
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

/** subtítulos provisionales: las palabras de cada toma repartidas por sílabas a lo largo de la toma */
const PALABRAS = SHOTS.flatMap((s) => {
  const ws = s.texto.split(" "), syl = ws.map((w) => /\d{4}/.test(w) ? 8 : Math.max(1, (w.toLowerCase().match(/[aeiouáéíóúü]+/g) || []).length));
  const tot = syl.reduce((a, b) => a + b, 0), a0 = s.a + 4, span = s.b - s.a - 12;
  let acc = 0;
  return ws.map((t, i) => { const a = a0 + Math.round((acc / tot) * span); acc += syl[i]; return { t, a, b: a0 + Math.round((acc / tot) * span) }; });
});

export const TB303Prueba: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = React.useState(() => delayRender("fuentes"));
  React.useEffect(() => { document.fonts.ready.then(() => continueRender(h)); }, [h]);
  const s = SHOTS.find((q) => f >= q.a && f < q.b) ?? SHOTS[SHOTS.length - 1];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {layersAt(f).map((l) => <ShotView key={`shot${l.id}`} id={l.id} alpha={l.alpha} />)}
      <Fecha texto={s.fecha} f={f - s.a} d={s.b - s.a} />
      <Subtitulos f={f} palabras={PALABRAS} hasta={10000} />
      {!(getInputProps() as { mute?: boolean }).mute && <Audio src={staticFile("musica_prueba.wav")} />}
    </AbsoluteFill>
  );
};
