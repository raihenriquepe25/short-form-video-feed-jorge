# Sobe o backend do VoiceStudio (OmniVoice) sem janela, na porta 3900, com o MCP em http://127.0.0.1:3900/mcp/
# O app Electron instalado em %LOCALAPPDATA%\Programs\VoiceStudio mantém o ambiente Python em
# %APPDATA%\VoiceStudio\runtime\project; aqui reaproveitamos esse ambiente e rodamos só o backend.
# Uso: powershell -File scripts/voicestudio-start.ps1 [-Stop]
param([switch]$Stop)

$project = Join-Path $env:APPDATA "VoiceStudio\runtime\project"
$python  = Join-Path $project ".venv\Scripts\python.exe"
$out     = Join-Path (Split-Path $PSScriptRoot -Parent) "voz-studio-out"
$log     = Join-Path $env:TEMP "voicestudio-backend.log"

if ($Stop) {
    Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'backend\\main.py' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
    "backend parado"; return
}
if (-not (Test-Path $python)) { throw "Ambiente Python do VoiceStudio não encontrado em $project (abra o app uma vez para ele instalar)." }

New-Item -ItemType Directory -Force $out | Out-Null
$out = (Resolve-Path $out).Path

$env:OMNIVOICE_PORT = "3900"
$env:OMNIVOICE_MCP_OUTPUT_MODE = "files"      # devolve URL/arquivo em vez de base64 gigante
$env:OMNIVOICE_MCP_BASE_PATH = $out           # pasta onde o MCP grava e lê áudio
$env:OMNIVOICE_CLIENT_ID = "claude-code"
# Em CPU, clonar voz + 32 passos passa dos 600 s padrao e o backend aborta o job (erro 503). Sobe para 1 h.
$env:OMNIVOICE_CPU_GENERATE_TIMEOUT_S = "3600"
$env:OMNIVOICE_GENERATE_TIMEOUT_S = "3600"
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue

$p = Start-Process -FilePath $python -ArgumentList "backend\main.py" -WorkingDirectory $project -WindowStyle Hidden `
     -RedirectStandardOutput $log -RedirectStandardError "$log.err" -PassThru
"backend iniciado (PID $($p.Id)); log: $log ; saída de áudio: $out"

for ($i = 0; $i -lt 60; $i++) {
    try { $null = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3900/.well-known/voicestudio-speech" -TimeoutSec 3; "pronto em $($i * 5)s"; return } catch { Start-Sleep 5 }
}
"ainda subindo após 300s — veja $log e $log.err"
