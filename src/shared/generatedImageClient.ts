import { type PublishPack, type UploadedAsset } from "./productPipeline";

export type AppGeneratedImageSource = "remote" | "mock";
export type AppGeneratedImageFallbackReason = "missing_endpoint" | "remote_failed" | "missing_image_url";

export type AppGeneratedImageResult =
  | {
      source: "remote";
      asset: UploadedAsset;
      model?: string;
      storageProvider?: string;
    }
  | {
      source: "mock";
      fallbackReason: AppGeneratedImageFallbackReason;
    };

export type AppGeneratedImageFetcher = (
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

export async function generateCoverImageForApp({
  pack,
  uploads,
  endpoint,
  ownerId,
  fetcher = fetch as AppGeneratedImageFetcher
}: {
  pack: PublishPack;
  uploads: UploadedAsset[];
  endpoint?: string;
  ownerId?: string;
  fetcher?: AppGeneratedImageFetcher;
}): Promise<AppGeneratedImageResult> {
  if (!endpoint) {
    return {
      source: "mock",
      fallbackReason: "missing_endpoint"
    };
  }

  try {
    const response = await fetcher(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode: "seller_cover",
        size: "1024x1024",
        prompt: buildSellerCoverPrompt(pack),
        productImageUrl: findPrimaryProductUrl(uploads),
        ownerId
      })
    });

    if (!response.ok) {
      return {
        source: "mock",
        fallbackReason: "remote_failed"
      };
    }

    const body = asRecord(await response.json());
    const imageUrl = optionalString(body.imageUrl);
    if (!imageUrl) {
      return {
        source: "mock",
        fallbackReason: "missing_image_url"
      };
    }

    return {
      source: "remote",
      model: optionalString(body.model),
      storageProvider: optionalString(body.storageProvider),
      asset: {
        id: `generated_cover_${pack.id}`,
        uri: imageUrl,
        remoteUrl: imageUrl,
        mimeType: "image/png",
        label: "AI 生成封面",
        width: 1024,
        height: 1024
      }
    };
  } catch {
    return {
      source: "mock",
      fallbackReason: "remote_failed"
    };
  }
}

function buildSellerCoverPrompt(pack: PublishPack) {
  return [
    `Platform: ${pack.platform}`,
    `Pack style: ${pack.style}`,
    `Title options: ${pack.copy.titles.join(" / ")}`,
    `Description: ${pack.copy.description}`,
    "Generate one truthful seller cover image.",
    "Keep the product identity, condition, visible wear marks, and accessories honest.",
    "Use a clean mobile-commerce composition with enough space for listing text."
  ].join("\n");
}

function findPrimaryProductUrl(uploads: UploadedAsset[]) {
  const upload = uploads.find((asset) => asset.remoteUrl || !asset.uri.startsWith("sample://"));
  return upload?.remoteUrl ?? upload?.uri;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}
