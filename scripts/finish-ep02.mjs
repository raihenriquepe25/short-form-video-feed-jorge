// Espera as vozes do ep02 terminarem e então: durações -> render -> versões finais (AAC e MP3).
// Uso: node scripts/finish-ep02.mjs   (log em out/finish02.log, via redirecionamento do processo)
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const run = (cmd) => { console.log(`$ ${cmd}`); execSync(cmd, { stdio: "inherit", shell: true }); };

while (!(existsSync("out/voices02.log") && readFileSync("out/voices02.log", "utf8").includes("tudo pronto"))) await sleep(20000);
console.log("vozes prontas");

run("node scripts/gen-durations.mjs 02");
run("npx tsc --noEmit");
run("npx remotion render Ep02 out/ep02.mp4 --crf=18 --audio-bitrate=192k --log=error");
run("npx remotion ffmpeg -y -i out/ep02.mp4 -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p -c:a copy -movflags +faststart final/ep02-instagram-aac.mp4");
run("npx remotion ffmpeg -y -i final/ep02-instagram-aac.mp4 -c:v copy -c:a libmp3lame -b:a 192k -movflags +faststart final/ep02-audio-mp3.mp4");
console.log("FINISH_OK");
