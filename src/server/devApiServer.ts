import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { handleAnalyzeRequest } from "./analyzeRoute";
import { handleEditRequest } from "./editRoute";
import {
  handleCreateImageJobRequest,
  handleGenerateImageRequest,
  handleGetImageJobRequest,
  handleRemoveBackgroundRequest
} from "./imageRoute";
import { handleCreateUploadIntentRequest } from "./uploadRoute";

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
const host = process.env.API_HOST ?? "0.0.0.0";

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

  if (request.method === "POST" && request.url === "/api/uploads/presign") {
    const body = await readJsonBody(request);
    const result = await handleCreateUploadIntentRequest(body);
    writeJson(response, result.status, result.body);
    return;
  }

  if (request.method === "POST" && request.url === "/api/images/generate") {
    const body = await readJsonBody(request);
    const result = await handleGenerateImageRequest(body);
    writeJson(response, result.status, result.body);
    return;
  }

  if (request.method === "POST" && request.url === "/api/images/jobs") {
    const body = await readJsonBody(request);
    const result = await handleCreateImageJobRequest(body);
    writeJson(response, result.status, result.body);
    return;
  }

  if (request.method === "GET" && request.url?.startsWith("/api/images/jobs/")) {
    const jobId = decodeURIComponent(request.url.replace("/api/images/jobs/", ""));
    const result = handleGetImageJobRequest(jobId);
    writeJson(response, result.status, result.body);
    return;
  }

  if (request.method === "POST" && request.url === "/api/images/remove-background") {
    const body = await readJsonBody(request);
    const result = await handleRemoveBackgroundRequest(body);
    writeJson(response, result.status, result.body);
    return;
  }

  writeJson(response, 404, { error: "not_found" });
});

server.listen(port, host, () => {
  console.log(`Analyze API listening on http://${host}:${port}`);
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
