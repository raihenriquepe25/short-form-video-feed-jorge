// Cliente mínimo do MCP do VoiceStudio (Streamable HTTP, JSON-RPC) para scripts de build.
// Uso como CLI:  node scripts/vs-client.mjs tools | call <tool> '<json-args>'
const URL_ = process.env.VOICESTUDIO_MCP || "http://127.0.0.1:3900/mcp/";

let sessionId = null;
let nextId = 1;

import http from "node:http";

// http puro (sem timeout): o fetch do Node desiste em 5 min e a síntese em CPU pode demorar mais.
function rawPost(body) {
  return new Promise((resolve, reject) => {
    const u = new URL(URL_);
    const headers = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };
    if (sessionId) headers["mcp-session-id"] = sessionId;
    const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: "POST", headers, timeout: 0 }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, sid: res.headers["mcp-session-id"], text: data }));
    });
    req.setTimeout(0);
    req.on("error", reject);
    req.end(JSON.stringify(body));
  });
}

async function post(body, { notify = false } = {}) {
  const res = await rawPost(body);
  if (res.sid) sessionId = res.sid;
  if (notify) return null;
  if (res.status >= 400) throw new Error(`HTTP ${res.status}: ${res.text.slice(0, 400)}`);
  const line = res.text.split("\n").find((l) => l.startsWith("data:"));
  const msg = JSON.parse(line ? line.slice(5).trim() : res.text);
  if (msg.error) throw new Error(`MCP erro: ${JSON.stringify(msg.error)}`);
  return msg.result;
}

export async function init() {
  if (sessionId) return;
  await post({ jsonrpc: "2.0", id: nextId++, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "fechamento-build", version: "1.0" } } });
  await post({ jsonrpc: "2.0", method: "notifications/initialized" }, { notify: true });
}

export async function listTools() {
  await init();
  return (await post({ jsonrpc: "2.0", id: nextId++, method: "tools/list", params: {} })).tools;
}

/** Chama uma ferramenta; devolve o JSON do primeiro bloco de texto (ou o resultado cru). */
export async function callTool(name, args = {}) {
  await init();
  const r = await post({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } });
  if (r.isError) throw new Error(`ferramenta ${name} falhou: ${JSON.stringify(r.content).slice(0, 600)}`);
  const t = (r.content || []).find((c) => c.type === "text");
  if (!t) return r;
  try { return JSON.parse(t.text); } catch { return t.text; }
}

if (process.argv[1] && process.argv[1].endsWith("vs-client.mjs")) {
  const [cmd, name, json] = process.argv.slice(2);
  if (cmd === "tools") {
    for (const t of await listTools()) console.log(`- ${t.name}: ${(t.description || "").split("\n")[0].slice(0, 110)}\n    ${JSON.stringify(t.inputSchema?.properties ? Object.keys(t.inputSchema.properties) : [])}`);
  } else if (cmd === "call") {
    console.log(JSON.stringify(await callTool(name, json ? JSON.parse(json) : {}), null, 2).slice(0, 4000));
  } else console.log("uso: tools | call <tool> '<json>'");
}
