import { createServerIntegrationConfig, type ServerIntegrationConfig } from "./env";
import { createUploadIntent, type UploadIntent } from "./storage";

export type UploadIntentRouteResponse =
  | {
      status: 200;
      body: UploadIntent;
    }
  | {
      status: 400 | 500;
      body: {
        error: string;
      };
    };

export async function handleCreateUploadIntentRequest(
  body: unknown,
  configOverrides: Partial<ServerIntegrationConfig> = {}
): Promise<UploadIntentRouteResponse> {
  const parsed = parseUploadIntentBody(body);
  if (!parsed.ok) {
    return {
      status: 400,
      body: { error: parsed.error }
    };
  }

  try {
    const intent = await createUploadIntent(parsed.body, createServerIntegrationConfig(configOverrides));
    return {
      status: 200,
      body: intent
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        error: error instanceof Error ? error.message : "upload_intent_failed"
      }
    };
  }
}

function parseUploadIntentBody(value: unknown):
  | {
      ok: true;
      body: {
        fileName: string;
        contentType: string;
        ownerId?: string;
      };
    }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "invalid_body" };
  }

  const record = value as Record<string, unknown>;
  if (typeof record.fileName !== "string" || record.fileName.trim().length === 0) {
    return { ok: false, error: "invalid_file_name" };
  }

  if (typeof record.contentType !== "string" || record.contentType.trim().length === 0) {
    return { ok: false, error: "invalid_content_type" };
  }

  return {
    ok: true,
    body: {
      fileName: record.fileName,
      contentType: record.contentType,
      ownerId: typeof record.ownerId === "string" ? record.ownerId : undefined
    }
  };
}
