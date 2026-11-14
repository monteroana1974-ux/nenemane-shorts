import json, subprocess, sys
d = json.load(open("datos/tb303.json")); i = int(sys.argv[1]); t = d["tomas"][i - 1]
src = f"out/tomas/{i:02d}_{t['id']}_borr.mp4"; dst = f"out/toma{i:02d}_{t['id']}_borrador.mp4"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-ss", str(t["a"] / 30), "-t", str((t["b"] - t["a"]) / 30), "-i", "public/mezcla_ep01.wav",
                "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-shortest", dst], check=True)
print(dst)
