// Rascunho rápido das vozes com Edge-TTS (Pedro = Antonio, Jorge = Thalita +15Hz). Saída: public/voice/<id>.mp3
// Uma requisição por vez com pausa entre elas (rajadas disparam 429). Retoma de onde parou.
import { EdgeTTS } from "node-edge-tts";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

const script = JSON.parse(readFileSync("script-ep01.json", "utf8"));
mkdirSync("public/voice", { recursive: true });

const VOICES = {
  pedro: { voice: "pt-BR-AntonioNeural", pitch: "+0Hz", rate: "+0%" },
  jorge: { voice: "pt-BR-ThalitaMultilingualNeural", pitch: "+15Hz", rate: "+5%" },
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const scene of script.scenes) {
  for (const line of scene.lines) {
    const out = `public/voice/${line.id}.mp3`;
    if (existsSync(out)) { console.log(`= ${line.id} (cache)`); continue; }
    const v = VOICES[line.speaker];
    const tts = new EdgeTTS({ voice: v.voice, lang: "pt-BR", pitch: v.pitch, rate: v.rate });
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        await tts.ttsPromise(line.text, out);
        console.log(`ok ${line.id} (${line.speaker})`);
        break;
      } catch (e) {
        console.log(`${line.id}: falhou (${e?.message ?? e}), tentativa ${attempt}`);
        await sleep(20000 * attempt);
      }
    }
    await sleep(4000);
  }
}
console.log("fim");
