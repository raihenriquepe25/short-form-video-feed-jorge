import { writeFileSync, mkdirSync, existsSync } from "fs";

const OUT = "assets/characters";
mkdirSync(OUT, { recursive: true });

const STYLE =
  "digital painted comic book illustration, soft cel-shading, clean linework, warm cinematic lighting, graphic novel cover art, vertical portrait, bust chest-up shot, centered, three-quarter angle facing left, plain solid white background, no text, no watermark";

const JORGE =
  "Jorge, a Brazilian boy around 9 years old, short dark brown hair, warm brown skin tone, plain light blue t-shirt, round friendly face, big expressive brown eyes";
const PEDRO =
  "Pedro, a warm middle-aged Brazilian pastor in his early 50s, short graying dark hair, light stubble beard, kind gentle face, warm brown eyes, rolled-sleeve denim-blue button-up shirt";

const images = [
  { file: "jorge-worried", seed: 101, who: JORGE, mood: "worried and a little scared expression, eyebrows raised with concern, eyes slightly glossy, lips pressed together" },
  { file: "jorge-curious", seed: 101, who: JORGE, mood: "curious and puzzled expression, one eyebrow raised, head tilted slightly, mouth slightly open as if asking a question" },
  { file: "jorge-relieved", seed: 101, who: JORGE, mood: "relieved, warm genuine smile, soft content eyes, relaxed shoulders" },
  { file: "pedro-warm", seed: 202, who: PEDRO, mood: "calm gentle neutral-warm expression, soft reassuring smile, looking attentively to the side as if listening" },
  { file: "pedro-teaching", seed: 202, who: PEDRO, mood: "mid-explanation, one hand raised gesturing, holding a small open Bible against his chest, eyebrows slightly raised with gentle emphasis" },
  { file: "pedro-smiling", seed: 202, who: PEDRO, mood: "warm encouraging smile, eyes crinkled with kindness, slight nod" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const img of images) {
  const path = `${OUT}/${img.file}.jpg`;
  if (existsSync(path)) continue;
  const prompt = `${img.who}, ${img.mood}, ${STYLE}`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=960&seed=${img.seed}&nologo=true`;
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch(url);
    if (res.ok && (res.headers.get("content-type") || "").startsWith("image/")) {
      writeFileSync(path, Buffer.from(await res.arrayBuffer()));
      console.log(`OK ${path}`);
      break;
    }
    console.log(`${img.file}: HTTP ${res.status}, tentativa ${attempt}, aguardando 50s`);
    await sleep(50000);
  }
  await sleep(50000);
}
console.log("fim");
