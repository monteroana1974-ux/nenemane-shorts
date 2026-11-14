"""Línea de tiempo desde la voz real: las pausas que detecta ffmpeg anclan los finales de frase/coma del guion,
y entre anclas las palabras se reparten por sílabas. Total redondeado a compases enteros del BPM del tema.
Uso: python3 tiempos_voz.py guion.json voz.mp3 salida.json --bpm 130 --offset 0.1
"""
import json, re, subprocess, math, argparse, sys
sys.path.insert(0, "herramientas")
ap = argparse.ArgumentParser(); ap.add_argument("guion"); ap.add_argument("voz"); ap.add_argument("salida")
ap.add_argument("--bpm", type=float, required=True); ap.add_argument("--offset", type=float, default=0.1); ap.add_argument("--cierre", type=float, default=2.6); ap.add_argument("--dmin", type=float, default=0.18)
a = ap.parse_args()
FPS = 30
ESP = {"1981": 8, "1984": 8, "1987": 8, "phuture": 2, "hardy": 2, "ron": 1, "acid": 2, "4:00": 3, "tracks": 1, "house": 1, "acid": 2, "roland": 2}
def sil(p):
    k = re.sub(r"[^\wáéíóúüñ]", "", p.lower())
    return ESP.get(k, 2 * len(k) if k.isdigit() else max(1, len(re.findall(r"[aeiouáéíóúü]+", k))))
g = json.load(open(a.guion, encoding="utf-8"))
ws = [{"t": w, "seg": i, "s": sil(w)} for i, s in enumerate(g["segmentos"]) for w in s["texto"].split()]
out = subprocess.run(["ffmpeg", "-i", a.voz, "-af", "silencedetect=noise=-35dB:d=" + str(a.dmin), "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.voz], capture_output=True, text=True).stdout)
pausas = [(s, e) for s, e in zip(st, en) if e < dur - 0.05]
fin_voz = st[-1] if st and en[-1] >= dur - 0.05 else dur
# estimación por sílabas con pausas en la puntuación, escalada a la duración real
PA = {".": 0.32, "?": 0.4, ":": 0.22, ",": 0.12, ";": 0.18}
t = 0; est = []
for w in ws:
    d = w["s"] / 6.0; est.append([t, t + d]); t += d + PA.get(w["t"][-1], 0)
k = fin_voz / est[-1][1]; est = [[x * k, y * k] for x, y in est]
# anclar cada pausa al final de palabra con puntuación más cercano (orden creciente)
cand = [i for i, w in enumerate(ws[:-1]) if w["t"][-1] in PA]
anc = [(0, 0.0, None)]  # (índice palabra, inicio real, fin real de la palabra anterior)
usados = -1
for s, e in pausas:
    mejor = min((c for c in cand if c > usados), key=lambda c: abs(est[c][1] - s), default=None)
    if mejor is None or abs(est[mejor][1] - s) > 1.6: continue
    anc.append((mejor + 1, e, s)); usados = mejor
anc.append((len(ws), None, fin_voz))
# repartir palabras entre anclas por sílabas
real = [None] * len(ws)
for (i0, t0, _), (i1, _, t1) in zip(anc[:-1], anc[1:]):
    tot = sum(ws[j]["s"] for j in range(i0, i1)) or 1; acc = 0
    for j in range(i0, i1):
        a0 = t0 + (t1 - t0) * acc / tot; acc += ws[j]["s"]; real[j] = [a0, t0 + (t1 - t0) * acc / tot]
off = a.offset; bar = 4 * 60 / a.bpm
total_s = math.ceil((fin_voz + off + a.cierre) / bar) * bar; total = round(total_s * FPS)
f = lambda x: int(round((x + off) * FPS))
tomas = []
for i, s in enumerate(g["segmentos"]):
    j = next(k for k, w in enumerate(ws) if w["seg"] == i)
    tomas.append({"id": s["toma"], "fecha": s["fecha"], "a": 0 if i == 0 else f(real[j][0]) - 3})
cierre_a = f(fin_voz) + 8
for i, tm in enumerate(tomas): tm["b"] = tomas[i + 1]["a"] if i + 1 < len(tomas) else cierre_a
res = {"fps": FPS, "bpm": a.bpm, "total": total, "finVoz": f(fin_voz), "offsetVoz": off, "serie": g["serie"], "episodio": g["episodio"], "titulo": g["titulo"],
       "palabras": [{"t": w["t"], "seg": w["seg"], "a": f(r[0]), "b": max(f(r[1]), f(r[0]) + 2)} for w, r in zip(ws, real)],
       "tomas": tomas, "cierre": {"a": cierre_a, "b": total}, "anclas": len(anc) - 2, "pausas": len(pausas)}
json.dump(res, open(a.salida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"voz {fin_voz:.2f}s · {len(pausas)} pausas, {len(anc)-2} ancladas · total {total_s:.2f}s = {round(total_s/bar)} compases")
for tm in tomas: print(f"  {tm['id']:9s} {tm['a']/30:6.2f}s")
