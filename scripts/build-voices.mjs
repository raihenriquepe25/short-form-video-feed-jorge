// Gera as falas do episódio com o VoiceStudio (MCP em http://127.0.0.1:3900/mcp/).
// Pré-requisito: powershell -File scripts/voicestudio-start.ps1  (backend no ar)
// Saída: public/voice/<id>.wav. Retoma de onde parou (cache por id). Em CPU é lento: rode em segundo plano.
// Timbre fixo por personagem: a 1ª fala de cada um sai por descrição (instruct), vira perfil clonado,
// e as demais falas usam esse perfil.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import { callTool } from "./vs-client.mjs";

const ep = process.argv[2] || "01"; // uso: node scripts/build-voices.mjs 02
const script = JSON.parse(readFileSync(`script-ep${ep}.json`, "utf8"));
const OUT = "public/voice";
// Pasta-base do MCP (OMNIVOICE_MCP_BASE_PATH), definida em scripts/voicestudio-start.ps1.
const BASE = process.env.VS_BASE || "voz-studio-out";
const STEPS = Number(process.env.VS_STEPS || 16);
mkdirSync(OUT, { recursive: true });

const INSTRUCT = {
  jorge: "male, child, high pitch",
  pedro: "male, middle-aged, low pitch",
};

const progressFile = join(OUT, "progress.json");
const progress = existsSync(progressFile) ? JSON.parse(readFileSync(progressFile, "utf8")) : { profiles: {}, done: {} };
const save = () => writeFileSync(progressFile, JSON.stringify(progress, null, 2));

for (const scene of script.scenes) {
  for (const line of scene.lines) {
    const file = join(OUT, `${line.id}.wav`);
    if (existsSync(file) && progress.done[line.id]) { console.log(`= ${line.id} (cache)`); continue; }
    const profile = progress.profiles[line.speaker];
    const t0 = Date.now();
    console.log(`> ${line.id} (${line.speaker}): ${line.text.slice(0, 60)}...`);
    const args = { text: line.text, language: "pt", steps: STEPS, ...(profile ? { profile_id: profile } : { instruct: INSTRUCT[line.speaker] }) };
    const r = await callTool("generate_speech", args);
    copyFileSync(r.output_path, file);
    progress.done[line.id] = { seconds: r.audio_duration_s, took_s: r.generation_time_s, at: new Date().toISOString() };
    if (!profile) {
      const refName = `ref-${line.speaker}.wav`;
      mkdirSync(BASE, { recursive: true });
      copyFileSync(file, join(BASE, refName));
      const c = await callTool("clone_voice", { name: `${line.speaker}-ep`, ref_audio_path: refName, ref_text: line.text, language: "pt" });
      progress.profiles[line.speaker] = c.profile_id || c.id || c;
      console.log(`  perfil ${line.speaker} = ${progress.profiles[line.speaker]}`);
    }
    save();
    console.log(`  ok ${r.audio_duration_s}s de áudio em ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}
console.log("tudo pronto →", OUT);
