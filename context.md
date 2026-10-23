# CONTEXT — Canal "Jorge": ensinamentos bíblicos curtos animados por código

> Documento de contexto para outro Claude (ou qualquer dev) iniciar o projeto do zero.
> Idioma do canal e dos vídeos: **português do Brasil**. Responda ao usuário em pt-BR.
> Este projeto é um **canal irmão** do canal "Sem Sinal" (série "Sobrevivência na Ilha", repositório
> https://github.com/raihenriquepe25/short-form-video-feed-davi). Reaproveitamos a **ideia geral** daquele
> projeto (vídeo 100% gerado por código, voz sintética, áudio sintetizado em JS, personagem articulado),
> mas a stack técnica mudou — ver seção 0 — e o conteúdo/roteiro é outro, outro público.

## 0. Mudança de stack em relação ao canal do Davi (decidido em 2026-10-20)
Depois de avaliar duas alternativas (ver pesquisa no histórico do projeto), ficou decidido:
- **Motor de vídeo: migrar de Remotion para [HyperFrames](https://github.com/heygen-com/hyperframes)**
  (HeyGen, Apache-2.0). Composições em **HTML/CSS/JS puro**, sem React nem bundler — timeline via
  atributos `data-start`/`data-duration` (em segundos) nos elementos `.clip`, múltiplas faixas de áudio
  via `data-track-index`, animação com GSAP/CSS/WAAPI. CLI: `npx hyperframes init/preview/render` (Node
  22+, FFmpeg, renderiza via Chrome headless/Puppeteer).
  **Ponto crítico**: HyperFrames **não tem equivalente ao `calculateMetadata` assíncrono** do Remotion.
  `data-duration` é sempre um valor fixo definido antes do render. Portanto a duração de cada cena (hoje
  calculada a partir do tamanho do áudio de narração) precisa ser **pré-calculada num passo anterior**:
  gerar o áudio de cada fala primeiro, medir a duração com `ffprobe` (ou parse manual do header WAV/MP3),
  e só então gerar o HTML do episódio já com os `data-duration` certos. Isso é um passo a mais no
  pipeline, não um impeditivo.
- **Voz: manter Edge-TTS (`node-edge-tts`), com 2 vozes pt-BR distintas** (uma por personagem). Foi
  testado na prática usar o [VoiceStudio](https://github.com/debpalash/voicestudio) (app local
  "ElevenLabs alternativo") como alternativa com clonagem de voz, via Docker
  (`ghcr.io/debpalash/voicestudio:stable`, API REST compatível com OpenAI em `POST /v1/audio/speech`).
  Funcionou tecnicamente (aceita `language: "pt"` e gera áudio válido), mas **sem GPU dedicada é
  inviável para o pipeline em lote**: ~2,75s de processamento por caractere mesmo com o modelo já
  "aquecido" (medido localmente: 34 caracteres → 1m33s; 85 caracteres → 10min na primeira chamada). Um
  episódio com ~700 caracteres de falas levaria 30-40min só de geração de voz. Além disso as únicas
  vozes prontas são aliases que mapeiam pro mesmo timbre padrão — vozes diferentes por personagem exigem
  clonagem (até 20s de áudio de referência) ou "voice design", o que levanta a questão de consentimento
  do dono da voz clonada. **Decisão: descartado por ora.** Reavaliar se um dia houver GPU dedicada
  disponível.
- **Estilo visual: trocar personagem 100% vetor/SVG por retrato ilustrado gerado por IA de imagem**
  (decidido em 2026-10-20, depois do usuário mostrar um vídeo de referência estilo "quadrinho/pintura
  digital", tipo conteúdo @crimecarton). Isso muda a arquitetura visual:
  - O personagem **não é mais articulado/animado por código** (nada de pose por junta, piscar
    procedural). Em vez disso, cada personagem tem um **conjunto fixo de retratos/expressões** (tipo
    "sprites") gerados uma única vez em uma ferramenta de imagem por IA, reaproveitados em todos os
    episódios futuros sem regerar.
  - **Quem gera as imagens: o usuário**, manualmente, numa ferramenta de imagem que ele já usa (ex.:
    ChatGPT, Midjourney), e entrega os arquivos prontos pro Claude integrar. Não há geração de imagem
    automatizada no pipeline de código — ver especificação exata na seção 5.
  - A entrega passa a ser **retrato quase estático (expressão muda, mas sem animação corporal) + balão
    de fala com o texto sobreposto**, como no vídeo de referência — não mais um personagem se mexendo a
    cada cena. Isso é tecnicamente mais viável com arte gerada por IA (manter um personagem 100%
    consistente *em movimento* entre poses geradas por IA é muito difícil; estático é viável).
  - HyperFrames continua sendo o motor (seção 0, primeiro item): ele que cuida da troca de imagem entre
    expressões, do balão de fala, zoom/parallax leve na imagem, e da legenda — só o personagem em si
    deixa de ser desenhado por código.

## 1. O que é o projeto
Um canal de vídeos curtos verticais (Instagram Reels, TikTok, YouTube Shorts) chamado **Jorge**, com
**ensinamentos bíblicos** apresentados como uma **conversa entre dois personagens**: cada vídeo apresenta
**um versículo** e uma reflexão/ensinamento prático sobre ele, em forma de diálogo entre:
- **Jorge**: um **menino**, ainda aprendendo sobre a Bíblia — faz perguntas, expressa dúvidas/medos
  reais (do tipo que o próprio espectador teria), representa o "aluno".
- **Pedro**: um **pastor** adulto, caloroso e paciente, que ensina o Jorge (e o espectador) — representa
  o "mestre".

Os vídeos são **montados por código** (HyperFrames), com três partes geradas por processos diferentes:
**retratos dos personagens** (ilustração estilo quadrinho/pintura, gerados manualmente pelo usuário numa
ferramenta de IA de imagem — ver seção 0 e seção 5), **narração** (voz de IA via Edge-TTS, uma voz pt-BR
por personagem) e **trilha + efeitos sonoros sintetizados em JavaScript** (sem assets externos — essa
parte continua 100% código, sem problema de direitos autorais). A montagem (troca de retrato conforme
quem fala, balão de texto, legenda, áudio) é toda automatizada; só a arte-base dos personagens é manual
e pontual (gerada uma vez, reaproveitada sempre).

**Diferença importante em relação ao canal "Sem Sinal"**: aqui **não há "Parte 1, 2, 3..." nem
cliffhanger**. Cada vídeo é **autônomo** (um episódio = um versículo + um ensinamento, em forma de
diálogo). Não existe pressão de tempo/sobrevivência; o tom é calmo, reflexivo e acolhedor — agora também
com a dinâmica natural de uma conversa pergunta→resposta entre quem aprende e quem ensina.

- Repositório: **a criar** (novo repo, ex.: `short-form-video-feed-jorge`), independente do repo do Davi.
- Primeiro roteiro de exemplo (formato antigo, só narrador): `script-ep01.json` (enviado junto com este
  documento) — Isaías 41:10. **Está sendo reescrito em formato de diálogo** (Jorge/Pedro) — ver seção 12.

## 2. Ambiente de desenvolvimento
- Node 22+ (confirmado: Node 24 instalado), npm, FFmpeg (precisa estar disponível pro `hyperframes
  render`; o projeto do Davi tinha FFmpeg embutido via `npx remotion ffmpeg`, aqui **confirmar** se dá
  pra usar o mesmo binário ou se precisa instalar FFmpeg separado no PATH).
- Para medir duração/volume de um áudio gerado (sem `ffprobe` disponível), dá pra fazer parse manual do
  header WAV em Node (lido `sampleRate`/`bitsPerSample`/chunk `data` e calcular amostras) — já testado e
  funcionando durante a avaliação do VoiceStudio nesta sessão.
- Ao criar arquivos grandes, prefira a ferramenta de escrita de arquivos a heredocs longos no shell (já
  houve falhas com isso no projeto do Davi).
- Windows: cuidado com encoding UTF-8 ao montar JSON com acentos via variável de shell interpolada
  diretamente num `curl -d` — escreva o payload num arquivo (UTF-8) e use `--data-binary @arquivo.json`.

## 3. Stack e estrutura sugerida
```
package.json            scripts: voice, duration, render (e voiceN/renderN por episódio, se preferir)
hyperframes.config.*    config do HyperFrames (resolução, fps) — nome exato a confirmar no `init`
src/
  scriptN.json          ROTEIRO de cada episódio: cenas com falas de Jorge e/ou Pedro (ver seção 8/12)
  epN.html              composição HyperFrames do episódio (gerada a partir do scriptN.json + durações
                         pré-calculadas; ver seção 4.3) — HTML puro com `.clip[data-start][data-duration]`
  bubble.js/.css         componente de balão de fala (texto + rabicho apontando pro personagem ativo) e
                         troca de retrato conforme o `speaker`/`mood` da fala atual — ver seção 5
  logos.js/.css          logo/banner/marca d'água do canal Jorge
assets/
  characters/            retratos gerados manualmente pelo usuário (ver seção 5): jorge-<mood>.png,
                         pedro-<mood>.png — asset fixo, reaproveitado em todos os episódios
scripts/
  gen-voice.mjs          gera public/voice/<id>.mp3 por FALA (não mais por cena) com node-edge-tts,
                          escolhendo a voz pt-BR certa conforme o `speaker` da fala (jorge | pedro)
  gen-durations.mjs      NOVO passo (não existia no projeto do Davi): mede a duração de cada
                          public/voice/<id>.mp3 e grava um mapa {id: durationSec} — usado para montar os
                          `data-duration` do HTML do episódio antes do render
  gen-audio.mjs          sintetiza public/audio/*.wav (trilha + efeitos)
  build-episode.mjs      NOVO: lê scriptN.json + mapa de durações e gera src/epN.html com os `data-start`/
                          `data-duration` já calculados (substitui o `calculateMetadata` do Remotion)
public/
  voice/                 uma narração por FALA (não por cena)
  audio/                 trilha + efeitos (piano/cordas suaves, página virando, sino leve, ambiente de luz)
brand/                   identidade visual do canal Jorge
final/                   vídeos prontos
episodes/                manifesto epNN.json por episódio (contrato com o hub, ver seção 9)
```
`scripts/gen-voice.mjs` e `gen-audio.mjs` podem reaproveitar boa parte da lógica (retry de 429, síntese de
áudio em JS) do repositório do Davi — é infraestrutura genérica. O que muda de verdade é a ausência do
`calculateMetadata`: `gen-durations.mjs` + `build-episode.mjs` assumem esse papel como passo explícito do
pipeline, rodando **antes** do `npx hyperframes render`.

## 4. Como o vídeo é montado
1. **Roteiro** em `src/scriptN.json`: lista de cenas, cada cena com uma ou mais **falas** `{id, speaker
   (jorge|pedro), visual, caption, text}` — ver formato completo na seção 8/12. A última cena (`end`) não
   tem fala e mostra uma chamada pra ação (ex.: "SEGUE PRA MAIS ENSINAMENTOS"), **não** "PARTE N".
2. **Voz**: `node-edge-tts`, **uma voz pt-BR por personagem** (ver seção 4.2).
   **Descoberta importante (testado nesta sessão)**: o Edge-TTS gratuito **só expõe 3 vozes pt-BR no
   total** (confirmado consultando diretamente o endpoint
   `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list`, não o catálogo
   pago completo do Azure Speech): `pt-BR-AntonioNeural` (M), `pt-BR-FranciscaNeural` (F),
   `pt-BR-ThalitaMultilingualNeural` (F). Vozes de outros nomes (`NicolauNeural`, `JulioNeural`,
   `ValerioNeural` etc.) existem no Azure Speech pago mas **não funcionam** nesse canal gratuito —
   dão erro 429 persistente (não é rate limit de verdade, é voz indisponível nesse endpoint). **Só existe
   uma voz masculina** nesse canal.
   - **Pedro** (pastor, mestre): `pt-BR-AntonioNeural` (M, calmo e acolhedor), `rate` levemente mais lento
     (`+0%` a `+5%`, ajustar ouvindo).
   - **Jorge** (menino, aprendiz): como não há 2ª voz masculina, usar uma **voz feminina pitchada pra
     soar mais jovem** — convenção comum de dublagem (mulher dublando menino). **Decidido**:
     `pt-BR-ThalitaMultilingualNeural`, com `pitch: '+15Hz'` e `rate: '+5%'` (escolhida pelo usuário em
     2026-10-20, ouvindo `public/voice-tests/jorge-thalita.mp3` vs. a alternativa `-francisca.mp3`).
   - Se um dia aparecer uma 2ª voz masculina no catálogo gratuito, trocar o Jorge para ela é preferível.
   - Edge-TTS pode responder 429 por rajada de requisições em sequência rápida (não confundir com o caso
     acima de voz indisponível) — nesse caso sim vale espera crescente, mas **sem hammering**: um request
     isolado funciona mesmo logo depois de falhas; evitar loops de retry agressivos.
3. **Duração automática (muda de mecanismo com o HyperFrames)**: não existe mais `calculateMetadata`
   assíncrono. O fluxo passa a ser: (1) `gen-voice.mjs` gera o MP3 de cada fala; (2) `gen-durations.mjs`
   mede a duração real de cada MP3 (parse de header, já que não há `ffprobe` garantido — ver seção 2);
   (3) `build-episode.mjs` soma duração da fala + ~0,35s de respiro e escreve esse valor em segundos no
   `data-duration` do clip correspondente no HTML do episódio. Meta de duração por episódio: **~45–60 s**
   (gancho → versículo → diálogo de explicação → aplicação → fechamento).
4. **Visual**: canvas 1080x1920, formato retrato estático + balão de fala (ver seção 0 e seção 5). O
   retrato do `speaker` da fala atual ocupa a maior parte do quadro (full-bleed, como no vídeo de
   referência), trocando de imagem conforme muda quem fala e/ou o `mood` da fala (ex.: jorge-worried →
   jorge-curious → jorge-relieved). O texto da fala aparece em **balão sobreposto** (estilo
   story/quadrinho), não mais como legenda de rodapé fixa. Zoom/parallax leve (CSS/GSAP) na imagem dá
   sensação de movimento sem precisar animar o personagem.
5. **Personagens Jorge e Pedro**: não são mais desenhados por código — são imagens estáticas (retratos)
   gerados manualmente pelo usuário, um conjunto de expressões por personagem, trocadas via código
   conforme a fala. Ver especificação exata do que gerar na seção 5.
6. **Áudio**: mesma arquitetura de trilha/efeitos por cena do projeto do Davi, mas com paleta sonora
   diferente (ver seção 7) e agora com **múltiplas faixas via `data-track-index`** do HyperFrames
   (narração de um personagem + narração do outro quando há sobreposição curta tipo interrupção + trilha
   + efeitos). Trilha e efeitos continuam **sintetizados em JavaScript**, nunca assets externos.
7. **Render**: `npx hyperframes render` (confirmar flags exatas de resolução/fps/bitrate de áudio ao
   rodar o `init` do projeto — documentação em hyperframes.heygen.com). Entregar sempre duas versões de
   áudio, como no projeto do Davi: AAC (para postar) e MP3 (para players que não tocam AAC) via FFmpeg.

## 5. Personagens — especificação dos retratos a gerar (usuário gera manualmente, ver seção 0)
Formato de entrega decidido: **retrato quase estático + balão de fala** (não mais personagem articulado).
Isso significa que, em vez de um componente de código que desenha o personagem, precisamos de um pequeno
**conjunto de imagens por personagem** — uma por "mood"/expressão — gerado uma única vez e reaproveitado
em todos os episódios.

### O que gerar, por personagem
| Arquivo | Personagem | Expressão/uso |
|---|---|---|
| `jorge-worried.png` | Jorge (menino) | Preocupado/com medo — cena de gancho |
| `jorge-curious.png` | Jorge | Dúvida/pergunta — quando interrompe o Pedro |
| `jorge-relieved.png` | Jorge | Aliviado/sorrindo, entendendo — aplicação prática e fechamento |
| `pedro-warm.png` | Pedro (pastor) | Acolhedor/neutro, olhando pro Jorge — base, cena do versículo |
| `pedro-teaching.png` | Pedro | Explicando, gesto com a mão ou apontando pra Bíblia aberta — explicação |
| `pedro-smiling.png` | Pedro | Sorriso incentivador — aplicação prática |

(6 imagens no total pra cobrir o `script-ep01.json` atual; dá pra pedir 1-2 a mais de cada se quiser
variação extra pra episódios futuros, mas não é obrigatório começar com isso.)

### Especificação técnica (importante pra consistência entre as imagens)
- **Enquadramento**: busto/peito pra cima, personagem centralizado, mesmo ângulo de câmera (de frente ou
  levemente de 3/4) em **todas** as imagens do mesmo personagem — senão a troca de expressão fica
  "pulando" de pose.
- **Fundo**: cor sólida lisa (branco ou verde puro), sem cenário desenhado — assim dá pra recortar/tratar
  o fundo no código e controlar o ambiente por CSS (gradiente, luz) em vez de depender da IA acertar o
  cenário de cada cena.
- **Resolução**: a maior que a ferramenta permitir, em proporção retrato (ex.: 2:3 ou 3:4), mesma
  resolução entre todas as imagens do mesmo personagem.
- **Consistência entre expressões**: gerar todas as poses de um mesmo personagem na mesma conversa/sessão
  da ferramenta de imagem (ou usando a imagem já aprovada como referência/edição para as próximas), com a
  **mesma descrição de personagem palavra por palavra** a cada prompt (roupa, cabelo, idade, estilo) —
  isso é o que mais ajuda a manter o mesmo "rosto" entre uma expressão e outra.
- **Estilo**: quadrinho/pintura digital, semelhante ao vídeo de referência (@crimecarton) — traços
  suaves, sombreado pintado, acabamento de capa de graphic novel, não fotorrealista e não vetor flat.
- **Nomenclatura**: salvar exatamente como `jorge-worried.png`, `jorge-curious.png`, etc. (tabela acima),
  pra eu conseguir referenciar direto em `assets/characters/` sem precisar renomear.

### Proposta de aparência (ajustar à vontade, isso só orienta o prompt de geração)
- **Jorge**: criança, aparência de ~8 a 10 anos, roupa simples e atemporal (camiseta lisa), sem símbolo de
  denominação específica.
- **Pedro**: homem de meia-idade, semblante gentil, roupa simples e atemporal (camisa social de manga
  arregaçada ou suéter em tom terroso/azul petróleo), pode segurar uma Bíblia aberta como prop recorrente,
  sem símbolo de denominação específica (canal ecumênico/genérico).
- **Em aberto, à escolha do usuário na hora de gerar**: tom de pele, cor de cabelo, barba ou não no Pedro.

### Cena/composição (decidido)
Formato retrato único em tela cheia: aparece o retrato de **quem está falando no momento**, com o balão
de fala sobreposto — não os dois personagens simultaneamente no quadro. A troca de retrato ao mudar de
falante já cria a dinâmica de conversa (como um "corte" de entrevista).

## 6. Paleta visual (ponto em aberto)
Sugestão para transmitir acolhimento/esperança (em vez da paleta tensa do "Sem Sinal"): tons quentes e
suaves — dourado `#f4c430`/`#ffe9a0`, bege/creme de fundo, azul-petróleo `#2c6a8a` como cor de apoio,
luz suave (raios de sol, brilho dourado no texto do versículo). **Evitar** paleta escura/tensa do canal
do Davi. Cenários sugeridos conforme o tema do versículo: interior acolhedor tipo estúdio/biblioteca,
campo aberto ao amanhecer, página de Bíblia iluminada em destaque na cena do versículo.

## 7. Áudio (paleta sonora própria)
Sintetizar em `scripts/gen-audio.mjs` (mesma técnica do projeto do Davi, sem assets externos):
- **Trilha**: piano ou cordas suaves, harmônicas, tom maior, andamento lento — o oposto do dreadcore do
  "Sem Sinal". Nada de batimento cardíaco nem drones tensos.
- **Efeitos**: página de livro virando (na cena do versículo), sino/carrilhão leve (ênfase em frases-chave),
  ambiente leve de vento ou pássaros ao fundo (cenas externas), sem efeitos de perigo/susto.
- Mesma lição aprendida do projeto do Davi: testar em alto-falante pequeno, verificar a distribuição de
  frequências (não confiar só no RMS), e manter os efeitos num volume bem mais baixo que a voz.

## 8. Formato do roteiro de um episódio (~50 s, autônomo, em diálogo)
| Tempo aprox. | Função | Quem fala |
|---|---|---|
| 0–5 s | **Gancho**: Jorge traz uma dúvida/medo real, em 1ª pessoa (não mais uma pergunta ao espectador em 2ª pessoa) | Jorge |
| 5–15 s | **O versículo**: Pedro responde citando a referência + texto completo, com destaque visual (ex.: texto "brilhando" numa Bíblia aberta) | Pedro |
| 15–35 s | **Explicação**: Pedro explica o que o versículo quer dizer; Jorge pode interromper com uma pergunta de esclarecimento no meio | Pedro (+ Jorge) |
| 35–45 s | **Aplicação prática**: Pedro propõe algo concreto pro dia a dia; Jorge reage (entendendo/aliviado) | Pedro (+ Jorge) |
| 45–50 s | **Fechamento**: Jorge resume o que aprendeu com as próprias palavras (reforça a mensagem) + tela final com chamada pra seguir o canal | Jorge |

Tom: calmo, acolhedor, conversa natural entre quem aprende e quem ensina (não mais narração em 2ª pessoa
direta ao espectador — o espectador "escuta" a conversa). **Sem** cliffhanger, **sem** "Parte N". Cada
vídeo deve funcionar sozinho, mesmo para quem nunca viu outro do canal.

### Formato de dado de cada cena (`scriptN.json`)
Cada cena agora tem uma lista de **falas**, cada uma com seu `speaker`:
```json
{
  "id": "e1s1",
  "visual": "e1hook",
  "lines": [
    { "id": "e1s1-l1", "speaker": "jorge", "mood": "worried", "caption": "SERÁ QUE ISSO É ERRADO?",
      "text": "Pedro, essa semana eu fiquei com muito medo do que pode acontecer amanhã. Pra quem confia em Deus, sentir medo assim é errado?" }
  ]
}
```
`mood` seleciona qual retrato de `assets/characters/<speaker>-<mood>.png` aparece em tela (ver seção 5
pra lista de moods disponíveis por personagem). Uma cena pode ter mais de uma fala (ex.: Pedro responde e
Jorge interrompe com uma pergunta curta na mesma cena/cenário). Cada fala vira um arquivo de áudio próprio
(`public/voice/e1s1-l1.mp3`) e um clip próprio no HyperFrames, com `data-start` sequencial e
`data-duration` calculado a partir do áudio real (ver seção 4.3).

## 9. Manifesto de episódio (contrato com o repositório hub)
Igual ao projeto do Davi: cada episódio aprovado/gerado deve ter `episodes/epNN.json` com os campos
`id`, `channel` (`"jorge"`), `series` (pode ser `null` ou um nome de "temporada"/tema, já que os episódios
são avulsos), `episode`, `partTitle` (aqui, use o título do ensinamento/versículo, ex.: "Não Temas —
Isaías 41:10"), `video`, `videoAudioMp3`, `durationSec`, `aiGenerated: true`, `status`
(`draft`|`approved`|`scheduled`|`published`), `scheduledDate`, e `platforms.{youtube,instagram,tiktok}`
com título/legenda/hashtags e `url: null`. **Sempre incluir "Conteúdo gerado por IA" nas legendas/descrição**
antes de publicar. O canal só cria como `draft`; quem aprova é o usuário. Nunca salvar tokens/senhas no
repositório.

## 10. Checklist de entrega de cada episódio (igual ao projeto do Davi)
1. Roteiro aprovado pelo usuário (mostrar em tabela por cena antes de codar).
2. Gerar voz → gerar áudio (se a trilha mudar) → `tsc --noEmit` → stills de cada cena → corrigir
   sobreposições.
3. Render do MP4 (AAC) e cópia com áudio MP3.
4. Medir que o áudio existe e tem nível (RMS) e que a duração fica perto da meta (~50 s).
5. Informar ao usuário: caminho dos arquivos, duração, o que ele precisa conferir, e limitações (o Claude
   não consegue ouvir o áudio, só medir nível).
6. Só fazer `git push` quando o usuário pedir.

## 11. Decisões ainda em aberto
- **Bloqueador atual**: usuário precisa gerar e entregar os 6 retratos listados na seção 5
  (`jorge-worried.png`, `jorge-curious.png`, `jorge-relieved.png`, `pedro-warm.png`, `pedro-teaching.png`,
  `pedro-smiling.png`) antes de montar o primeiro episódio.
- ~~Voz do Jorge~~ — **decidido**: `pt-BR-ThalitaMultilingualNeural` (ver seção 4.2).
- Nome definitivo do canal/marca (apenas "Jorge", ou um nome de marca tipo "Jorge e Pedro"?), logo e
  paleta final.
- Se os episódios terão algum agrupamento por tema/temporada (ex.: "Fé", "Ansiedade", "Perdão") mesmo
  sendo avulsos, para fins de organização no hub.
- Confirmar se FFmpeg precisa ser instalado separadamente para o `npx hyperframes render` neste ambiente
  Windows, ou se já vem embutido como no `npx remotion ffmpeg` do projeto do Davi.

## 12. Roteiro de exemplo (já em formato de diálogo, aprovado pelo usuário)
`script-ep01.json` — episódio 1, versículo **Isaías 41:10** ("Não temas, porque eu sou contigo..."),
reescrito como conversa entre Jorge (medo) e Pedro (ensinamento), 5 cenas de diálogo (`e1s1`-`e1s5`) + 1
cena final de CTA (`e1end`), cada fala com `speaker` e `mood` (ver seção 5 pra lista de moods/imagens
necessárias — são exatamente os 6 moods usados neste roteiro: `jorge-worried`, `jorge-curious`,
`jorge-relieved`, `pedro-warm`, `pedro-teaching`, `pedro-smiling`). Aprovado pelo usuário em 2026-10-20.
Falta só o usuário gerar e entregar os 6 retratos (seção 5) pra eu poder montar o episódio.

## 13. ESTADO ATUAL (atualizado em 2026-10-22) — LEIA ISTO PRIMEIRO AO RETOMAR
Decisões finais que **substituem** o que está nas seções 0–5 acima onde houver conflito:
- **Motor de vídeo: Remotion 4.0.230** (igual ao MCP 5), não HyperFrames. Código em `src/` (`Ep01.tsx`,
  `timeline.ts`, `Root.tsx`). Duração vem de `src/durations.json`, gerado por `npm run durations` depois das vozes.
- **Vozes: VoiceStudio via MCP** (`scripts/vs-client.mjs`, `scripts/build-voices.mjs`), voz descrita por `instruct`
  (Jorge "male, child, high pitch"; Pedro "male, middle-aged, low pitch"), 1ª fala de cada um vira perfil clonado.
  Backend já roda em `127.0.0.1:3900` (CPU; iniciado a partir do MCP 5, base de áudio `../MCP 5/voz-studio-out`).
  CPU é lento (~47x o tempo do áudio). Saída em `public/voice/<id>.wav` com cache em `public/voice/progress.json`.
  Log da geração: `out/voices.log`. Se o processo morrer, é só rodar `node scripts/build-voices.mjs` de novo (retoma).
  As vozes de rascunho do Edge-TTS (`public/voice/*.mp3`, `npm run voices:edge`) são só fallback; o `gen-durations`
  prefere `.wav` quando existe.
- **Arte: retratos gerados no Gemini** (usuário), em `assets/characters/` e copiados para `public/images/`
  (`<speaker>-<mood>.jpg`). Referências em `assets/reference/`. **Falta `jorge-relieved`** (hoje é cópia de
  `jorge-curious` em `public/images/jorge-relieved.jpg`; trocar quando o usuário gerar). `pedro-teaching` é provisório (sem Bíblia).
- Primeira versão renderizada: `out/ep01.mp4` (80 s). Comando: `npm run render`.
- **Próximos passos**: (1) esperar `build-voices.mjs` terminar; (2) `npm run durations`; (3) conferir stills/áudio;
  (4) `npm run render`; (5) trilha/efeitos sintetizados (`scripts/gen-audio.mjs`); (6) enxugar falas se passar de ~60 s.
- **2026-10-22 noite**: vozes do VoiceStudio geradas (8 falas, `public/voice/*.wav`) e vídeo renderizado: `out/ep01-vs.mp4`
  (70 s, trilha + sino + volumes equalizados por fala via `gain` em `src/durations.json`). Pendente: `jorge-relieved`
  (imagem do Jorge sorrindo, ainda cópia de `jorge-curious`), ouvir/aprovar as vozes, revisar ritmo.
