// PRUEBA 2.5D: fondo pintado (Nano Banana) + mapa de profundidad (Depth Anything V2) -> relieve 3D por el que
// viaja la cámara; muñecos del motor colocados sobre el suelo a su profundidad; subtítulos y mezcla del Ep. 1.
// Toma A = tienda 1981 (segmento 1 de la voz) · Toma B = club 1987 (segmento 8, con el drop).
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, getInputProps, delayRender, continueRender, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import "@fontsource/montserrat/900.css";
import { Pen, bodyFront, Outfit, Expr, SKINS } from "../../motor3d/toon";
import { Pool, Actor, Fx, Stage, tier, light2D, blob, SU } from "../../motor3d/troop";
import { LIGHTS, LightPreset } from "../../motor3d/lights";
import { TONE, CHAR } from "../../motor3d/shade";
import { NOINK } from "../../motor3d/ink";
import { Subtitulos, Fecha } from "../../motor2d/textos";
import TL from "../../../datos/tb303.json";

const IW = 1438, IH = 2576;             // tamaño de la imagen
const PH = 10, PW = PH * IW / IH;       // plano de la imagen a z = 0 (unidades del mundo)
const FOV0 = 50;                        // la cámara de referencia ve la imagen entera
const L = (PH / 2) / Math.tan(THREE.MathUtils.degToRad(FOV0 / 2)); // distancia de la cámara de referencia
/** profundidad -> factor de distancia a lo largo del rayo (1 = sobre el plano). d: 0 lejos .. 1 cerca */
const ratio = (d: number) => 1 / (0.62 + d * 1.25);
const smooth = (x: number) => { const u = Math.max(0, Math.min(1, x)); return 0.35 * u + 0.65 * u * u * u * (u * (6 * u - 15) + 10); };

type Fondo = { img: string; prof: string };
const FONDOS: Record<string, Fondo> = {
  tienda: { img: "fondos/tienda.jpg", prof: "fondos/tienda_prof.png" },
  club: { img: "fondos/club.jpg", prof: "fondos/club_prof.png" },
};

/** lee el mapa de profundidad a un array para colocar muñecos y desplazar la malla */
const cargaProf = (src: string) => new Promise<{ w: number; h: number; d: Float32Array }>((res) => {
  const im = new Image(); im.crossOrigin = "anonymous";
  im.onload = () => {
    const w = 360, h = Math.round(360 * IH / IW), c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d")!; g.drawImage(im, 0, 0, w, h);
    const px = g.getImageData(0, 0, w, h).data, d = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) d[i] = px[i * 4] / 255;
    res({ w, h, d });
  };
  im.src = src;
});

/** de un píxel de la imagen (x, y) a un punto del mundo, a la profundidad del mapa */
const mundo = (px: number, py: number, prof: { w: number; h: number; d: Float32Array }, dOverride?: number) => {
  const u = px / IW, v = py / IH;
  const d = dOverride ?? prof.d[Math.min(prof.h - 1, Math.floor(v * prof.h)) * prof.w + Math.min(prof.w - 1, Math.floor(u * prof.w))];
  const P = new THREE.Vector3((u - 0.5) * PW, (0.5 - v) * PH, 0), C = new THREE.Vector3(0, 0, L);
  return { p: C.clone().add(P.sub(C).multiplyScalar(ratio(d))), k: ratio(d) };
};

// ---------------- reparto ----------------
const GUITARRISTA: Outfit = { jacket: "#2f5d9e", pants: "#2d3550", boots: "#3a2a20", hat: "hair", hair: "#6b3b1e", skin: SKINS[0] };
const ROPA = ["#e0a43a", "#3f9a62", "#c2452f", "#2f5d9e", "#d64fb4", "#5ad0c8", "#f1d06a", "#8a5ac9"];
const PIEL = [SKINS[0], SKINS[1], SKINS[3], "#8a5a3c", "#6e4430", SKINS[2]];
const PELO = ["#2b1d1a", "#6b3b1e", "#1b1414", "#c9a06b", "#3a2a20"];
const bailarin = (i: number): Outfit => ({ jacket: ROPA[i % 8], pants: ["#22283a", "#2d3550", "#3b3f52"][i % 3], boots: i % 2 ? "#f4f1ea" : "#1b1414",
  hat: i % 3 === 0 ? "cap" : "hair", cap: ROPA[(i + 3) % 8], hair: PELO[i % 5], skin: PIEL[(i * 5) % 6] });
