// Mundo 3D del episodio TB-303 (prueba de estilo): tres decorados en un solo mundo three.js, posado por cuadro.
// Piezas del motor (MIT, LuisPa / Mr omi): materiales de dos tonos, texturas pintadas, personajes como tarjetas
// iluminadas con sombra de contacto, tinta del mundo. Lo nuevo: interiores (tienda y club), calle de noche, la
// máquina en 3D de verdad, pista de baile con luces que laten al BPM, haces de luz y gente bailando.
import * as THREE from "three";
import { Pen, bodyFront, Outfit, Expr, SKINS } from "../../motor3d/toon";
import { Pool, Actor, Fx, Stage, tier, light2D, blob } from "../../motor3d/troop";
import { NOINK } from "../../motor3d/ink";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../../motor3d/lights";
import { TONE, CHAR, twoTone, untone } from "../../motor3d/shade";
import { planksHD, brick, ctex, rep, rng } from "../../motor3d/paint";
import { FPS, SHOTS, SET, Luz, camAt, kidsZ, gait, beatAt, pulse } from "./story";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const lam = (p: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(p));
const glow = (r: number, g: number, b: number) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), fog: false }); return m; };

// ---------------- luces por decorado ----------------
const PRESET: Record<Luz, LightPreset> = {
  tienda: { ...LIGHTS.golden, el: 58, lit: [1.5, 1.12, 0.74], shade: [0.42, 0.28, 0.22], lift: [0.1, 0.06, 0.04], term: 0.12,
    charTint: [1.0, 0.9, 0.78], charShade: 0.86, sideTint: [0.9, 0.84, 0.9], fog: "#3a2418", sunCol: "#ffcf98", sunI: 3.0,
    sky: "#c8a090", ground: "#5a3a30", hemiI: 0.4, actorShadow: false, bias: -0.0004, normalBias: 0.02 },
  noche: { ...LIGHTS.day, el: 34, lit: [0.62, 0.74, 1.3], shade: [0.1, 0.1, 0.25], lift: [0.03, 0.03, 0.1], term: 0.15,
    charTint: [0.8, 0.86, 1.08], charShade: 0.78, sideTint: [0.78, 0.8, 1.0], fog: "#221b44", sunCol: "#a8baff", sunI: 2.2,
    sky: "#5060a0", ground: "#30283c", hemiI: 0.35, actorShadow: false, bias: -0.0004, normalBias: 0.02 },
  club: { ...LIGHTS.golden, el: 62, lit: [1.32, 0.56, 1.28], shade: [0.1, 0.06, 0.24], lift: [0.04, 0.02, 0.1], term: 0.12,
    charTint: [1.0, 0.74, 1.0], charShade: 0.8, sideTint: [0.7, 0.85, 1.0], fog: "#1a0e2c", sunCol: "#ff8ae0", sunI: 3.0,
    sky: "#603070", ground: "#201030", hemiI: 0.35, actorShadow: false, bias: -0.0004, normalBias: 0.02 },
};
const SKY: Record<Luz, WorldLook> = {
  tienda: { ...LOOK.golden, sky: { c: ["#3a2430", "#3a2430", "#3a2430", "#3a2430", "#3a2430"], e: [0, 4, 10, 20, 40] }, sat: 1.0 },
  noche: { ...LOOK.day, sky: { c: ["#4a3a72", "#33296a", "#221d55", "#151440", "#0a0a26"], e: [0, 4, 12, 24, 50] }, sat: 0.95 },
  club: { ...LOOK.golden, sky: { c: ["#120a1e", "#120a1e", "#120a1e", "#120a1e", "#120a1e"], e: [0, 4, 10, 20, 40] }, sat: 1.05 },
};

