"""Mezcla del ep. 1 v3: voz recortada + tramo del tema (drop alineado) + whoosh suave en cada corte de toma."""
import json, re, subprocess, numpy as np, soundfile as sf
SR = 48000
tl = json.load(open("datos/ep01_v3.json")); total = tl["total"] / 30
src = open("src/videos/ep01e/Ep01e.tsx").read()
cortes = sorted({int(x) for x in re.findall(r"\n  T\((\d+), \"", src)} - {0})
rng = np.random.default_rng(3)
fx = np.zeros(int(total * SR) + SR)
def whoosh(dur, f0, f1):
    n = int(dur * SR); x = rng.standard_normal(n)
    # filtro paso banda que barre de f0 a f1 (resonador de 2 polos)
    y = np.zeros(n); y1 = y2 = 0.0
    for i in range(n):
        f = f0 + (f1 - f0) * (i / n); r = 0.985; th = 2 * np.pi * f / SR
        yy = x[i] + 2 * r * np.cos(th) * y1 - r * r * y2; y2, y1 = y1, yy; y[i] = yy
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    y = y * env; return y / (np.max(np.abs(y)) + 1e-9)
for k, c in enumerate(cortes):
    t = c / 30 - 0.18
    if c == 1088: continue  # en el drop manda la música
    w = whoosh(0.34, 500 + 300 * (k % 3), 2600 + 400 * (k % 2)) * 0.22
    i = int(max(0, t) * SR); fx[i:i + len(w)] += w[: len(fx) - i]
sf.write("public/fx_ep01_v3.wav", fx[: int(total * SR)], SR)
DROP = 1088 / 30
S = 185.30 - DROP   # el golpe fuerte del tema (185,30 s) cae en «cuarta»
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-ss", str(S), "-t", f"{total:.3f}", "-i", "public/tema_3i_atlas.wav", "-i", "public/voz_ep01_v3.wav", "-i", "public/fx_ep01_v3.wav", "-filter_complex",
  "[1:a]aresample=48000,aformat=channel_layouts=stereo,highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-14:TP=-2:LRA=7,adelay=100|100,apad,asplit=2[voz][sc];"
  "[0:a]aresample=48000,volume=0.2[cama];[cama][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[duck];"
  f"[duck]volume='if(gt(t,{DROP:.3f}),2.0,if(gt(t,{DROP-0.32:.3f}),0.12,0.75))*if(gt(t,{tl['finVoz']/30:.2f}),min(1+(t-{tl['finVoz']/30:.2f})*4,2.2),1)':eval=frame[d2];"
  "[2:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.9[fx];"
  f"[d2][voz][fx]amix=inputs=3:duration=first:normalize=0,alimiter=limit=0.95,apad,atrim=0:{total:.3f}[m]", "-map", "[m]", "-ar", "48000", "public/mezcla_ep01_v3.wav"]
subprocess.run(cmd, check=True)
print("cortes con whoosh:", len(cortes) - 1, "· total", total)
# volumen final estático a -14 LUFS (sin compresión dinámica, para que el drop se note)
import json as _j, os
o = subprocess.run(["ffmpeg", "-i", "public/mezcla_ep01_v3.wav", "-af", "loudnorm=I=-14:TP=-1.5:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(_j.loads(o[o.rindex("{"):])["input_i"]); gain = -14 - I
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "public/mezcla_ep01_v3.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.89", "public/mezcla_ep01_v3b.wav"], check=True)
os.replace("public/mezcla_ep01_v3b.wav", "public/mezcla_ep01_v3.wav")
print("ganancia final", round(gain, 2), "dB")
