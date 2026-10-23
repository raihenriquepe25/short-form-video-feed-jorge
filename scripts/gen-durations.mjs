// Mede a duração (s) de cada fala em public/voice (.wav ou .mp3) e grava src/durations.json.
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";

const script = JSON.parse(readFileSync("script-ep01.json", "utf8"));

function wavSeconds(buf) {
  const rate = buf.readUInt32LE(24);
  const bits = buf.readUInt16LE(34);
  const channels = buf.readUInt16LE(22);
  let off = 12;
  while (off < buf.length - 8) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "data") return size / (rate * channels * (bits / 8));
    off += 8 + size + (size % 2);
  }
  throw new Error("chunk data não encontrado");
}

function wavGain(buf, targetDb = -19.5) {
  let off = 12, d = 0, s = 0;
  while (off < buf.length - 8) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "data") { d = off + 8; s = size; break; }
    off += 8 + size + (size % 2);
  }
  const n = Math.floor(s / 2);
  let sum = 0;
  for (let i = 0; i < n; i++) { const v = buf.readInt16LE(d + i * 2); sum += v * v; }
  const rmsDb = 20 * Math.log10(Math.sqrt(sum / n) / 32768);
  return +Math.min(1, 10 ** ((targetDb - rmsDb) / 20)).toFixed(3);
}

const out = {};
for (const scene of script.scenes) {
  for (const line of scene.lines) {
    const wav = `public/voice/${line.id}.wav`;
    const mp3 = `public/voice/${line.id}.mp3`;
    if (existsSync(wav)) { const b = readFileSync(wav); out[line.id] = { file: `voice/${line.id}.wav`, sec: +wavSeconds(b).toFixed(3), gain: wavGain(b) }; }
    else if (existsSync(mp3)) out[line.id] = { file: `voice/${line.id}.mp3`, sec: +((statSync(mp3).size * 8) / 48000).toFixed(3), gain: 1 }; // Edge-TTS: 48 kbps
    else throw new Error(`sem áudio para ${line.id}`);
  }
}
writeFileSync("src/durations.json", JSON.stringify(out, null, 2));
console.log(out);
