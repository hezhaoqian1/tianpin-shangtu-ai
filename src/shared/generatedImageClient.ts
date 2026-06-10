import { type PublishPack, type UploadedAsset } from "./productPipeline";

export type AppGeneratedImageSource = "remote" | "mock";
export type AppGeneratedImageFallbackReason = "missing_endpoint" | "remote_failed" | "missing_image_url";
export type AppGeneratedImageJobStatus = "queued" | "running" | "succeeded" | "failed";
export type GeneratedCoverVariantId = "xianyu_authentic" | "clean_shop" | "xiaohongshu_seed";

export type GeneratedCoverVariant = {
  id: GeneratedCoverVariantId;
  title: string;
  summary: string;
  promptInstruction: string;
};

export const generatedCoverVariants: GeneratedCoverVariant[] = [
  {
    id: "xianyu_authentic",
    title: "闲鱼真实风",
    summary: "个人卖家语气，保留二手成色和真实细节。",
    promptInstruction:
      "Xianyu authentic resale cover. Make it feel like a trustworthy personal seller listing, not a polished advertisement."
  },
  {
    id: "clean_shop",
    title: "干净主图风",
    summary: "清爽背景，主体明确，适合商品主图和小店。",
    promptInstruction:
      "Clean product main image. Use a neutral background, clear product focus, tidy lighting, and enough whitespace for mobile commerce."
  },
  {
    id: "xiaohongshu_seed",
    title: "小红书种草风",
    summary: "更有生活感和种草氛围，但不夸大成色。",
    promptInstruction:
      "Xiaohongshu lifestyle seeding cover. Add tasteful lifestyle context while keeping the product condition truthful and not over-polished."
  }
];

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

export type AppGeneratedImageJobCreateResult =
  | {
      source: "remote";
      jobId: string;
      status: AppGeneratedImageJobStatus;
    }
  | {
      source: "mock";
      fallbackReason: AppGeneratedImageFallbackReason;
    };

export type AppGeneratedImageJobSnapshot = {
  status: AppGeneratedImageJobStatus;
  asset?: UploadedAsset;
  fallbackReason?: AppGeneratedImageFallbackReason;
  error?: string;
};

export type AppGeneratedImageFetcher = (
  url: string,
  init: {
    method: "GET" | "POST";
    headers: Record<string, string>;
    body?: string;
  }
) => Promise<{
  ok: boolean;
  json: () => Promise<unknown>;
}>;

export async function createCoverImageJobForApp({
  pack,
  uploads,
  endpoint,
  ownerId,
  variant,
  fetcher = fetch as AppGeneratedImageFetcher
}: {
  pack: PublishPack;
  uploads: UploadedAsset[];
  endpoint?: string;
  ownerId?: string;
  variant?: GeneratedCoverVariant;
  fetcher?: AppGeneratedImageFetcher;
}): Promise<AppGeneratedImageJobCreateResult> {
  if (!endpoint) {
    return mockJobCreateResult("missing_endpoint");
  }

  try {
    const response = await fetcher(jobCollectionEndpoint(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(createGenerationPayload({ pack, uploads, ownerId, variant }))
    });

    if (!response.ok) {
      return mockJobCreateResult("remote_failed");
    }

    const body = asRecord(await response.json());
    const jobId = optionalString(body.jobId);
    const status = normalizeJobStatus(body.status);
    if (!jobId || !status) {
      return mockJobCreateResult("remote_failed");
    }

    return {
      source: "remote",
      jobId,
      status
    };
  } catch {
    return mockJobCreateResult("remote_failed");
  }
}