const DJ: Outfit = { jacket: "#3f9a62", pants: "#22283a", boots: "#1b1414", hat: "cap", cap: "#111111", skin: "#8a5a3c" };
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

/** la máquina dibujada en 2D (512 x 200), ruedas que giran */
const maquina = (giro: number, paso: number) => (p: Pen) => {
  const g = p.g;
  const gr = g.createLinearGradient(0, 20, 0, 190); gr.addColorStop(0, "#eef0f4"); gr.addColorStop(1, "#9aa1ab");
  g.fillStyle = gr; g.strokeStyle = "#120c18"; g.lineWidth = 8; g.beginPath(); g.roundRect(14, 30, 484, 150, 16); g.fill(); g.stroke();
  g.fillStyle = "#2c2f36"; g.fillRect(30, 44, 452, 60);
  for (let i = 0; i < 7; i++) {
    const cx = 62 + i * 64, cy = 74, a = -2.2 + ((giro * (1 + i * 0.37) + i * 0.7) % 4.4);
    g.fillStyle = "#e6e8ec"; g.beginPath(); g.arc(cx, cy, 20, 0, 7); g.fill(); g.lineWidth = 4; g.stroke();
    g.strokeStyle = "#120c18"; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a) * 15, cy - Math.cos(a) * 15); g.stroke();
  }
  for (let i = 0; i < 16; i++) { g.fillStyle = paso === i ? "#ff5a3c" : i % 4 === 0 ? "#f2f2f2" : "#3b3f47"; g.fillRect(34 + i * 28, 122, 22, 44); g.lineWidth = 3; g.strokeStyle = "#120c18"; g.strokeRect(34 + i * 28, 122, 22, 44); }
};

/** silueta del muñeco en oscuro y difuminada (para la sombra proyectada) */
const sombraDraw = (draw: (p: Pen) => void) => (p: Pen) => {
  draw(p);
  const g = p.g, c = g.canvas;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = "source-in"; g.fillStyle = "#140a20"; g.fillRect(0, 0, c.width, c.height);
  const tmp = document.createElement("canvas"); tmp.width = c.width; tmp.height = c.height; tmp.getContext("2d")!.drawImage(c, 0, 0);
  g.globalCompositeOperation = "source-over"; g.clearRect(0, 0, c.width, c.height);
  g.filter = `blur(${Math.max(2, Math.round(c.width / 70))}px)`; g.drawImage(tmp, 0, 0); g.restore();
};
const SOMBRA_GEO = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
class Sombra {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; r: { tex?: THREE.Texture } | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55, depthTest: false, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(SOMBRA_GEO, this.mat); this.mesh.matrixAutoUpdate = false; this.mesh.renderOrder = 5; this.mesh.frustumCulled = false;
    this.mesh.layers.set(NOINK); parent.add(this.mesh);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.mat.needsUpdate = true; } this.mat.color.set("#ff0000"); this.mat.map = null; this.mat.opacity = 1; }
}

