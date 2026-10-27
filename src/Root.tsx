import { Composition } from "remotion";
import { Episode } from "./Episode";
import { BannerYoutube, LogoAvatar, LogoAvatarTexto, LogoWordmark, LogoWordmarkTransparent } from "./Brand";
import { FPS, tl01, tl02 } from "./timeline";

export const Root: React.FC = () => (
  <>
    <Composition id="Ep01" component={Episode} defaultProps={{ tl: tl01 }} durationInFrames={tl01.totalFrames} fps={FPS} width={1080} height={1920} />
    <Composition id="Ep02" component={Episode} defaultProps={{ tl: tl02 }} durationInFrames={tl02.totalFrames} fps={FPS} width={1080} height={1920} />
    <Composition id="LogoAvatar" component={LogoAvatar} durationInFrames={1} fps={30} width={800} height={800} />
    <Composition id="LogoAvatarTexto" component={LogoAvatarTexto} durationInFrames={1} fps={30} width={800} height={800} />
    <Composition id="LogoWordmark" component={LogoWordmark} durationInFrames={1} fps={30} width={1600} height={800} />
    <Composition id="LogoWordmarkTransparent" component={LogoWordmarkTransparent} durationInFrames={1} fps={30} width={1600} height={800} />
    <Composition id="BannerYoutube" component={BannerYoutube} durationInFrames={1} fps={30} width={2560} height={1440} />
  </>
);
