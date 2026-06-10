import { describe, expect, it, vi } from "vitest";

import { uploadAssetsForAnalysis, type BinaryUploadFetcher } from "./remoteUploadClient";
import { type UploadIntentFetcher } from "./uploadClient";

describe("remote upload client", () => {
  it("uploads picked assets and returns remote URLs for analysis", async () => {
    const intentFetcher = vi.fn<UploadIntentFetcher>(async () => ({
      ok: true,
      json: async () => ({
        provider: "s3",
        key: "uploads/seller/front.jpg",
        uploadUrl: "https://storage.example.com/upload",
        publicUrl: "https://cdn.example.com/uploads/seller/front.jpg",
        method: "PUT",
        headers: {
          "Content-Type": "image/jpeg"
        },
        expiresInSeconds: 900
      })
    }));
    const binaryFetcher = vi.fn<BinaryUploadFetcher>(async (url) => {
      if (url === "file:///front.jpg") {
        return {
          ok: true,
          blob: async () => new Blob(["image-bytes"], { type: "image/jpeg" })
        };
      }

      return {
        ok: true
      };
    });

    const [result] = await uploadAssetsForAnalysis({
      endpoint: "https://api.example.com/api/uploads/presign",
      ownerId: "seller",
      intentFetcher,
      binaryFetcher,
      assets: [
        {
          id: "picked_01",
          uri: "file:///front.jpg",
          mimeType: "image/jpeg",
          label: "front.jpg",
          width: 1200,
          height: 900
        }
      ]
    });

    expect(result.uploaded).toBe(true);
    expect(result.asset.remoteUrl).toBe("https://cdn.example.com/uploads/seller/front.jpg");
    expect(result.asset.uri).toBe("https://cdn.example.com/uploads/seller/front.jpg");
    expect(intentFetcher).toHaveBeenCalledTimes(1);
    expect(binaryFetcher).toHaveBeenCalledTimes(2);
  });

  it("keeps local assets when upload endpoint is missing", async () => {
    const [result] = await uploadAssetsForAnalysis({
      assets: [
        {
          id: "picked_01",
          uri: "file:///front.jpg",
          label: "front.jpg",
          width: 1200,
          height: 900
        }
      ]
    });

    expect(result.uploaded).toBe(false);
    expect(result.fallbackReason).toBe("missing_endpoint");
    expect(result.asset.remoteUrl).toBeUndefined();
  });
});
