import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { handleAnalyzeRequest } from "./analyzeRoute";
import { handleEditRequest } from "./editRoute";

const port = Number(process.env.API_PORT ?? 3001);

const server = createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    writeJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && request.url === "/api/analyze") {
    const body = await readJsonBody(request);
    const result = await handleAnalyzeRequest(body);
    writeJson(response, result.status, result.body);
    return;
  }

  if (request.method === "POST" && request.url === "/api/edit") {
    const body = await readJsonBody(request);
    const result = await handleEditRequest(body);
    writeJson(response, result.status, result.body);
    return;
  }

  writeJson(response, 404, { error: "not_found" });
});

server.listen(port, () => {
  console.log(`Analyze API listening on http://localhost:${port}`);
});

function writeJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
