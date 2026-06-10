import { describe, expect, it, vi } from "vitest";

import { generateSellerImage, type ImageGenerationFetcher } from "./imageGeneration";
import { type StoredObjectUploader } from "./storage";

describe("seller image generation", () => {
  it("stores generated GPT image output in configured S3-compatible storage", async () => {
    const fetcher = vi.fn<ImageGenerationFetcher>(async () => ({
      ok: true,
      json: async () => ({
        data: [
          {
            b64_json: Buffer.from("png-bytes").toString("base64")
          }
        ]
      })
    }));
    const uploader = vi.fn<StoredObjectUploader>(async () => undefined);

    const result = await generateSellerImage({
      request: {
        mode: "seller_cover",
        prompt: "真实闲鱼封面",
        productImageUrl: "https://cdn.example.com/product.jpg",
        ownerId: "seller 1"
      },
      config: {
        provider: "openai",
        openaiBaseUrl: "https://api.openai.com/v1",
        openaiApiKey: "sk-test",
        openaiModel: "gpt-5-mini",
        xaiModel: "grok-4.1-fast"
      },
      imageModel: "gpt-image-2",
      storageConfig: {
        provider: "s3",
        bucket: "product-images",
        region: "auto",
        endpoint: "https://r2.example.com",
        accessKeyId: "access-key",
        secretAccessKey: "secret-key",
        publicBaseUrl: "https://cdn.example.com"
      },
      fetcher,
      generatedImageUploader: uploader
    });

    expect(result).toMatchObject({
      provider: "openai",
      model: "gpt-image-2",
      imageUrl: expect.stringContaining("https://cdn.example.com/generated/seller_1/"),
      storageProvider: "s3"
    });
    expect(result.base64).toBe(Buffer.from("png-bytes").toString("base64"));
    expect(uploader).toHaveBeenCalledTimes(1);
    const commandInput = uploader.mock.calls[0]?.[1].input;
    expect(commandInput).toMatchObject({
      Bucket: "product-images",
      ContentType: "image/png"
    });
    expect(commandInput?.Key).toContain("generated/seller_1/");
    expect(commandInput?.Key).toMatch(/\.png$/);
    expect(Buffer.from(commandInput?.Body as Uint8Array).toString()).toBe("png-bytes");
  });
});
