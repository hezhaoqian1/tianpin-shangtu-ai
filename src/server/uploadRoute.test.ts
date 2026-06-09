import { describe, expect, it } from "vitest";

import { handleCreateUploadIntentRequest } from "./uploadRoute";

describe("upload route", () => {
  it("creates a mock upload intent before storage credentials are configured", async () => {
    const response = await handleCreateUploadIntentRequest(
      {
        fileName: "headphones.png",
        contentType: "image/png",
        ownerId: "seller-1"
      },
      {
        storage: {
          provider: "mock",
          region: "auto",
          publicBaseUrl: "https://cdn.example.com"
        }
      }
    );

    expect(response.status).toBe(200);
    if (response.status !== 200) {
      throw new Error("expected upload intent");
    }
    expect(response.body.provider).toBe("mock");
    expect(response.body.method).toBe("PUT");
    expect(response.body.headers["Content-Type"]).toBe("image/png");
    expect(response.body.publicUrl).toContain("https://cdn.example.com/uploads/seller-1/");
  });

  it("rejects unsupported upload content types", async () => {
    const response = await handleCreateUploadIntentRequest({
      fileName: "notes.txt",
      contentType: "text/plain"
    });

    expect(response.status).toBe(500);
    if (response.status !== 500) {
      throw new Error("expected error response");
    }
    expect(response.body.error).toContain("Unsupported image content type");
  });
});
