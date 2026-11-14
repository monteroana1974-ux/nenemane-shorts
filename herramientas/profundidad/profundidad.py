"""Mapa de profundidad con Depth Anything V2 (small, ONNX). Blanco = cerca, negro = lejos.
Uso: python3 -I profundidad.py modelo.onnx imagen.jpg salida_prof.png"""
import sys, numpy as np, onnxruntime as ort
from PIL import Image, ImageFilter
mod, src, dst = sys.argv[1:4]
im = Image.open(src).convert("RGB"); W, H = im.size
s = ort.InferenceSession(mod)
x = np.asarray(im.resize((518, 518), Image.BICUBIC), dtype=np.float32) / 255.0
x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
d = s.run(None, {s.get_inputs()[0].name: x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0]
d = (d - d.min()) / (d.max() - d.min() + 1e-9)
out = Image.fromarray((d * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2))
out.save(dst); print(dst, out.size)
