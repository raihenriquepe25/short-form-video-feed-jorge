import { EdgeTTS } from "node-edge-tts";
import { mkdirSync } from "fs";

mkdirSync("public/voice-tests", { recursive: true });

const jorgeLine =
  "Pedro, essa semana eu fiquei com muito medo do que pode acontecer amanhã. Pra quem confia em Deus, sentir medo assim é errado?";

const candidates = [
  { file: "jorge-francisca", voice: "pt-BR-FranciscaNeural", pitch: "+15Hz", rate: "+5%" },
  { file: "jorge-thalita", voice: "pt-BR-ThalitaMultilingualNeural", pitch: "+15Hz", rate: "+5%" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const c of candidates) {
  const tts = new EdgeTTS({ voice: c.voice, lang: "pt-BR", pitch: c.pitch, rate: c.rate });
  const out = `public/voice-tests/${c.file}.mp3`;
  try {
    await tts.ttsPromise(jorgeLine, out);
    console.log(`OK: ${out} (${c.voice})`);
  } catch (err) {
    console.log(`FALHOU: ${c.voice} -> ${err?.message ?? err}`);
  }
  await sleep(90000);
}
console.log("fim");
