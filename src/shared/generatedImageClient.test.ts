import { describe, expect, it, vi } from "vitest";

import { generateCoverImageForApp, type AppGeneratedImageFetcher } from "./generatedImageClient";
import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "./productPipeline";

describe("mobile generated image client", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);

  it("posts the selected pack context and returns a persisted generated cover asset", async () => {
    const remoteUploads = [
      {
        ...uploads[0],
        uri: "https://cdn.example.com/uploads/product.jpg",
        remoteUrl: "https://cdn.example.com/uploads/product.jpg",
        mimeType: "image/jpeg"
      },
      ...uploads.slice(1)
    ];
    const fetcher = vi.fn<AppGeneratedImageFetcher>(async () => ({
      ok: true,
      json: async () => ({
        provider: "openai",
        model: "gpt-image-2",
        imageUrl: "https://cdn.example.com/generated/seller-1/cover.png",
        storageProvider: "s3"
      })
    }));

    const result = await generateCoverImageForApp({
      pack,
      uploads: remoteUploads,
      endpoint: "http://localhost:3001/api/images/generate",
      ownerId: "seller-1",
      fetcher
    });

    const [url, request] = fetcher.mock.calls[0]!;
    const body = JSON.parse(request.body);
    expect(url).toBe("http://localhost:3001/api/images/generate");
    expect(body.mode).toBe("seller_cover");
    expect(body.ownerId).toBe("seller-1");
    expect(body.productImageUrl).toBe("https://cdn.example.com/uploads/product.jpg");
    expect(body.prompt).toContain(pack.platform);
    expect(body.prompt).toContain(pack.copy.titles[0]);
    expect(result.source).toBe("remote");
    if (result.source !== "remote") {
      throw new Error("expected generated cover asset");
    }
    expect(result.asset).toMatchObject({
      uri: "https://cdn.example.com/generated/seller-1/cover.png",
      remoteUrl: "https://cdn.example.com/generated/seller-1/cover.png",
      mimeType: "image/png",
      label: "AI 生成封面"
    });
  });

  it("falls back with a clear reason when the image endpoint is not configured", async () => {
    const fetcher = vi.fn<AppGeneratedImageFetcher>();

    const result = await generateCoverImageForApp({
      pack,
      uploads,
      endpoint: "",
      ownerId: "seller-1",
      fetcher
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.source).toBe("mock");
    if (result.source !== "mock") {
      throw new Error("expected mock fallback");
    }
    expect(result.fallbackReason).toBe("missing_endpoint");
  });
});
