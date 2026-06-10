import { describe, expect, it } from "vitest";

import { handleGetCapabilitiesRequest } from "./capabilityRoute";

describe("capability route adapter", () => {
  it("summarizes configured services without leaking secrets", () => {
    const response = handleGetCapabilitiesRequest(
      {
        provider: "openai",
        openaiApiKey: "sk-secret-value",
        openaiBaseUrl: "https://api.example.test/v1",
        openaiModel: "gpt-5-mini"
      },
      {
        storage: {
          provider: "s3",
          bucket: "product-images",
          region: "auto",
          endpoint: "https://account.r2.cloudflarestorage.com",
          accessKeyId: "secret-access-key",
          secretAccessKey: "secret",
          publicBaseUrl: "https://pub.example.test"
        },
        imageGeneration: {
          model: "gpt-image-2"
        },
        backgroundRemoval: {
          provider: "mock"
        }
      }
    );

    expect(response.status).toBe(200);
    const serialized = JSON.stringify(response.body);
    expect(serialized).not.toContain("sk-secret-value");
    expect(serialized).not.toContain("secret-access-key");
    expect(response.body.items.find((item) => item.id === "text_edit")?.status).toBe("configured");
    expect(response.body.items.find((item) => item.id === "storage")?.status).toBe("ready");
    expect(response.body.items.find((item) => item.id === "background_removal")?.status).toBe("mock");
  });
});
