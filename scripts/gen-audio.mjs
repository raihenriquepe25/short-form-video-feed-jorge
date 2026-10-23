// Sintetiza a trilha (piano suave em arpejo, lento, tom maior) e um sino leve. Saída: public/audio/bed.wav, chime.wav
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
mkdirSync("public/audio", { recursive: true });

function wav(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return buf;
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

function addNote(out, t0, midi, dur, amp, bright = 1) {
  const f = hz(midi);
  const start = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  for (let i = 0; i < len && start + i < out.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.012) * Math.exp(-t * 1.5);
    let s = 0;
    s += Math.sin(2 * Math.PI * f * t);
    s += 0.45 * bright * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 2.2);
    s += 0.18 * bright * Math.sin(2 * Math.PI * f * 3 * t) * Math.exp(-t * 3.5);
    out[start + i] += s * env * amp;
  }
}

// Trilha: C - G/B - Am - F, 4 s por acorde, arpejo de colcheias lentas, ~100 s.
const TOTAL = 150;
const bed = new Float32Array(TOTAL * SR);
const chords = [
  [48, 55, 60, 64, 67], // C
  [47, 55, 62, 67, 71], // G/B
  [45, 52, 60, 64, 69], // Am
  [41, 53, 60, 65, 69], // F
];
let t = 0, ci = 0;
while (t < TOTAL - 4) {
  const ch = chords[ci % 4];
  addNote(bed, t, ch[0] - 12, 4.5, 0.20, 0.5);
  const pattern = [1, 2, 3, 4, 3, 2, 3, 2];
  pattern.forEach((p, k) => addNote(bed, t + k * 0.5, ch[p], 2.4, 0.12));
  t += 4; ci++;
}
// leve reverb: dois ecos suaves
const wet = new Float32Array(bed.length);
for (let i = 0; i < bed.length; i++) {
  wet[i] = bed[i] + (i > 0.19 * SR ? bed[i - Math.floor(0.19 * SR)] * 0.28 : 0) + (i > 0.37 * SR ? bed[i - Math.floor(0.37 * SR)] * 0.16 : 0);
}
let peak = 0; for (const v of wet) peak = Math.max(peak, Math.abs(v));
for (let i = 0; i < wet.length; i++) {
  const fade = Math.min(1, i / (2 * SR), (wet.length - i) / (4 * SR));
  wet[i] = (wet[i] / peak) * 0.8 * fade;
}
writeFileSync("public/audio/bed.wav", wav(wet));

// Sino/carrilhão leve (ênfase no versículo)
const chime = new Float32Array(4 * SR);
[[84, 0], [88, 0.18], [91, 0.36]].forEach(([m, t0]) => {
  const f = hz(m);
  const s0 = Math.floor(t0 * SR);
  for (let i = 0; s0 + i < chime.length; i++) {
    const tt = i / SR;
    chime[s0 + i] += (Math.sin(2 * Math.PI * f * tt) + 0.3 * Math.sin(2 * Math.PI * f * 2.76 * tt)) * Math.exp(-tt * 2.6) * Math.min(1, tt / 0.004) * 0.3;
  }
});
writeFileSync("public/audio/chime.wav", wav(chime));
console.log("ok: public/audio/bed.wav, public/audio/chime.wav");
