import { describe, expect, it, vi } from "vitest";

import { createUploadIntentForApp, type UploadIntentFetcher } from "./uploadClient";

describe("upload client", () => {
  it("requests an upload intent from the configured endpoint", async () => {
    const fetcher = vi.fn<UploadIntentFetcher>(async () => ({
      ok: true,
      json: async () => ({
        provider: "s3",
        key: "uploads/seller/headphones.jpg",
        uploadUrl: "https://storage.example.com/upload",
        publicUrl: "https://cdn.example.com/uploads/seller/headphones.jpg",
        method: "PUT",
        headers: {
          "Content-Type": "image/jpeg"
        },
        expiresInSeconds: 900
      })
    }));

    const intent = await createUploadIntentForApp({
      endpoint: "https://api.example.com/api/uploads/presign",
      fileName: "headphones.jpg",
      contentType: "image/jpeg",
      ownerId: "seller",
      fetcher
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(intent?.provider).toBe("s3");
    expect(intent?.publicUrl).toContain("cdn.example.com");
  });

  it("skips remote upload setup when no endpoint is configured", async () => {
    const fetcher = vi.fn<UploadIntentFetcher>();

    const intent = await createUploadIntentForApp({
      fileName: "headphones.jpg",
      contentType: "image/jpeg",
      fetcher
    });

    expect(intent).toBeUndefined();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
