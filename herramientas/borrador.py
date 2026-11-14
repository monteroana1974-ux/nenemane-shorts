"""Borrador del episodio toma a toma. Solo renderiza las tomas que falten o las que se pidan.
Uso:  python3 herramientas/borrador.py              -> renderiza lo que falte y monta el borrador
      python3 herramientas/borrador.py club saldo   -> rehace esas tomas y vuelve a montar
      --escala 1 para la versión final (por defecto 0.5 = borrador)
"""
import json, subprocess, sys, os
args = [a for a in sys.argv[1:] if not a.startswith("--")]
escala = "1" if "--final" in sys.argv else "0.5"
d = json.load(open("datos/tb303.json"))
segs = [(f"{i+1:02d}_{t['id']}", t["a"], t["b"]) for i, t in enumerate(d["tomas"])] + [("10_cierre", d["cierre"]["a"], d["cierre"]["b"])]
os.makedirs("out/tomas", exist_ok=True)
suf = "final" if escala == "1" else "borr"
for name, a, b in segs:
    out = f"out/tomas/{name}_{suf}.mp4"
    if os.path.exists(out) and not any(k in name for k in args): continue
    print("renderizando", name, a, b - 1, flush=True)
    subprocess.run(["npx", "remotion", "render", "src/index.ts", "Ep01", out, f"--frames={a}-{b-1}", f"--scale={escala}" if escala == "1" else "--scale=1",
                    "--codec", "h264", "--crf", "20", "--concurrency=2", "--muted", "--props", ("{\"mute\":true}" if escala == "1" else "{\"mute\":true,\"dpr\":0.5}")], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
with open("out/tomas/lista.txt", "w") as fl:
    for name, a, b in segs: fl.write(f"file '{name}_{suf}.mp4'\n")
fin = f"out/ep01_{'final' if escala == '1' else 'borrador'}.mp4"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", "out/tomas/lista.txt", "-i", "public/mezcla_ep01.wav",
                "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", fin], check=True)
print("listo", fin, flush=True)