export async function getCoverImageJobForApp({
  pack,
  jobId,
  endpoint,
  variant,
  fetcher = fetch as AppGeneratedImageFetcher
}: {
  pack: PublishPack;
  jobId: string;
  endpoint?: string;
  variant?: GeneratedCoverVariant;
  fetcher?: AppGeneratedImageFetcher;
}): Promise<AppGeneratedImageJobSnapshot> {
  if (!endpoint) {
    return {
      status: "failed",
      fallbackReason: "missing_endpoint"
    };
  }

  try {
    const response = await fetcher(`${jobCollectionEndpoint(endpoint)}/${encodeURIComponent(jobId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return {
        status: "failed",
        fallbackReason: "remote_failed"
      };
    }

    const body = asRecord(await response.json());
    const status = normalizeJobStatus(body.status);
    if (!status) {
      return {
        status: "failed",
        fallbackReason: "remote_failed"
      };
    }

    if (status !== "succeeded") {
      return {
        status,
        error: optionalString(body.error)
      };
    }

    const result = asRecord(body.result);
    const imageUrl = optionalString(result.imageUrl);
    if (!imageUrl) {
      return {
        status: "failed",
        fallbackReason: "missing_image_url"
      };
    }

    return {
      status,
      asset: createGeneratedCoverAsset(pack, imageUrl, variant)
    };
  } catch {
    return {
      status: "failed",
      fallbackReason: "remote_failed"
    };
  }
}

export async function generateCoverImageForApp({
  pack,
  uploads,
  endpoint,
  ownerId,
  variant,
  fetcher = fetch as AppGeneratedImageFetcher
}: {
  pack: PublishPack;
  uploads: UploadedAsset[];
  endpoint?: string;
  ownerId?: string;
  variant?: GeneratedCoverVariant;
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
      body: JSON.stringify(createGenerationPayload({ pack, uploads, ownerId, variant }))
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
      asset: createGeneratedCoverAsset(pack, imageUrl, variant)
    };
  } catch {
    return {
      source: "mock",
      fallbackReason: "remote_failed"
    };
  }
}

function createGenerationPayload({
  pack,
  uploads,
  ownerId,
  variant
}: {
  pack: PublishPack;
  uploads: UploadedAsset[];
  ownerId?: string;
  variant?: GeneratedCoverVariant;
}) {
  return {
    mode: "seller_cover",
    size: "1024x1024",
    prompt: buildSellerCoverPrompt(pack, variant),
    productImageUrl: findPrimaryProductUrl(uploads),
    ownerId
  };
}

function buildSellerCoverPrompt(pack: PublishPack, variant?: GeneratedCoverVariant) {
  return [
    `Platform: ${pack.platform}`,
    `Pack style: ${pack.style}`,
    `Title options: ${pack.copy.titles.join(" / ")}`,
    `Description: ${pack.copy.description}`,
    variant ? `Cover variant: ${variant.title}` : "",
    variant ? variant.promptInstruction : "",
    "Generate one truthful seller cover image.",
    "Keep the product identity, condition, visible wear marks, and accessories honest.",
    "Use a clean mobile-commerce composition with enough space for listing text."
  ].filter(Boolean).join("\n");
}

function findPrimaryProductUrl(uploads: UploadedAsset[]) {
  const upload = uploads.find((asset) => asset.remoteUrl || !asset.uri.startsWith("sample://"));
  return upload?.remoteUrl ?? upload?.uri;
}

function createGeneratedCoverAsset(pack: PublishPack, imageUrl: string, variant?: GeneratedCoverVariant): UploadedAsset {
  const suffix = variant ? `_${variant.id}` : "";
  return {
    id: `generated_cover_${pack.id}${suffix}`,
    uri: imageUrl,
    remoteUrl: imageUrl,
    mimeType: "image/png",
    label: variant ? `AI 生成封面 · ${variant.title}` : "AI 生成封面",
    width: 1024,
    height: 1024
  };
}

function jobCollectionEndpoint(endpoint: string) {
  return endpoint.replace(/\/api\/images\/generate$/, "/api/images/jobs");
}

function normalizeJobStatus(value: unknown): AppGeneratedImageJobStatus | undefined {
  if (value === "queued" || value === "running" || value === "succeeded" || value === "failed") {
    return value;
  }

  return undefined;
}

function mockJobCreateResult(fallbackReason: AppGeneratedImageFallbackReason): AppGeneratedImageJobCreateResult {
  return {
    source: "mock",
    fallbackReason
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}
