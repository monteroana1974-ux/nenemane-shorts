"""Línea de tiempo con anclas manuales por frase sobre la voz ORIGINAL y recorte de silencios propio
(cada pausa > MAXP se deja en KEEP s), trasladando los tiempos a la voz recortada.
Uso: python3 tiempos_manual.py guion.json voz_orig.mp3 anclas.json salida.json voz_agil.wav --bpm 130"""
import json, re, subprocess, math, argparse
import numpy as np, soundfile as sf, librosa
ap = argparse.ArgumentParser(); [ap.add_argument(x) for x in ("guion", "voz", "anclas", "salida", "agil")]
ap.add_argument("--bpm", type=float, required=True); ap.add_argument("--offset", type=float, default=0.1); ap.add_argument("--cierre", type=float, default=2.8)
a = ap.parse_args(); FPS = 30; MAXP, KEEP = 0.15, 0.12
ESP = {"1984": 8, "phuture": 2, "hardy": 2, "ron": 1, "acid": 2}
def sil(p):
    k = re.sub(r"[^\wáéíóúüñ]", "", p.lower()); return ESP.get(k, max(1, len(re.findall(r"[aeiouáéíóúü]+", k))))
g = json.load(open(a.guion, encoding="utf-8")); A = json.load(open(a.anclas))
out = subprocess.run(["ffmpeg", "-i", a.voz, "-af", "silencedetect=noise=-35dB:d=0.15", "-f", "null", "-"], capture_output=True, text=True).stderr
S = list(zip([float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)], [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]))
y, sr = librosa.load(a.voz, sr=48000, mono=True); dur = len(y) / sr
# recorte de silencios y mapa de tiempos original -> ágil
cortes = [(s + KEEP / 2, e - KEEP / 2) for s, e in S if e - s > MAXP and e < dur - 0.02]
trozos, t0 = [], 0.0
for s, e in cortes: trozos.append(y[int(t0 * sr):int(s * sr)]); t0 = e
trozos.append(y[int(t0 * sr):]); sf.write(a.agil, np.concatenate(trozos), sr)
def mapa(t):
    q = t
    for s, e in cortes:
        if t >= e: q -= (e - s)
        elif t > s: q -= (t - s)
    return q
# palabras: dentro de cada frase, repartidas por sílabas sobre los tramos con voz
words = []
for i, seg in enumerate(g["segmentos"]):
    ws = seg["texto"].split(); s0, s1 = A[i]
    habla = []; c = s0
    for s, e in S:
        if e <= s0 or s >= s1: continue
        if s > c: habla.append((c, s))
        c = max(c, e)
    if c < s1: habla.append((c, s1))
    tot_h = sum(e - s for s, e in habla); syl = [sil(w) for w in ws]; tot = sum(syl); acc = 0
    def at(fr):
        x = fr * tot_h
        for s, e in habla:
            if x <= e - s: return s + x
            x -= e - s
        return habla[-1][1]
    for w, k in zip(ws, syl):
        words.append({"t": w, "seg": i, "a": at(acc / tot), "b": at((acc + k) / tot)}); acc += k
off = a.offset; bar = 4 * 60 / a.bpm
fin = mapa(A[-1][1]); total_s = math.ceil((fin + off + a.cierre) / bar) * bar; total = round(total_s * FPS)
f = lambda t: int(round((mapa(t) + off) * FPS))
tomas = [{"id": s["toma"], "fecha": s["fecha"], "a": 0 if i == 0 else f(A[i][0]) - 2} for i, s in enumerate(g["segmentos"])]
cierre_a = round((fin + off) * FPS) + 8
for i, tm in enumerate(tomas): tm["b"] = tomas[i + 1]["a"] if i + 1 < len(tomas) else cierre_a
res = {"fps": FPS, "bpm": a.bpm, "total": total, "finVoz": round((fin + off) * FPS), "offsetVoz": off, "serie": g["serie"], "episodio": g["episodio"], "titulo": g["titulo"],
       "palabras": [{"t": w["t"], "seg": w["seg"], "a": f(w["a"]), "b": max(f(w["b"]), f(w["a"]) + 2)} for w in words],
       "tomas": tomas, "cierre": {"a": cierre_a, "b": total}}
json.dump(res, open(a.salida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"voz ágil {fin:.2f}s · total {total_s:.2f}s = {round(total_s / bar)} compases · {len(cortes)} pausas recortadas")
for tm in tomas: print(f"  {tm['id']:8s} {tm['a'] / 30:6.2f}s")
