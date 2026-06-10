import { type ServerIntegrationConfig } from "./env";
import { type ModelRouterConfig } from "./modelRouter";
import { storeGeneratedImage, type StoredObjectUploader } from "./storage";

export type ImageGenerationMode = "seller_cover" | "clean_background" | "lifestyle_scene";

export type ImageGenerationRequest = {
  mode: ImageGenerationMode;
  prompt: string;
  productImageUrl?: string;
  size?: "1024x1024" | "1024x1536" | "1536x1024";
  ownerId?: string;
};

export type ImageGenerationResult = {
  provider: "mock" | "openai";
  model: string;
  imageUrl?: string;
  base64?: string;
  fallbackReason?: string;
  storageProvider?: "mock" | "s3";
  storageKey?: string;
};

export type ImageGenerationFetcher = (
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

export async function generateSellerImage({
  request,
  config,
  imageModel,
  storageConfig,
  fetcher = fetch as ImageGenerationFetcher,
  generatedImageUploader
}: {
  request: ImageGenerationRequest;
  config: ModelRouterConfig;
  imageModel: string;
  storageConfig?: ServerIntegrationConfig["storage"];
  fetcher?: ImageGenerationFetcher;
  generatedImageUploader?: StoredObjectUploader;
}): Promise<ImageGenerationResult> {
  if (!config.openaiApiKey) {
    return mockImageResult(imageModel, "missing_openai_key");
  }

  try {
    const response = await fetcher(`${config.openaiBaseUrl}/images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: imageModel,
        prompt: buildImagePrompt(request),
        size: request.size ?? "1024x1024",
        response_format: "b64_json"
      })
    });

    if (!response.ok) {
      return mockImageResult(imageModel, "image_generation_failed");
    }

    const payload = await response.json();
    const data = asRecord(payload).data;
    const first = Array.isArray(data) ? data[0] : undefined;
    const record = first ? asRecord(first) : {};
    const base64 = typeof record.b64_json === "string" ? record.b64_json : undefined;
    const imageUrl = typeof record.url === "string" ? record.url : undefined;

    if (!base64 && !imageUrl) {
      return mockImageResult(imageModel, "missing_image_output");
    }

    if (base64 && storageConfig) {
      const stored = await storeGeneratedImage(
        {
          base64,
          ownerId: request.ownerId
        },
        storageConfig,
        generatedImageUploader
      );

      return {
        provider: "openai",
        model: imageModel,
        base64,
        imageUrl: stored.publicUrl ?? imageUrl,
        storageProvider: stored.provider,
        storageKey: stored.key
      };
    }

    return {
      provider: "openai",
      model: imageModel,
      base64,
      imageUrl
    };
  } catch {
    return mockImageResult(imageModel, "image_generation_request_failed");
  }
}

function buildImagePrompt(request: ImageGenerationRequest) {
  const guardrails = [
    "Create a truthful seller image for a second-hand or small-commerce listing.",
    "Do not alter the product identity, brand, shape, color, condition, scratches, wear marks, or accessories.",
    "Use clean commercial composition, readable negative space, and platform-ready lighting."
  ];

  const modeInstruction: Record<ImageGenerationMode, string> = {
    seller_cover: "Output a strong cover image suitable for Xianyu, Xiaohongshu, or a small shop listing.",
    clean_background: "Keep the product truthful while producing a clean neutral product-photo background.",
    lifestyle_scene: "Place the product in a realistic lifestyle scene without changing the product itself."
  };

  return [...guardrails, modeInstruction[request.mode], request.productImageUrl ? `Reference product image: ${request.productImageUrl}` : "", request.prompt]
    .filter(Boolean)
    .join("\n");
}

function mockImageResult(model: string, fallbackReason: string): ImageGenerationResult {
  return {
    provider: "mock",
    model,
    imageUrl: "mock://generated/seller-image",
    fallbackReason
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
