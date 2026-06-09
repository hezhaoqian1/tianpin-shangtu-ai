import { type PublishPack } from "../shared/productPipeline";
import { createEditCommandWithModel } from "./editRouter";
import { createModelRouterConfig, type Fetcher, type ModelRouterConfig } from "./modelRouter";

export type EditRouteResponse =
  | {
      status: 200;
      body: {
        provider: string;
        fallbackReason?: string;
        command: Awaited<ReturnType<typeof createEditCommandWithModel>>["command"];
      };
    }
  | {
      status: 400;
      body: {
        error: string;
      };
    };

export async function handleEditRequest(
  body: unknown,
  configOverrides: Partial<ModelRouterConfig> = {},
  fetcher?: Fetcher
): Promise<EditRouteResponse> {
  const parsed = parseEditBody(body);
  if (!parsed.ok) {
    return {
      status: 400,
      body: { error: parsed.error }
    };
  }

  const result = await createEditCommandWithModel({
    pack: parsed.body.pack,
    userMessage: parsed.body.userMessage,
    config: createModelRouterConfig(configOverrides),
    fetcher
  });

  return {
    status: 200,
    body: {
      provider: result.provider,
      fallbackReason: result.fallbackReason,
      command: result.command
    }
  };
}

function parseEditBody(value: unknown): { ok: true; body: { userMessage: string; pack: PublishPack } } | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "invalid_body" };
  }

  const record = value as Record<string, unknown>;
  if (typeof record.userMessage !== "string" || record.userMessage.trim().length === 0) {
    return { ok: false, error: "invalid_user_message" };
  }

  if (!isPublishPack(record.pack)) {
    return { ok: false, error: "invalid_pack" };
  }

  return {
    ok: true,
    body: {
      userMessage: record.userMessage,
      pack: record.pack
    }
  };
}

function isPublishPack(value: unknown): value is PublishPack {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.platform === "string" &&
    typeof record.style === "string" &&
    Array.isArray(record.canvases) &&
    record.canvases.length > 0 &&
    Boolean(record.copy)
  );
}

