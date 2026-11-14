# NeNeMaNé · Techno Old School — generador de shorts

Shorts verticales con historia (estilo dibujos 2D en un mundo 2.5D/3D) para promocionar la música de NeNeMaNé.
Hecho con Remotion 4 + three.js.

## Episodios
- `src/videos/ep01d` — Ep. 1 «La máquina que nadie quería» (voz 1, personajes nuevos, baile acid, tarjeta final).
- `src/videos/ep01e` — Ep. 1 «Cuatro veces en una noche» (historia de Acid Tracks; escena del tío pataleando).
- `src/videos/ep01b`, `ep01c` — versiones anteriores.

## Partes
- `src/motor25d/` — relieve 2.5D (fondo pintado + mapa de profundidad), cámara, personajes (`muneco.ts`, `tumbado.ts`), objetos (`props.ts`).
- `src/motor3d/` — motor de personajes y tinta (MIT, LuisPa / Mr omi).
- `datos/` — guiones y tiempos de la voz (`guion_ep01_v3.json`, `ep01_v3.json`…).
- `herramientas/` — tiempos de la voz, mezclas (`mezcla_v3.py`), medición del estilo (`medir_30fps.py`), mapas de profundidad (`profundidad/profundidad.py`, modelo Depth Anything V2 small en ONNX, no incluido).
- `public/` — fondos, mapas de profundidad, voces y mezclas.

## Archivos que no están en el repositorio
- `public/tema_3i_atlas.wav` (tema «3I ATLAS COMING», 149 MB): copiarlo en `public/` para volver a mezclar.
- El modelo `da2_vits.onnx` (Depth Anything V2 small) para crear mapas de profundidad de fondos nuevos.

## Uso
```
npm install
npx remotion studio            # vista previa
npx remotion render src/index.ts Ep01e out/ep01e.mp4 --props='{"dpr":0.6}'   # borrador rápido
npx remotion render src/index.ts Ep01e out/ep01e_final.mp4                    # calidad final
```