type Toma = { fondo: string; luz: LightPreset; sombra: { ang: number; largo: number }; cam: (u: number, f: number) => { pos: THREE.Vector3; look: THREE.Vector3; fov: number } };
const TIENDA_LUZ: LightPreset = { ...LIGHTS.golden, lit: [1.35, 1.05, 0.78], shade: [0.42, 0.3, 0.26], lift: [0.1, 0.07, 0.05], charTint: [1.0, 0.9, 0.78], charShade: 0.86, sideTint: [0.9, 0.84, 0.9] };
const CLUB_LUZ: LightPreset = { ...LIGHTS.golden, lit: [1.25, 0.7, 1.25], shade: [0.2, 0.12, 0.32], lift: [0.06, 0.03, 0.1], charTint: [0.98, 0.78, 1.02], charShade: 0.8, sideTint: [0.7, 0.9, 1.0] };
const TOMAS: Record<string, Toma> = {
  // empieza cerca de la mesa, retrocede y baja hasta el guitarrista
  tienda: { fondo: "tienda", luz: TIENDA_LUZ, sombra: { ang: 0.75, largo: 0.8 }, cam: (u, f) => {
    const t = smooth(u);
    return { pos: new THREE.Vector3(0.9 - 1.0 * t + Math.sin(f / 50) * 0.04, -0.15 - 0.3 * t, L * (0.62 + 0.24 * t)), look: new THREE.Vector3(0.95 - 1.05 * t, -0.55 - 0.35 * t, 0), fov: FOV0 * (0.8 + 0.08 * t) };
  } },
  // de la cabina hacia atrás: aparece la pista llena
  club: { fondo: "club", luz: CLUB_LUZ, sombra: { ang: -0.35, largo: 0.6 }, cam: (u, f) => {
    const t = smooth(u);
    return { pos: new THREE.Vector3(Math.sin(f / 40) * 0.08, 0.25 - 0.45 * t, L * (0.7 + 0.16 * t)), look: new THREE.Vector3(0, -0.1 - 0.55 * t, 0), fov: FOV0 * (0.68 + 0.12 * t) };
  } },
};

