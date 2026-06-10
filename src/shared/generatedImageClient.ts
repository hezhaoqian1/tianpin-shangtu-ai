import { type PublishPack, type UploadedAsset } from "./productPipeline";

export type AppGeneratedImageSource = "remote" | "mock";
export type AppGeneratedImageFallbackReason = "missing_endpoint" | "remote_failed" | "missing_image_url";
export type AppGeneratedImageJobStatus = "queued" | "running" | "succeeded" | "failed";

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
  fetcher = fetch as AppGeneratedImageFetcher
}: {
  pack: PublishPack;
  uploads: UploadedAsset[];
  endpoint?: string;
  ownerId?: string;
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
      body: JSON.stringify(createGenerationPayload({ pack, uploads, ownerId }))
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
  fetcher = fetch as AppGeneratedImageFetcher
}: {
  pack: PublishPack;
  jobId: string;
  endpoint?: string;
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
      asset: createGeneratedCoverAsset(pack, imageUrl)
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
      body: JSON.stringify(createGenerationPayload({ pack, uploads, ownerId }))
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
      asset: createGeneratedCoverAsset(pack, imageUrl)
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
  ownerId
}: {
  pack: PublishPack;
  uploads: UploadedAsset[];
  ownerId?: string;
}) {
  return {
    mode: "seller_cover",
    size: "1024x1024",
    prompt: buildSellerCoverPrompt(pack),
    productImageUrl: findPrimaryProductUrl(uploads),
    ownerId
  };
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

function createGeneratedCoverAsset(pack: PublishPack, imageUrl: string): UploadedAsset {
  return {
    id: `generated_cover_${pack.id}`,
    uri: imageUrl,
    remoteUrl: imageUrl,
    mimeType: "image/png",
    label: "AI 生成封面",
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