// ---------------- reparto ----------------
const GUITARRISTA: Outfit = { jacket: "#2f5d9e", pants: "#2d3550", boots: "#3a2a20", hat: "hair", hair: "#6b3b1e", skin: SKINS[0] };
const VENDEDOR: Outfit = { jacket: "#a8432f", pants: "#3b3f52", boots: "#2a2020", hat: "hair", hair: "#2b1d1a", skin: SKINS[1], moustache: "#2b1d1a", build: "stout" };
const CHAVALES: Outfit[] = [
  { jacket: "#e0a43a", pants: "#2d3550", boots: "#f4f1ea", hat: "cap", cap: "#d33a3a", skin: SKINS[3] },
  { jacket: "#3f9a62", pants: "#22283a", boots: "#f4f1ea", hat: "hair", hair: "#1b1414", skin: "#8a5a3c" },
  { jacket: "#c2452f", pants: "#2d3550", boots: "#1b1414", hat: "cap", cap: "#2f5d9e", skin: "#6e4430" },
];
const ROPA = ["#e0a43a", "#3f9a62", "#c2452f", "#2f5d9e", "#d64fb4", "#5ad0c8", "#f1d06a", "#8a5ac9"];
const PIEL = [SKINS[0], SKINS[1], SKINS[3], "#8a5a3c", "#6e4430", SKINS[2]];
const PELO = ["#2b1d1a", "#6b3b1e", "#1b1414", "#c9a06b", "#3a2a20"];
const bailarin = (i: number): Outfit => ({
  jacket: ROPA[i % ROPA.length], pants: ["#22283a", "#2d3550", "#3b3f52"][i % 3], boots: i % 2 ? "#f4f1ea" : "#1b1414",
  hat: i % 3 === 0 ? "cap" : "hair", cap: ROPA[(i + 3) % ROPA.length], hair: PELO[i % PELO.length], skin: PIEL[(i * 5) % PIEL.length],
});
const DJ: Outfit = { jacket: "#3f9a62", pants: "#22283a", boots: "#1b1414", hat: "cap", cap: "#111111", skin: "#8a5a3c" };