const BPM = TL.bpm;
const Escena: React.FC<{ toma: string; d: number }> = ({ toma, d }) => {
  const f = useCurrentFrame(), T = TOMAS[toma], F = FONDOS[T.fondo];
  const { camera, scene, gl, invalidate } = useThree();
  const [prof, setProf] = React.useState<{ w: number; h: number; d: Float32Array } | null>(null);
  const [h] = React.useState(() => delayRender("prof " + toma));
  const [tex, setTex] = React.useState<THREE.Texture | null>(null);
  React.useEffect(() => {
    const tl = new Promise<THREE.Texture>((res) => new THREE.TextureLoader().load(staticFile(F.img), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }));
    Promise.all([tl, cargaProf(staticFile(F.prof))]).then(([t, p]) => { setTex(t); setProf(p); requestAnimationFrame(() => continueRender(h)); });
  }, [F.img, F.prof, h]);
  // malla del relieve: cada vértice se mueve por su rayo según la profundidad
  const mesh = useMemo(() => {
    if (!prof || !tex) return null;
    const seg = [180, Math.round(180 * IH / IW)] as const;
    const g = new THREE.PlaneGeometry(PW, PH, seg[0], seg[1]), pos = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) { const w = mundo(uv.getX(i) * IW, (1 - uv.getY(i)) * IH, prof); pos.setXYZ(i, w.p.x, w.p.y, w.p.z); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); m.frustumCulled = false;
    return m;
  }, [prof, tex]);
  const pool = useMemo(() => new Pool(), []);
  const root = useMemo(() => new THREE.Group(), []);
  const actors = useMemo(() => [] as Actor[], []), fxs = useMemo(() => [] as Fx[], []), sombras = useMemo(() => [] as Sombra[], []);
  const luz = useMemo(() => { const g = new THREE.Group(); const sun = new THREE.DirectionalLight("#ffffff", 2.4); sun.position.set(-3, 6, 8); g.add(sun, sun.target, new THREE.HemisphereLight("#ffffff", "#806070", 0.4)); return g; }, []);
  const cam = camera as THREE.PerspectiveCamera, u = f / d, c = T.cam(u, f);
  cam.position.copy(c.pos); cam.lookAt(c.look); cam.fov = c.fov; cam.near = 0.05; cam.far = 200; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); cam.layers.enable(NOINK);
  scene.background = new THREE.Color("#000");
  const Lp = T.luz;
  TONE.uLitCol.value.set(...Lp.lit); TONE.uShadeCol.value.set(...Lp.shade); TONE.uShadeLift.value.set(...Lp.lift);
  CHAR.uCharTint.value.set(...Lp.charTint); CHAR.uCharShade.value = Lp.charShade; CHAR.uSideTint.value.set(...Lp.sideTint);
  CHAR.uGrad.value = Lp.charGrad; CHAR.uBodyGrad.value = Lp.bodyGrad;
  if (prof) {
    const sunDir = new THREE.Vector3(-0.3, 0.75, 0.6).normalize();
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), light = light2D(sunDir, right);
    const st: Stage = { places: [], fx: [] };
    /** pone un muñeco con los pies en el píxel (px, py) del fondo; alto = altura en píxeles de la imagen */
    const person = (key: string, o: Outfit, px: number, py: number, alto: number, opts: Parameters<typeof bodyFront>[2], i: number, salto = 0, dOv?: number) => {
      const w = mundo(px, py, prof, dOv), s = (alto / IH) * PH * w.k / 1.68;
      const dist = cam.position.distanceTo(w.p);
      const [tw, th, tk] = tier(dist / s * 0.9);
      const o2 = { ...opts, light, seed: (i * 5 + 3) % 7 + 1, blink: (f + i * 23) % 80 < 3 ? 1 : 0 };
      const draw = (p: Pen) => bodyFront(p, o, o2);
      st.places.push({ key: `${key}|${JSON.stringify(o2)}`, x: w.p.x, y: w.p.y + salto * s, z: w.p.z, size: [tw, th, tk], scale: s, draw });
      blob(st, sunDir, w.p.x, w.p.y, w.p.z, s * 1.1, 1.0);
    };
    const fxAt = (key: string, cw: number, ch: number, draw: (p: Pen) => void, px: number, py: number, wpx: number, hpx: number, dOv?: number) => {
      const w = mundo(px, py, prof, dOv), k = PH / IH * w.k;
      st.fx.push({ key, cw, ch, draw, x: w.p.x, y: w.p.y, z: w.p.z + 0.01, w: wpx * k, h: hpx * k });
    };
    const bt = f / (30 * 60 / BPM);
    if (toma === "tienda") {
            fxAt(`maq|${Math.floor(f / 3)}`, 512, 200, maquina(f * 0.02 + (u > 0.15 ? f * 0.05 : 0), Math.floor(f / 3.5) % 16), 1170, 1248, 300, 118, 0.205);
      person("guit", GUITARRISTA, 560, 1900, 720, { mode: "stand", expr: u > 0.55 ? "shock" : "smile", facing: 0, look: 1 }, 1);
    } else {
      person("dj", DJ, 730, 1445, 300, { mode: "stand", expr: "grin", facing: 0, wave: Math.sin(bt * Math.PI) }, 30, 0, 0.03);
      for (let i = 0; i < 24; i++) {
        const row = Math.floor(i / 6), col = i % 6;
        const py = 1600 + row * 85 + hh(i, 1) * 30, px = 240 + col * 190 + (row % 2) * 95 + (hh(i, 2) - 0.5) * 60;
        const dd = prof.d[Math.floor((py / IH) * prof.h) * prof.w + Math.floor((px / IW) * prof.w)];
        const alto = 300 * (0.62 + 1.25 * dd) / 0.679 * (0.9 + 0.2 * hh(i, 4));
        const ex: Expr = (["laugh", "grin", "shout", "smile_closed"] as Expr[])[i % 4];
        person(`b${i}`, bailarin(i), px, py, alto, { mode: "stand", expr: ex, facing: 0, wave: i % 2 ? Math.round(Math.sin(bt * Math.PI + i) * 2) / 2 : undefined, headTilt: Math.round(Math.sin(bt * Math.PI) * 2) * 3 },
          40 + i, Math.abs(Math.sin(Math.PI * (bt + hh(i, 3) * 0.3))) * 0.06);
      }
    }
    // ordenar de lejos a cerca y volcar
    st.places.sort((a, b) => a.z - b.z);
    let ai = 0;
    for (const p of st.places) {
      while (actors.length <= ai) actors.push(new Actor(root));
      const a = actors[ai++], [w, hh2, k] = p.size, s = p.scale ?? 1;
      a.r = pool.req(p.key, w, hh2, k, p.draw); a.mesh.visible = true; a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0); a.mesh.scale.set(s, s, s);
      a.mesh.renderOrder = 10 + ai;
    }
    for (let i = ai; i < actors.length; i++) actors[i].mesh.visible = false;
    let fi = 0;
    for (const p of st.fx) {
      while (fxs.length <= fi) fxs.push(new Fx(root));
      const e = fxs[fi++]; e.r = pool.req(p.key, p.cw, p.ch, 1, p.draw); e.use(!!p.soft); e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0); else e.mesh.rotation.set(0, 0, 0);
      e.mesh.scale.set(p.w, p.h, 1);
    }
    for (let i = fi; i < fxs.length; i++) fxs[i].mesh.visible = false;
    pool.flush(); for (let i = 0; i < ai; i++) actors[i].bind(); for (let i = 0; i < fi; i++) fxs[i].bind();
  }
  React.useEffect(() => { invalidate(); gl.render(scene, camera); });
  return (<>{mesh && <primitive object={mesh} />}<primitive object={root} /><primitive object={luz} /></>);
};

