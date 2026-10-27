import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Nunito";

const { fontFamily } = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin", "latin-ext"] });

const C = { teal: "#2c6a8a", tealDark: "#1d4a63", gold: "#f4c430", goldDeep: "#c98a1b", cream: "#fff8ea", ink: "#2a2118" };

const Face: React.FC<{ src: string; size: number; cx: number; cy: number; zoom: number }> = ({ src, size, cx, cy, zoom }) => {
  // Mostra um recorte do retrato 1536x2752 centrado no ponto (cx, cy) em frações da imagem.
  const w = size * zoom;
  const h = w * (2752 / 1536);
  return (
    <div style={{ width: size, height: size, overflow: "hidden", position: "relative" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", width: w, height: h, left: size / 2 - cx * w, top: size / 2 - cy * h }} />
    </div>
  );
};

const Bubble: React.FC<{ w: number; color: string; children?: React.ReactNode }> = ({ w, color, children }) => (
  <div style={{ position: "relative", width: w, height: w * 0.78 }}>
    <div style={{ position: "absolute", inset: 0, background: color, borderRadius: w * 0.3 }} />
    <div
      style={{
        position: "absolute",
        left: w * 0.16,
        bottom: -w * 0.1,
        width: 0,
        height: 0,
        borderLeft: `${w * 0.12}px solid transparent`,
        borderRight: `${w * 0.12}px solid transparent`,
        borderTop: `${w * 0.16}px solid ${color}`,
      }}
    />
    {children}
  </div>
);

export const LogoAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, #3f89ad 0%, ${C.tealDark} 100%)`, justifyContent: "center", alignItems: "center" }}>
    <div style={{ width: 700, height: 700, borderRadius: "50%", overflow: "hidden", border: `18px solid ${C.gold}`, boxShadow: "0 0 80px rgba(244,196,48,0.45)", position: "relative" }}>
      <Face src="images/jorge-curious.jpg" size={664} cx={0.5} cy={0.4} zoom={1.75} />
    </div>
    <div style={{ position: "absolute", bottom: 28, width: "100%", textAlign: "center", fontFamily, fontWeight: 900, fontSize: 0 }} />
  </AbsoluteFill>
);

const Lockup: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily }}>
    <div style={{ fontWeight: 800, fontSize: 118, color: C.cream, letterSpacing: 3, lineHeight: 1 }}>Histórias com</div>
    <div style={{ position: "relative", marginTop: 26 }}>
      <div style={{ background: C.gold, borderRadius: 90, padding: "6px 110px 22px", boxShadow: `0 14px 0 ${C.goldDeep}` }}>
        <span style={{ fontWeight: 900, fontSize: 270, color: C.tealDark, lineHeight: 1.05, letterSpacing: 2 }}>Jorge</span>
      </div>
      <div style={{ position: "absolute", left: 150, bottom: -78, width: 0, height: 0, borderLeft: "46px solid transparent", borderRight: "46px solid transparent", borderTop: `76px solid ${C.goldDeep}` }} />
      <div style={{ position: "absolute", left: 150, bottom: -64, width: 0, height: 0, borderLeft: "46px solid transparent", borderRight: "46px solid transparent", borderTop: `70px solid ${C.gold}` }} />
    </div>
    <div style={{ marginTop: 110, display: "flex", alignItems: "center", gap: 28 }}>
      <div style={{ width: 90, height: 5, background: C.gold, borderRadius: 3 }} />
      <div style={{ fontWeight: 700, fontSize: 50, color: C.cream, letterSpacing: 1 }}>A Bíblia explicada em conversa com o Pastor Pedro</div>
      <div style={{ width: 90, height: 5, background: C.gold, borderRadius: 3 }} />
    </div>
  </div>
);

export const LogoWordmark: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.tealDark} 0%, ${C.teal} 100%)`, justifyContent: "center", alignItems: "center" }}>
    <Lockup />
  </AbsoluteFill>
);

export const LogoAvatarTexto: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #3f89ad 0%, ${C.tealDark} 100%)`, justifyContent: "center", alignItems: "center" }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily, marginTop: -20 }}>
      <div style={{ fontWeight: 800, fontSize: 84, color: C.cream, letterSpacing: 2, lineHeight: 1 }}>Histórias com</div>
      <div style={{ position: "relative", marginTop: 22 }}>
        <div style={{ background: C.gold, borderRadius: 70, padding: "2px 62px 16px", boxShadow: `0 10px 0 ${C.goldDeep}` }}>
          <span style={{ fontWeight: 900, fontSize: 200, color: C.tealDark, lineHeight: 1.05, letterSpacing: 1 }}>Jorge</span>
        </div>
        <div style={{ position: "absolute", left: 90, bottom: -62, width: 0, height: 0, borderLeft: "34px solid transparent", borderRight: "34px solid transparent", borderTop: `60px solid ${C.goldDeep}` }} />
        <div style={{ position: "absolute", left: 90, bottom: -50, width: 0, height: 0, borderLeft: "34px solid transparent", borderRight: "34px solid transparent", borderTop: `56px solid ${C.gold}` }} />
      </div>
    </div>
  </AbsoluteFill>
);

export const LogoWordmarkTransparent: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <Lockup />
  </AbsoluteFill>
);

export const BannerYoutube: React.FC = () => (
  <AbsoluteFill style={{ background: C.tealDark }}>
    <Img src={staticFile("images/cenario-quarto.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 38%", filter: "blur(10px) brightness(0.55) saturate(1.1)", transform: "scale(1.08)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(29,74,99,0.55) 0%, rgba(29,74,99,0.15) 35%, rgba(29,74,99,0.15) 65%, rgba(29,74,99,0.55) 100%)" }} />

    <div style={{ position: "absolute", left: 40, top: 500, width: 440, height: 440, borderRadius: "50%", overflow: "hidden", border: `10px solid ${C.gold}`, boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
      <Face src="images/jorge-curious.jpg" size={420} cx={0.5} cy={0.4} zoom={1.8} />
    </div>
    <div style={{ position: "absolute", right: 40, top: 500, width: 440, height: 440, borderRadius: "50%", overflow: "hidden", border: `10px solid ${C.gold}`, boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
      <Face src="images/pedro-warm.jpg" size={420} cx={0.5} cy={0.42} zoom={1.8} />
    </div>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(20,12,4,0) 0%, rgba(20,12,4,0) 30%, rgba(20,12,4,0) 70%, rgba(20,12,4,0) 100%)" }} />

    {/* Zona segura do YouTube (centro 1546x423): nome do canal e frase */}
    <div style={{ position: "absolute", left: 507, top: 480, width: 1546, height: 480, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 26, textShadow: "0 6px 30px rgba(0,0,0,0.5)" }}>
        <span style={{ fontWeight: 800, fontSize: 120, color: C.cream }}>Histórias</span>
        <span style={{ fontWeight: 800, fontSize: 80, color: C.gold }}>com</span>
        <span style={{ fontWeight: 900, fontSize: 170, color: C.gold }}>Jorge</span>
      </div>
      <div style={{ marginTop: 14, fontWeight: 700, fontSize: 52, color: C.cream, background: "rgba(29,74,99,0.78)", padding: "10px 40px", borderRadius: 999, letterSpacing: 1 }}>
        A Bíblia explicada em conversa, com o Pastor Pedro
      </div>
    </div>
  </AbsoluteFill>
);