// ---------------- texturas pintadas ----------------
const paredTienda = () => ctex("paredTienda", 2048, 1024, (g, r) => {
  g.fillStyle = "#b5694a"; g.fillRect(0, 0, 2048, 1024);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,220,190" : "70,30,20"},0.06)`; g.beginPath(); g.ellipse(r() * 2048, r() * 1024, 30 + r() * 90, 15 + r() * 40, 0, 0, 7); g.fill(); }
  // zócalo de madera
  g.fillStyle = "#5e3522"; g.fillRect(0, 700, 2048, 324);
  for (let x = 0; x < 2048; x += 128) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x, 700, 5, 324); }
  g.fillStyle = "#3e2216"; g.fillRect(0, 690, 2048, 18);
  // carteles de conciertos inventados
  const cols = [["#e0a43a", "#c2452f"], ["#2f5d9e", "#f1d06a"], ["#3f9a62", "#1d1630"], ["#d64fb4", "#ffe9b0"], ["#f1d06a", "#2f5d9e"]];
  for (let k = 0; k < 7; k++) {
    const x = 90 + k * 280 + r() * 30, y = 150 + r() * 120, w = 170, h = 240, [a, b] = cols[k % 5];
    g.save(); g.translate(x + w / 2, y + h / 2); g.rotate((r() - 0.5) * 0.12);
    g.fillStyle = a; g.fillRect(-w / 2, -h / 2, w, h);
    g.fillStyle = b; g.beginPath(); g.arc(0, -20, 52, 0, 7); g.fill();
    g.fillRect(-60, 60, 120, 16); g.fillRect(-45, 88, 90, 10);
    g.strokeStyle = "#241726"; g.lineWidth = 6; g.strokeRect(-w / 2, -h / 2, w, h);
    g.restore();
  }
});
const frenteAmpli = () => ctex("ampli", 512, 512, (g) => {
  g.fillStyle = "#1e1a1c"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#3a3236"; for (let y = 120; y < 500; y += 10) for (let x = 20; x < 492; x += 10) g.fillRect(x, y, 6, 6);
  g.fillStyle = "#c9b07a"; g.fillRect(0, 0, 512, 90);
  for (let k = 0; k < 6; k++) { g.fillStyle = "#1e1a1c"; g.beginPath(); g.arc(60 + k * 75, 45, 18, 0, 7); g.fill(); }
  g.fillStyle = "#f4efe2"; g.font = "bold 46px sans-serif"; g.fillText("~", 440, 60);
});
const fachadaNoche = (k: number, wm: number, hm: number) => ctex("facN" + k, Math.round(wm * 40), Math.round(hm * 40), (g, r) => {
  const W = Math.round(wm * 40), H = Math.round(hm * 40);
  g.fillStyle = g.createPattern(brick().image as HTMLCanvasElement, "repeat")!; g.fillRect(0, 0, W, H);
  g.fillStyle = ["rgba(40,20,60,0.45)", "rgba(20,30,60,0.5)", "rgba(60,30,30,0.4)"][k % 3]; g.fillRect(0, 0, W, H);
  const floors = Math.floor(hm / 3.2), nWin = Math.max(1, Math.floor(wm / 2.4));
  for (let fl = 0; fl < floors; fl++) for (let i = 0; i < nWin; i++) {
    const cx = ((i + 0.5) * W) / nWin, y0 = H - (fl + 1) * 3.2 * 40 + 30, ww = 1.0 * 40, wh = 1.6 * 40;
    const on = r() > 0.45;
    g.fillStyle = "#14101c"; g.fillRect(cx - ww / 2 - 5, y0 - 5, ww + 10, wh + 10);
    if (on) { const gr = g.createLinearGradient(0, y0, 0, y0 + wh); gr.addColorStop(0, "#ffe7a0"); gr.addColorStop(1, "#f0a040"); g.fillStyle = gr; }
    else g.fillStyle = "#2a2850";
    g.fillRect(cx - ww / 2, y0, ww, wh);
    g.fillStyle = "#14101c"; g.fillRect(cx - 2, y0, 4, wh); g.fillRect(cx - ww / 2, y0 + wh / 2 - 2, ww, 4);
  }
  // escaleras de incendios
  g.strokeStyle = "#0e0c14"; g.lineWidth = 4;
  for (let fl = 1; fl < floors; fl++) { const y = H - fl * 3.2 * 40; g.strokeRect(W * 0.2, y - 10, W * 0.6, 8); for (let x = W * 0.2; x < W * 0.8; x += 14) { g.beginPath(); g.moveTo(x, y - 10); g.lineTo(x, y - 40); g.stroke(); } g.beginPath(); g.moveTo(W * 0.2, y - 40); g.lineTo(W * 0.8, y - 40); g.stroke(); }
});
const asfalto = () => ctex("asfalto", 512, 512, (g, r) => {
  g.fillStyle = "#3a3646"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? "rgba(20,18,26,0.35)" : "rgba(110,104,130,0.18)"; g.fillRect(r() * 512, r() * 512, 2 + r() * 3, 2 + r() * 3); }
});
const paredClub = () => ctex("paredClub", 1024, 512, (g, r) => {
  g.fillStyle = "#1c1030"; g.fillRect(0, 0, 1024, 512);
  for (let x = 0; x < 1024; x += 64) { g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x, 0, 6, 512); }
  for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(255,255,255,0.03)"; g.fillRect(r() * 1024, r() * 512, 60, 3); }
});
const frenteAltavoz = () => ctex("altavoz", 512, 1024, (g) => {
  g.fillStyle = "#141018"; g.fillRect(0, 0, 512, 1024);
  for (const [y, rad] of [[200, 150], [560, 190], [880, 90]] as const) {
    g.fillStyle = "#2a2430"; g.beginPath(); g.arc(256, y, rad, 0, 7); g.fill();
    g.fillStyle = "#0a080c"; g.beginPath(); g.arc(256, y, rad * 0.62, 0, 7); g.fill();
    g.fillStyle = "#3a3440"; g.beginPath(); g.arc(256, y, rad * 0.2, 0, 7); g.fill();
  }
});
const frenteCabina = () => ctex("cabina", 1024, 384, (g) => {
  g.fillStyle = "#2a1a40"; g.fillRect(0, 0, 1024, 384);
  const gr = g.createLinearGradient(0, 0, 1024, 0); gr.addColorStop(0, "#7dff6a"); gr.addColorStop(0.5, "#ff4fd8"); gr.addColorStop(1, "#4fd8ff");
  g.fillStyle = gr; g.fillRect(0, 40, 1024, 18); g.fillRect(0, 320, 1024, 10);
  g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 6; for (let x = 0; x < 1024; x += 128) { g.beginPath(); g.moveTo(x, 70); g.lineTo(x, 310); g.stroke(); }
});
const panelMaquina = () => ctex("panel303", 1024, 512, (g) => {
  g.fillStyle = "#c9ced6"; g.fillRect(0, 0, 1024, 512);
  g.fillStyle = "#2c2f36"; g.fillRect(30, 30, 964, 210);
  g.fillStyle = "#f1f2f4"; g.fillRect(30, 262, 964, 26);
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 4 === 0 ? "#f2f2f2" : "#3b3f47"; g.fillRect(40 + i * 60, 320, 50, 150); g.strokeStyle = "#141018"; g.lineWidth = 4; g.strokeRect(40 + i * 60, 320, 50, 150); }
});
// tarjetas planas de efectos
const guitarra = (col: string) => (p: Pen) => { // 256 x 512, colgada de la pared
  p.poly([[118, 20], [138, 20], [138, 300], [118, 300]], "#c9a06b", 4);
  p.poly([[104, 0], [152, 0], [152, 50], [104, 50]], "#2a2220", 4);
  p.poly([[60, 290], [40, 360], [70, 420], [50, 470], [128, 505], [206, 470], [186, 420], [216, 360], [196, 290], [128, 300]], col, 6);
  p.poly([[96, 380], [160, 380], [160, 396], [96, 396]], "#eee", 3);
  p.ell(128, 440, 10, 10, "#222", 0);
};
const charco = (col: string) => (p: Pen) => { // 256 x 256 resplandor en el suelo
  const g = p.g, gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
};

