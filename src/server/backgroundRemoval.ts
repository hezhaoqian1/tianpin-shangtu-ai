import { type ServerIntegrationConfig } from "./env";

export type BackgroundRemovalRequest = {
  imageUrl: string;
};

export type BackgroundRemovalResult = {
  provider: "mock" | "removebg" | "photoroom";
  imageBase64?: string;
  imageUrl?: string;
  fallbackReason?: string;
};

export type BinaryFetcher = (
  url: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: FormData;
  }
) => Promise<{
  ok: boolean;
  arrayBuffer: () => Promise<ArrayBuffer>;
  json?: () => Promise<unknown>;
}>;

export async function removeProductBackground({
  request,
  config,
  fetcher = fetch as BinaryFetcher
}: {
  request: BackgroundRemovalRequest;
  config: ServerIntegrationConfig;
  fetcher?: BinaryFetcher;
}): Promise<BackgroundRemovalResult> {
  if (config.backgroundRemoval.provider === "removebg") {
    return removeWithRemoveBg(request, config, fetcher);
  }

  if (config.backgroundRemoval.provider === "photoroom") {
    return removeWithPhotoroom(request, config, fetcher);
  }

  return mockResult("mock_configured");
}

async function removeWithRemoveBg(
  request: BackgroundRemovalRequest,
  config: ServerIntegrationConfig,
  fetcher: BinaryFetcher
): Promise<BackgroundRemovalResult> {
  if (!config.backgroundRemoval.removeBgApiKey) {
    return mockResult("missing_removebg_key");
  }

  const body = new FormData();
  body.set("image_url", request.imageUrl);
  body.set("size", "auto");

  try {
    const response = await fetcher("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": config.backgroundRemoval.removeBgApiKey
      },
      body
    });

    if (!response.ok) {
      return mockResult("removebg_request_failed");
    }

    return {
      provider: "removebg",
      imageBase64: Buffer.from(await response.arrayBuffer()).toString("base64")
    };
  } catch {
    return mockResult("removebg_request_failed");
  }
}

async function removeWithPhotoroom(
  request: BackgroundRemovalRequest,
  config: ServerIntegrationConfig,
  fetcher: BinaryFetcher
): Promise<BackgroundRemovalResult> {
  if (!config.backgroundRemoval.photoroomApiKey) {
    return mockResult("missing_photoroom_key");
  }

  const body = new FormData();
  body.set("imageUrl", request.imageUrl);
  body.set("format", "png");

  try {
    const response = await fetcher("https://sdk.photoroom.com/v1/segment", {
      method: "POST",
      headers: {
        "x-api-key": config.backgroundRemoval.photoroomApiKey
      },
      body
    });

    if (!response.ok) {
      return mockResult("photoroom_request_failed");
    }

    return {
      provider: "photoroom",
      imageBase64: Buffer.from(await response.arrayBuffer()).toString("base64")
    };
  } catch {
    return mockResult("photoroom_request_failed");
  }
}

function mockResult(fallbackReason: string): BackgroundRemovalResult {
  return {
    provider: "mock",
    imageUrl: "mock://background-removed/product",
    fallbackReason
  };
}
