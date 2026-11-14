import React from "react";
import { Composition } from "remotion";
import { AlexShort } from "./videos/alejandro/Alex";
import { TOTAL as ATOTAL, FPS } from "./videos/alejandro/story";
import { TB303Prueba } from "./videos/tb303/Short";
import { TOTAL } from "./videos/tb303/story";
import { Ep01 } from "./videos/ep01/Short";
import { Prueba25D, P25_TOTAL } from "./videos/p25d/Prueba25D";
import { Ep01b, TOTAL as TB } from "./videos/ep01b/Ep01b";
import { Ep01c, TOTAL as TC } from "./videos/ep01c/Ep01c";
import { Galeria } from "./videos/galeria/Galeria";
import { TumbadoPrueba } from "./videos/galeria/TumbadoPrueba";
import { Ep01d } from "./videos/ep01d/Ep01d";
import { Ep01e, TOTAL as TE } from "./videos/ep01e/Ep01e";
import { TOTAL as T1 } from "./videos/ep01/story";
export const Root: React.FC = () => (
  <>
    <Composition id="Ep01d" component={Ep01d} durationInFrames={TB} fps={FPS} width={1080} height={1920} />
    <Composition id="Ep01e" component={Ep01e} durationInFrames={TE} fps={30} width={1080} height={1920} />
    <Composition id="TumbadoPrueba" component={TumbadoPrueba} durationInFrames={1} fps={30} width={1920} height={1216} />
    <Composition id="Galeria" component={Galeria} durationInFrames={1} fps={30} width={1920} height={1280} />
    <Composition id="Ep01c" component={Ep01c} durationInFrames={TC} fps={FPS} width={1080} height={1920} />
    <Composition id="Ep01b" component={Ep01b} durationInFrames={TB} fps={FPS} width={1080} height={1920} />
    <Composition id="Prueba25D" component={Prueba25D} durationInFrames={P25_TOTAL} fps={FPS} width={1080} height={1920} />
    <Composition id="Ep01" component={Ep01} durationInFrames={T1} fps={FPS} width={1080} height={1920} />
    <Composition id="TB303Prueba" component={TB303Prueba} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    <Composition id="Alejandro" component={AlexShort} durationInFrames={ATOTAL} fps={FPS} width={1080} height={1920} />
  </>
);