// ---------------- la máquina en 3D ----------------
class Maquina {
  g = new THREE.Group(); knobs: THREE.Mesh[] = []; keys: THREE.Mesh[] = []; led: THREE.Mesh;
  private keyOn = glow(2.6, 0.5, 0.25); private keyOff: THREE.Material[];
  constructor(parent: THREE.Object3D, s = 1) {
    const W = 0.72 * s, D = 0.36 * s, H = 0.09 * s;
    const top = lam({ map: panelMaquina(), color: "#ffffff" }), side = lam({ color: "#9aa1ab" });
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [side, side, top, side, side, side]);
    body.position.y = H / 2; body.castShadow = true; body.receiveShadow = true; this.g.add(body);
    const knobM = lam({ color: "#e6e8ec" });
    for (let i = 0; i < 7; i++) {
      const k = new THREE.Mesh(new THREE.CylinderGeometry(0.026 * s, 0.03 * s, 0.035 * s, 20), knobM);
      k.position.set(-W / 2 + 0.075 * s + i * 0.095 * s, H + 0.017 * s, -D / 2 + 0.085 * s); k.castShadow = true;
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.006 * s, 0.004 * s, 0.024 * s), lam({ color: "#141018" }));
      mark.position.set(0, 0.019 * s, -0.012 * s); k.add(mark);
      this.knobs.push(k); this.g.add(k);
    }
    this.keyOff = [lam({ color: "#f2f2f2" }), lam({ color: "#3b3f47" })];
    for (let i = 0; i < 16; i++) {
      const k = new THREE.Mesh(new THREE.BoxGeometry(0.034 * s, 0.012 * s, 0.075 * s), this.keyOff[i % 4 === 0 ? 0 : 1]);
      k.position.set(-W / 2 + 0.05 * s + i * 0.0415 * s, H + 0.006 * s, D / 2 - 0.08 * s); this.keys.push(k); this.g.add(k);
    }
    this.led = new THREE.Mesh(new THREE.SphereGeometry(0.012 * s, 12, 8), glow(3, 0.3, 0.2));
    this.led.position.set(W / 2 - 0.04 * s, H + 0.008 * s, -D / 2 + 0.04 * s); this.g.add(this.led);
    parent.add(this.g);
  }
  pose(f: number, giro: number, vivo: boolean) {
    this.knobs.forEach((k, i) => { k.rotation.y = -2.2 + ((giro * (1 + i * 0.37) + i * 0.7) % 4.4); });
    const step = Math.floor(f / 3.5) % 16;
    this.keys.forEach((k, i) => { k.material = vivo && i === step ? this.keyOn : this.keyOff[i % 4 === 0 ? 0 : 1]; });
    (this.led.material as THREE.MeshBasicMaterial).color.setRGB(vivo && Math.floor(f / 7) % 2 === 0 ? 3 : 0.4, 0.25, 0.2);
  }
}

