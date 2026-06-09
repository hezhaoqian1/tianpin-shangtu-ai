import { removeProductBackground } from "./backgroundRemoval";
import { createServerIntegrationConfig, type ServerIntegrationConfig } from "./env";
import { generateSellerImage, type ImageGenerationRequest } from "./imageGeneration";
import { createModelRouterConfig, type ModelRouterConfig } from "./modelRouter";

export type ImageRouteResponse =
  | {
      status: 200;
      body: unknown;
    }
  | {
      status: 400;
      body: {
        error: string;
      };
    };

export async function handleGenerateImageRequest(
  body: unknown,
  configOverrides: Partial<ModelRouterConfig> = {},
  integrationOverrides: Partial<ServerIntegrationConfig> = {}
): Promise<ImageRouteResponse> {
  const parsed = parseImageGenerationBody(body);
  if (!parsed.ok) {
    return {
      status: 400,
      body: { error: parsed.error }
    };
  }

  const integrationConfig = createServerIntegrationConfig(integrationOverrides);
  const result = await generateSellerImage({
    request: parsed.body,
    config: createModelRouterConfig(configOverrides),
    imageModel: integrationConfig.imageGeneration.model
  });

  return {
    status: 200,
    body: result
  };
}

export async function handleRemoveBackgroundRequest(
  body: unknown,
  integrationOverrides: Partial<ServerIntegrationConfig> = {}
): Promise<ImageRouteResponse> {
  const parsed = parseRemoveBackgroundBody(body);
  if (!parsed.ok) {
    return {
      status: 400,
      body: { error: parsed.error }
    };
  }

  const result = await removeProductBackground({
    request: parsed.body,
    config: createServerIntegrationConfig(integrationOverrides)
  });

  return {
    status: 200,
    body: result
  };
}

function parseImageGenerationBody(value: unknown):
  | {
      ok: true;
      body: ImageGenerationRequest;
    }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "invalid_body" };
  }

  const record = value as Record<string, unknown>;
  const mode = record.mode;
  if (mode !== "seller_cover" && mode !== "clean_background" && mode !== "lifestyle_scene") {
    return { ok: false, error: "invalid_mode" };
  }

  if (typeof record.prompt !== "string" || record.prompt.trim().length === 0) {
    return { ok: false, error: "invalid_prompt" };
  }

  const size = record.size;
  if (size !== undefined && size !== "1024x1024" && size !== "1024x1536" && size !== "1536x1024") {
    return { ok: false, error: "invalid_size" };
  }

  return {
    ok: true,
    body: {
      mode,
      prompt: record.prompt,
      productImageUrl: typeof record.productImageUrl === "string" ? record.productImageUrl : undefined,
      size
    }
  };
}

function parseRemoveBackgroundBody(value: unknown):
  | {
      ok: true;
      body: {
        imageUrl: string;
      };
    }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "invalid_body" };
  }

  const record = value as Record<string, unknown>;
  if (typeof record.imageUrl !== "string" || record.imageUrl.trim().length === 0) {
    return { ok: false, error: "invalid_image_url" };
  }

  return {
    ok: true,
    body: {
      imageUrl: record.imageUrl
    }
  };
}
