import script01 from "../script-ep01.json";
import script02 from "../script-ep02.json";
import durations01 from "./durations-ep01.json";
import durations02 from "./durations-ep02.json";

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

export type Timeline = {
  lines: LineItem[];
  endCaption: string;
  endFrom: number;
  endFrames: number;
  totalFrames: number;
  brand: string;
};

type Durations = Record<string, { file: string; sec: number; gain: number }>;

export function buildTimeline(script: any, durations: Durations, brand: string): Timeline {
  let cursor = 0;
  const lines: LineItem[] = [];
  for (const scene of script.scenes as any[]) {
    for (const l of scene.lines) {
      const frames = Math.ceil((durations[l.id].sec + PAUSE_SEC) * FPS);
      lines.push({
        id: l.id,
        speaker: l.speaker,
        mood: l.mood,
        caption: l.caption,
        text: l.text,
        audio: durations[l.id].file,
        gain: durations[l.id].gain,
        from: cursor,
        frames,
        isVerse: /verse$/.test(scene.visual),
      });
      cursor += frames;
    }
  }
  const endFrames = Math.ceil(END_SEC * FPS);
  return {
    lines,
    endCaption: (script.scenes as any[]).find((s) => /end$/.test(s.visual))?.caption ?? "",
    endFrom: cursor,
    endFrames,
    totalFrames: cursor + endFrames,
    brand,
  };
}

export const tl01 = buildTimeline(script01, durations01 as Durations, "JORGE & PEDRO");

export const tl02 = buildTimeline(script02, durations02 as Durations, "HISTÓRIAS COM JORGE");
