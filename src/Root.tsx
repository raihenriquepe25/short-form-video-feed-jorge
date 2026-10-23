import { Composition } from "remotion";
import { Ep01 } from "./Ep01";
import { FPS, totalFrames } from "./timeline";

export const Root: React.FC = () => (
  <Composition id="Ep01" component={Ep01} durationInFrames={totalFrames} fps={FPS} width={1080} height={1920} />
);