const dpr = () => (getInputProps() as { dpr?: number }).dpr;
const A = TL.tomas[0], B = TL.tomas[7];
export const P25_TOTAL = (A.b - A.a) + (B.b - B.a);
export const Prueba25D: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = React.useState(() => delayRender("fuentes"));
  React.useEffect(() => { document.fonts.ready.then(() => continueRender(h)); }, [h]);
  const dA = A.b - A.a, dB = B.b - B.a;
  // subtítulos: palabras de cada segmento, re-temporizadas a esta prueba
  const pal = [...TL.palabras.filter((w) => w.seg === 0), ...TL.palabras.filter((w) => w.seg === 7).map((w) => ({ ...w, a: w.a - B.a + dA, b: w.b - B.a + dA }))];
  const op = interpolate(f, [dA, dA + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={dA + 6}>
        <ThreeCanvas width={1080} height={1920} {...(dpr() ? { dpr: dpr() } : {})} flat linear={false} camera={{ fov: FOV0 }} gl={{ antialias: true }}><Escena toma="tienda" d={dA} /></ThreeCanvas>
        <Fecha texto="1981" f={f} d={dA} />
      </Sequence>
      <Sequence from={dA} durationInFrames={dB}>
        <AbsoluteFill style={{ opacity: op }}>
          <ThreeCanvas width={1080} height={1920} {...(dpr() ? { dpr: dpr() } : {})} flat linear={false} camera={{ fov: FOV0 }} gl={{ antialias: true }}><Escena toma="club" d={dB} /></ThreeCanvas>
          <Fecha texto="1987 · ACID TRACKS" f={f - dA} d={dB} />
        </AbsoluteFill>
      </Sequence>
      <Subtitulos f={f} palabras={pal} hasta={100000} />
      {!(getInputProps() as { mute?: boolean }).mute && <>
        <Sequence durationInFrames={dA}><Audio src={staticFile("mezcla_ep01.wav")} /></Sequence>
        <Sequence from={dA} durationInFrames={dB}><Audio src={staticFile("mezcla_ep01.wav")} startFrom={B.a} /></Sequence>
      </>}
    </AbsoluteFill>
  );
};
