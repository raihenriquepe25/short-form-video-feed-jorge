import script from "../script-ep01.json";
import durations from "./durations.json";

export const FPS = 30;
export const PAUSE_SEC = 0.45;
export const END_SEC = 3.5;

export type Speaker = "jorge" | "pedro";

export type LineItem = {
  id: string;
  speaker: Speaker;
  mood: string;
  caption: string;
  text: string;
  audio: string;
  gain: number;
  from: number;
  frames: number;
  isVerse: boolean;
};

const d = durations as Record<string, { file: string; sec: number; gain: number }>;

let cursor = 0;
export const lines: LineItem[] = [];
for (const scene of script.scenes as any[]) {
  for (const l of scene.lines) {
    const frames = Math.ceil((d[l.id].sec + PAUSE_SEC) * FPS);
    lines.push({
      id: l.id,
      speaker: l.speaker,
      mood: l.mood,
      caption: l.caption,
      text: l.text,
      audio: d[l.id].file,
      gain: d[l.id].gain,
      from: cursor,
      frames,
      isVerse: scene.visual === "e1verse",
    });
    cursor += frames;
  }
}

export const endCaption: string = (script.scenes as any[]).find((s) => s.visual === "e1end")?.caption ?? "";
export const endFrom = cursor;
export const endFrames = Math.ceil(END_SEC * FPS);
export const totalFrames = endFrom + endFrames;
