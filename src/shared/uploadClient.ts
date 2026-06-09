export type UploadIntent = {
  provider: "mock" | "s3";
  key: string;
  uploadUrl: string;
  publicUrl?: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresInSeconds: number;
};

export type UploadIntentFetcher = (
  url: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
  }
) => Promise<{
  ok: boolean;
  json: () => Promise<unknown>;
}>;

export async function createUploadIntentForApp({
  endpoint,
  fileName,
  contentType,
  ownerId,
  fetcher = fetch as UploadIntentFetcher
}: {
  endpoint?: string;
  fileName: string;
  contentType: string;
  ownerId?: string;
  fetcher?: UploadIntentFetcher;
}): Promise<UploadIntent | undefined> {
  if (!endpoint) {
    return undefined;
  }

  const response = await fetcher(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fileName,
      contentType,
      ownerId
    })
  });

  if (!response.ok) {
    return undefined;
  }

  return normalizeUploadIntent(await response.json());
}

function normalizeUploadIntent(value: unknown): UploadIntent {
  const record = asRecord(value);
  const headers = asRecord(record.headers);
  const provider = stringValue(record.provider);
  const method = stringValue(record.method);

  if (provider !== "mock" && provider !== "s3") {
    throw new Error("Unsupported upload provider");
  }

  if (method !== "PUT") {
    throw new Error("Unsupported upload method");
  }

  return {
    provider,
    key: stringValue(record.key),
    uploadUrl: stringValue(record.uploadUrl),
    publicUrl: optionalString(record.publicUrl),
    method,
    headers: Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, stringValue(value)])),
    expiresInSeconds: numberValue(record.expiresInSeconds)
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new Error("Expected object");
  }

  return value as Record<string, unknown>;
}

function stringValue(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Expected string");
  }

  return value;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function numberValue(value: unknown): number {
  if (typeof value !== "number") {
    throw new Error("Expected number");
  }

  return value;
}
