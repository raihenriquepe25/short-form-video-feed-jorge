import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Nunito";
import { endCaption, endFrames, endFrom, lines, LineItem } from "./timeline";

const { fontFamily } = loadFont("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] });

const COLORS = {
  jorge: "#2c6a8a",
  pedro: "#c98a1b",
  cream: "#fff8ea",
  ink: "#2a2118",
  gold: "#f4c430",
};
const NAMES = { jorge: "JORGE", pedro: "PEDRO" } as const;

// Divide o texto em "páginas" curtas (por frase, até ~95 caracteres) para o balão não virar um paredão.
function paginate(text: string): string[] {
  const parts = text.match(/[^.!?:]+[.!?:]?\s*/g) ?? [text];
  const pages: string[] = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + p).trim().length > 95 && cur) {
      pages.push(cur.trim());
      cur = p;
    } else cur += p;
  }
  if (cur.trim()) pages.push(cur.trim());
  return pages;
}

const Bubble: React.FC<{ item: LineItem }> = ({ item }) => {
  const frame = useCurrentFrame();
  const speechFrames = item.frames - Math.round(0.45 * 30);
  const pages = paginate(item.text);
  const total = pages.reduce((n, p) => n + p.length, 0);
  let acc = 0;
  let idx = pages.length - 1;
  for (let i = 0; i < pages.length; i++) {
    acc += pages[i].length;
    if (frame < (acc / total) * speechFrames) { idx = i; break; }
  }
  const start = pages.slice(0, idx).reduce((n, p) => n + p.length, 0);
  const pageFrom = (start / total) * speechFrames;
  const pageLen = (pages[idx].length / total) * speechFrames;
  const local = frame - pageFrom;
  const pop = interpolate(local, [0, 8], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const words = pages[idx].split(" ");
  const shown = Math.max(1, Math.ceil(interpolate(local, [0, pageLen * 0.8], [0, words.length], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })));
  const accent = COLORS[item.speaker];

  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1130, opacity: pop, transform: `translateY(${(1 - pop) * 24}px)` }}>
      <div
        style={{
          background: COLORS.cream,
          borderRadius: 44,
          padding: "38px 46px 42px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.38)",
          border: `6px solid ${accent}`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -26,
            left: 36,
            background: accent,
            color: "#fff",
            fontFamily,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: 3,
            padding: "6px 24px",
            borderRadius: 999,
          }}
        >
          {NAMES[item.speaker]}
        </div>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 54, lineHeight: 1.22, color: COLORS.ink, textAlign: "center", minHeight: 130 }}>
          {words.slice(0, shown).join(" ")}
        </div>
        <div
          style={{
            position: "absolute",
            top: -22,
            right: 120,
            width: 0,
            height: 0,
            borderLeft: "22px solid transparent",
            borderRight: "22px solid transparent",
            borderBottom: `24px solid ${accent}`,
          }}
        />
      </div>
    </div>
  );
};

const Line: React.FC<{ item: LineItem }> = ({ item }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 9], [0, 1], { extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [0, item.frames], [1.0, 1.09]);
  const driftX = interpolate(frame, [0, item.frames], [0, item.speaker === "jorge" ? -18 : 18]);
  const img = staticFile(`images/${item.speaker}-${item.mood}.jpg`);

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <AbsoluteFill style={{ transform: `scale(${zoom}) translateX(${driftX}px)` }}>
        <Img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,12,4,0.50) 0%, rgba(20,12,4,0) 22%, rgba(20,12,4,0) 52%, rgba(20,12,4,0.55) 100%)" }} />
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: item.isVerse ? 64 : 46,
            letterSpacing: 2,
            color: item.isVerse ? COLORS.ink : COLORS.cream,
            background: item.isVerse ? COLORS.gold : "rgba(20,12,4,0.55)",
            padding: "14px 40px",
            borderRadius: 18,
            boxShadow: item.isVerse ? "0 0 60px rgba(244,196,48,0.65)" : "none",
            textAlign: "center",
            maxWidth: 920,
          }}
        >
          {item.caption}
        </div>
      </div>
      <Bubble item={item} />
      <Audio src={staticFile(item.audio)} volume={item.gain} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: o, background: "linear-gradient(180deg,#1d2f3a 0%, #2c6a8a 55%, #c98a1b 140%)" }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 40 }}>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 92, color: COLORS.cream, letterSpacing: 4 }}>JORGE & PEDRO</div>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 60, color: COLORS.ink, background: COLORS.gold, padding: "20px 44px", borderRadius: 22, textAlign: "center", maxWidth: 900 }}>
          {endCaption}
        </div>
        <div style={{ fontFamily, fontWeight: 700, fontSize: 34, color: "rgba(255,248,234,0.7)" }}>Conteúdo gerado por IA</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Ep01: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const verse = lines.find((l) => l.isVerse);
  return (
    <AbsoluteFill style={{ background: "#140c04" }}>
      <Audio
        src={staticFile("audio/bed.wav")}
        volume={(f) => 0.11 * interpolate(f, [0, 45, durationInFrames - 60, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      {verse && (
        <Sequence from={verse.from + 3} durationInFrames={90}>
          <Audio src={staticFile("audio/chime.wav")} volume={0.22} />
        </Sequence>
      )}
      {lines.map((item) => (
        <Sequence key={item.id} from={item.from} durationInFrames={item.frames + 6}>
          <Line item={item} />
        </Sequence>
      ))}
      <Sequence from={endFrom} durationInFrames={endFrames}>
        <EndCard />
      </Sequence>
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: "rgba(255,248,234,0.55)" }}>
        JORGE & PEDRO
      </div>
    </AbsoluteFill>
  );
};