// ---------------- mundo ----------------
export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#000000", 20, 200);
  private sunCache = new Map<number, THREE.Vector3>();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();
  private m303: Maquina; private m303b: Maquina; private m303c: Maquina;
  private tiles: THREE.MeshBasicMaterial[] = []; private beams: THREE.Mesh[] = [];
  private kidBox: THREE.Group;
  constructor() {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 0.5);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);
    const box = (w: number, h: number, d: number, m: THREE.Material | THREE.Material[], x: number, y: number, z: number, cast = true) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = cast; b.receiveShadow = true; R.add(b); return b;
    };

    // ===== TIENDA DE MÚSICA (1981) =====
    {
      const X = SET.tienda;
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2), lam({ map: rep(planksHD(), 3, 3), color: "#d8a070" }));
      suelo.position.set(X, 0, 0); suelo.receiveShadow = true; R.add(suelo);
      const pared = lam({ map: paredTienda(), color: "#ffffff" });
      box(12, 4, 0.2, pared, X, 2, -3.2, false);
      const lado = lam({ map: rep(paredTienda(), 0.6, 1), color: "#e8d0c0" });
      box(0.2, 4, 10, lado, X - 4.2, 2, 1.5, false);
      box(0.2, 4, 10, lado, X + 4.6, 2, 1.5, false);
      // mesa y la máquina nueva
      const madera = lam({ color: "#7a4a2c" }), oscura = lam({ color: "#4a2c1c" });
      box(1.7, 0.07, 0.95, madera, X + 1.2, 0.86, -0.55);
      for (const [dx, dz] of [[-0.78, -0.4], [0.78, -0.4], [-0.78, 0.4], [0.78, 0.4]]) box(0.07, 0.83, 0.07, oscura, X + 1.2 + dx, 0.415, -0.55 + dz);
      this.m303 = new Maquina(R); this.m303.g.position.set(X + 1.2, 0.895, -0.55); this.m303.g.rotation.y = -0.12;
      // amplis y estanterías
      const ampF = lam({ map: frenteAmpli(), color: "#ffffff" }), ampL = lam({ color: "#241e20" });
      for (const [x, z, s] of [[-2.6, -2.5, 1.0], [-1.5, -2.6, 0.8], [3.4, -2.4, 1.1], [3.6, -1.2, 0.7]] as const) {
        const a = box(0.9 * s, 0.9 * s, 0.5 * s, [ampL, ampL, ampL, ampL, ampF, ampL], X + x, 0.45 * s, z); a.rotation.y = x > 0 ? -0.4 : 0.15;
      }
      box(3.2, 0.06, 0.4, madera, X - 1.6, 2.6, -2.95, false);
      for (let k = 0; k < 6; k++) box(0.34, 0.24 + hh(k) * 0.2, 0.3, lam({ color: ["#c2452f", "#2f5d9e", "#e0a43a", "#3f9a62"][k % 4] }), X - 2.9 + k * 0.52, 2.75, -2.95);
      // lámpara colgante
      const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.28, 24, 1, true), lam({ color: "#2f4a3a", side: THREE.DoubleSide }));
      lamp.position.set(X + 1.2, 2.55, -0.55); R.add(lamp);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 10), glow(4, 3, 1.6)); bulb.position.set(X + 1.2, 2.45, -0.55); bulb.layers.set(NOINK); R.add(bulb);
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4), lam({ color: "#111" })); cable.position.set(X + 1.2, 3.35, -0.55); R.add(cable);
    }

    // ===== CHICAGO DE NOCHE =====
    {
      const X = SET.chicago;
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(14, 260).rotateX(-Math.PI / 2), lam({ map: rep(asfalto(), 6, 110), color: "#ffffff" }));
      suelo.position.set(X, 0, -90); suelo.receiveShadow = true; R.add(suelo);
      const acera = lam({ color: "#5a5468" });
      box(3, 0.16, 260, acera, X - 5.5, 0.08, -90, false); box(3, 0.16, 260, acera, X + 5.5, 0.08, -90, false);
      const raya = glow(0.9, 0.75, 0.3);
      for (let z = 10; z > -200; z -= 6) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 2.6).rotateX(-Math.PI / 2), raya); m.position.set(X, 0.012, z); m.layers.set(NOINK); R.add(m); }
      let z = 12;
      for (let k = 0; z > -200; k++) {
        const w = 7 + hh(k, 1) * 6, h = 12 + hh(k, 2) * 26;
        for (const sd of [-1, 1]) {
          const hm = h * (0.7 + hh(k, sd + 5) * 0.6), d = 8;
          const fac = lam({ map: fachadaNoche(k * 2 + (sd > 0 ? 1 : 0), w, hm), color: "#ffffff" }), dark = lam({ color: "#241e34" });
          const mats = sd < 0 ? [fac, dark, dark, dark, dark, dark] : [dark, fac, dark, dark, dark, dark];
          box(d, hm, w, mats, X + sd * (7 + d / 2), hm / 2, z - w / 2, false);
          // cornisa
          box(d + 0.4, 0.5, w + 0.2, lam({ color: "#3a3048" }), X + sd * (7 + d / 2), hm + 0.25, z - w / 2, false);
        }
        z -= w + 0.4;
      }
      // farolas
      const poste = lam({ color: "#20202a" });
      for (let k = 0; k < 9; k++) for (const sd of [-1, 1]) {
        const zz = 6 - k * 14 - (sd > 0 ? 7 : 0), xx = X + sd * 5.2;
        box(0.14, 5, 0.14, poste, xx, 2.5, zz, false);
        box(1.2, 0.1, 0.12, poste, xx - sd * 0.55, 5, zz, false);
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), glow(4, 3.2, 1.6)); b.position.set(xx - sd * 1.1, 4.85, zz); b.layers.set(NOINK); R.add(b);
      }
      // la luna
      const luna = new THREE.Mesh(new THREE.CircleGeometry(16, 48), glow(2.2, 2.1, 1.8)); luna.position.set(X + 60, 150, -500); luna.lookAt(X, 0, 30); luna.layers.set(NOINK); R.add(luna);
      // la caja que llevan los chavales
      this.kidBox = new THREE.Group(); R.add(this.kidBox);
      this.m303b = new Maquina(this.kidBox, 0.9);
    }

    // ===== CLUB (1987) =====
    {
      const X = SET.club;
      const negro = lam({ color: "#1a1424" });
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(30, 40).rotateX(-Math.PI / 2), negro); suelo.position.set(X, 0, 0); suelo.receiveShadow = true; R.add(suelo);
      // pista: baldosas que laten
      for (let i = 0; i < 10; i++) for (let j = 0; j < 12; j++) {
        const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.1, 0.05, 0.15) }); this.tiles.push(m);
        const t = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 1.12).rotateX(-Math.PI / 2), m);
        t.position.set(X - 5.4 + i * 1.2, 0.01, -3.6 + j * 1.2); t.layers.set(NOINK); R.add(t);
      }
      const pc = lam({ map: rep(paredClub(), 3, 1), color: "#ffffff" });
      box(30, 9, 0.3, pc, X, 4.5, -8, false); box(0.3, 9, 40, pc, X - 9, 4.5, 6, false); box(0.3, 9, 40, pc, X + 9, 4.5, 6, false);
      // tiras de neón en las paredes
      for (const [c, y] of [[[0.5, 3, 0.4], 3.2], [[3, 0.4, 2.4], 5.4]] as const) {
        const n = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.08, 0.08), glow(c[0], c[1], c[2])); n.position.set(X, y, -7.8); n.layers.set(NOINK); R.add(n);
        for (const sd of [-1, 1]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 30), glow(c[0], c[1], c[2])); s.position.set(X + sd * 8.8, y, 7); s.layers.set(NOINK); R.add(s); }
      }
      // cabina del DJ
      const cab = lam({ map: frenteCabina(), color: "#ffffff" }), cabL = lam({ color: "#2a1a40" });
      box(3.4, 1.12, 1.1, [cabL, cabL, cabL, cabL, cab, cabL], X, 0.56, -5.2);
      box(3.6, 0.06, 1.25, lam({ color: "#0e0a14" }), X, 1.15, -5.2);
      this.m303c = new Maquina(R, 0.85); this.m303c.g.position.set(X + 0.5, 1.18, -5.1); this.m303c.g.rotation.y = 0.15;
      const plato = lam({ color: "#26222c" });
      for (const dx of [-1.15, -0.45]) { const p = box(0.55, 0.08, 0.45, plato, X + dx, 1.22, -5.15); p.castShadow = false; const v = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.012, 32), lam({ color: "#0a0a0e" })); v.position.set(X + dx, 1.27, -5.15); R.add(v); }
      // altavoces
      const altF = lam({ map: frenteAltavoz(), color: "#ffffff" }), altL = lam({ color: "#141018" });
      for (const sd of [-1, 1]) for (const y of [1.25, 3.6]) box(1.4, 2.4, 1.0, [altL, altL, altL, altL, altF, altL], X + sd * 3.4, y, -5.6);
      // haces de luz desde el techo
      for (let k = 0; k < 6; k++) {
        const geo = new THREE.ConeGeometry(1.4, 9, 24, 1, true); geo.translate(0, -4.5, 0);
        const col = geo.attributes.position, cs: number[] = [];
        for (let i = 0; i < col.count; i++) { const a = (col.getY(i) + 9) / 9; cs.push(a, a, a); }
        geo.setAttribute("color", new THREE.Float32BufferAttribute(cs, 3));
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
        m.position.set(X - 6 + k * 2.4, 8.6, -6.5); m.layers.set(NOINK); m.renderOrder = 6; this.beams.push(m); R.add(m);
      }
    }
  }
  /** sol relativo a la cámara, fijo por toma */
  private shotSun(id: number) {
    let v = this.sunCache.get(id);
    if (v) return v;
    const s = SHOTS[id - 1], L = PRESET[s.luz];
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) { const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(s.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const S = SHOTS[id - 1], L = PRESET[S.luz], K = SKY[S.luz], t = f / FPS;
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 1200; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const focus = V(...c.look), dist = cam.position.distanceTo(focus), sunDir = this.shotSun(id);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.2 + 6, 8, 40);
    this.sun.position.copy(focus).addScaledVector(sunDir, 100); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 5; sc.far = 260; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce);
    TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color);
    if (S.luz === "noche") { this.fog.near = 30; this.fog.far = 220; } else { this.fog.near = 12; this.fog.far = 60; }
    scene.fog = this.fog; scene.background = null;

    // ---- animación del mundo ----
    const pl = pulse(f), bt = beatAt(f);
    this.m303.pose(f, t * 0.4, f > 20);
    this.m303c.pose(f, t * 3.2, true);
    const kz = kidsZ(f);
    this.kidBox.position.set(SET.chicago + 0.05, 1.02, kz + 0.42); this.kidBox.rotation.set(0.25, 0.05, 0);
    this.m303b.pose(f, 0, false);
    const COLS = [[0.2, 1.6, 0.3], [1.6, 0.2, 1.2], [0.2, 1.0, 1.6], [1.6, 1.2, 0.2]];
    this.tiles.forEach((m, k) => {
      const i = Math.floor(k / 12), j = k % 12, on = (Math.floor(bt) + i + j * 2) % 4 === 0;
      const cc = COLS[(i + j + Math.floor(bt / 4)) % 4], a = on ? 0.35 + 0.65 * pl : 0.06;
      m.color.setRGB(cc[0] * a + 0.04, cc[1] * a + 0.02, cc[2] * a + 0.06);
    });
    this.beams.forEach((b, k) => {
      b.rotation.set(0.35 * Math.sin(t * 0.9 + k * 1.3) + 0.25, 0, 0.45 * Math.sin(t * 0.7 + k * 2.1));
      const cc = COLS[(k + Math.floor(bt / 2)) % 4];
      (b.material as THREE.MeshBasicMaterial).color.setRGB(cc[0] * 0.6, cc[1] * 0.6, cc[2] * 0.6);
    });

    // ---- reparto ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const light = light2D(sunDir, right);
    const st: Stage = { places: [], fx: [] };
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const lidAt = (i: number) => {
      let s = Math.round(-60 * hh(i, 9));
      for (let n = 0; s <= f && n < 80; n++) { const k = f - s; if (k >= 0 && k < 4) return [0.5, 1, 1, 0.5][k]; s += Math.round(15 + 54 * hh(i * 31 + n, 13)); }
      return 0;
    };
    const visible = (x: number, y: number, z: number, r: number) => this.frustum.intersectsSphere(this.sph.set(this.v.set(x, y, z), r));
    const person = (who: string, o: Outfit, x: number, y: number, z: number, opts: Parameters<typeof bodyFront>[2], i: number, contact = true) => {
      if (!visible(x, y + 1.1, z, 2.5)) return;
      const d = cam.position.distanceTo(this.v.set(x, y + 1.2, z));
      if (d < 1.7) return;
      const [w, h, k] = tier(d), near = d < 16;
      const o2 = { ...opts, light, seed: (i * 5 + 3) % 7 + 1, blink: near ? lidAt(i) : 0 };
      st.places.push({ key: `${who}|${JSON.stringify(o2)}`, x, y, z, size: [w, h, k], draw: (p) => bodyFront(p, o, o2) });
      if (contact && d < 40) blob(st, sunDir, x, Math.max(0, y - 0.0), z);
    };
    if (id === 1) {
      const X = SET.tienda;
      const asombro = f > 70;
      person("guit", GUITARRISTA, X + 0.3, 0, -0.1, { mode: "stand", expr: asombro ? "shock" : "smile", facing: 0, look: 1 }, 1);
      person("vend", VENDEDOR, X + 2.55, 0, -1.6, { mode: "stand", expr: "grin", facing: 0, look: -1 }, 2);
      for (const [k, x, col] of [[0, -2.2, "#d8432f"], [1, -0.9, "#3d6fb6"], [2, 0.5, "#f0b43c"], [3, 2.6, "#2b8a5a"]] as const)
        st.fx.push({ key: `guit|${k}`, cw: 256, ch: 512, draw: guitarra(col), x: X + x, y: 1.75, z: -3.05, w: 0.55, h: 1.1 });
      st.fx.push({ key: "charcoT", cw: 256, ch: 256, draw: charco("rgba(255,200,120,0.55)"), x: X + 1.2, y: 0.02, z: -0.4, w: 3.4, h: 3.0, flat: true, soft: true });
    }
    if (id === 2) {
      const X = SET.chicago, ph = gait(t, 1.0);
      const exprs: Expr[] = ["grin", "laugh", "smile"];
      CHAVALES.forEach((o, k) => person(`kid${k}`, o, X - 0.75 + k * 0.75, 0, kz - (k === 1 ? 0 : 0.3), { mode: "march", phase: (ph + k * 0.33) % 1, expr: exprs[k], facing: 0, lift: 40 }, 10 + k));
      for (let k = 0; k < 9; k++) for (const sd of [-1, 1]) {
        const zz = 6 - k * 14 - (sd > 0 ? 7 : 0);
        st.fx.push({ key: "charcoN", cw: 256, ch: 256, draw: charco("rgba(255,200,110,0.5)"), x: X + sd * 5.2 - sd * 1.1, y: 0.03, z: zz, w: 5, h: 5, flat: true, soft: true });
      }
    }
    if (id === 3) {
      const X = SET.club;
      person("dj", DJ, X + 0.3, 0.35, -5.75, { mode: "stand", expr: "grin", facing: 0, wave: Math.sin(bt * Math.PI) }, 30, false);
      const r = rng(7);
      for (let i = 0; i < 46; i++) {
        const x = X - 6 + (i % 9) * 1.45 + (r() - 0.5) * 0.6, z = -3.4 + Math.floor(i / 9) * 1.5 + (r() - 0.5) * 0.5;
        const sal = Math.abs(Math.sin(Math.PI * (bt + hh(i, 3) * 0.3))) * 0.1;
        const ex: Expr = (["laugh", "grin", "shout", "smile_closed"] as Expr[])[i % 4];
        person(`b${i}`, bailarin(i), x, sal, z, { mode: "stand", expr: ex, facing: 0, wave: i % 2 ? Math.round(Math.sin(bt * Math.PI + i) * 2) / 2 : undefined, headTilt: Math.round(Math.sin(bt * Math.PI) * 2) * 3 }, 40 + i);
      }
    }
    // ---- volcar a mallas ----
    let ai = 0;
    for (const p of st.places) {
      const a = this.actor(ai++), [w, h, k] = p.size, s = p.scale ?? 1;
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true; a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0);
      a.mesh.scale.set(p.mirror ? -s : s, s, s);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    for (const p of st.fx) {
      if (!visible(p.x, p.y, p.z, Math.max(p.w, p.h))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft); e.mesh.visible = true; e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else e.mesh.rotation.set(0, 0, 0);
      e.mesh.scale.set(p.w, p.h, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (let i = 0; i < ai; i++) this.actors[i].bind();
    for (let i = 0; i < fi; i++) this.fxs[i].bind();
    return focus;
  }
}
