import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";

import { type ServerIntegrationConfig } from "./env";

export type UploadIntentRequest = {
  fileName: string;
  contentType: string;
  ownerId?: string;
};

export type UploadIntent = {
  provider: "mock" | "s3";
  key: string;
  uploadUrl: string;
  publicUrl?: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresInSeconds: number;
};

export async function createUploadIntent(
  request: UploadIntentRequest,
  config: ServerIntegrationConfig,
  signer: typeof getSignedUrl = getSignedUrl
): Promise<UploadIntent> {
  const safeContentType = normalizeImageContentType(request.contentType);
  const key = createObjectKey(request.fileName, request.ownerId);
  const expiresInSeconds = 900;

  if (config.storage.provider !== "s3") {
    return {
      provider: "mock",
      key,
      uploadUrl: `mock://uploads/${key}`,
      publicUrl: config.storage.publicBaseUrl ? joinUrl(config.storage.publicBaseUrl, key) : undefined,
      method: "PUT",
      headers: {
        "Content-Type": safeContentType
      },
      expiresInSeconds
    };
  }

  const missing = missingStorageConfig(config);
  if (missing.length > 0) {
    throw new Error(`Missing storage config: ${missing.join(",")}`);
  }

  const client = new S3Client({
    region: config.storage.region,
    endpoint: config.storage.endpoint,
    forcePathStyle: Boolean(config.storage.endpoint),
    credentials: {
      accessKeyId: config.storage.accessKeyId!,
      secretAccessKey: config.storage.secretAccessKey!
    }
  });

  const command = new PutObjectCommand({
    Bucket: config.storage.bucket!,
    Key: key,
    ContentType: safeContentType
  });

  const uploadUrl = await signer(client, command, { expiresIn: expiresInSeconds });

  return {
    provider: "s3",
    key,
    uploadUrl,
    publicUrl: config.storage.publicBaseUrl ? joinUrl(config.storage.publicBaseUrl, key) : undefined,
    method: "PUT",
    headers: {
      "Content-Type": safeContentType
    },
    expiresInSeconds
  };
}

function missingStorageConfig(config: ServerIntegrationConfig) {
  const missing: string[] = [];
  if (!config.storage.bucket) missing.push("STORAGE_BUCKET");
  if (!config.storage.accessKeyId) missing.push("STORAGE_ACCESS_KEY_ID");
  if (!config.storage.secretAccessKey) missing.push("STORAGE_SECRET_ACCESS_KEY");
  return missing;
}

function normalizeImageContentType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "image/jpeg" || normalized === "image/png" || normalized === "image/webp") {
    return normalized;
  }

  throw new Error("Unsupported image content type");
}

function createObjectKey(fileName: string, ownerId?: string) {
  const extension = normalizeExtension(extname(fileName));
  const ownerPrefix = ownerId ? slug(ownerId) : "anonymous";
  return `uploads/${ownerPrefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;
}

function normalizeExtension(extension: string) {
  const normalized = extension.toLowerCase();
  if (normalized === ".jpg" || normalized === ".jpeg" || normalized === ".png" || normalized === ".webp") {
    return normalized === ".jpeg" ? ".jpg" : normalized;
  }

  return ".jpg";
}

function slug(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
}

function joinUrl(baseUrl: string, key: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
