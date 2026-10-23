# Jorge e Pedro

Ensinamentos bíblicos curtos (vertical 9:16) em forma de conversa entre **Jorge** (menino que está aprendendo) e **Pedro** (pastor que ensina). Conteúdo gerado por IA.

- Retratos: gerados no Gemini (`public/images/<personagem>-<mood>.jpg`, referências em `assets/reference/`).
- Vozes: VoiceStudio via MCP (`scripts/build-voices.mjs`), descritas por `instruct`.
- Montagem: Remotion (`src/`). Trilha e sino sintetizados por `scripts/gen-audio.mjs` (gera `public/audio/`).
- Contexto completo e estado atual: `context.md` (seção 13).

```bash
npm install
node scripts/gen-audio.mjs     # trilha + sino (public/audio, não versionado)
npm run durations              # lê public/voice/*.wav -> src/durations.json
npm run render                 # out/ep01.mp4
npm start                      # Remotion Studio
```

Episódios: `episodes/epNN.json` (contrato com o hub). Vídeos prontos em `final/`.
