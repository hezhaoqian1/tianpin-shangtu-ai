import { describe, expect, it, vi } from "vitest";

import { createSampleUploads } from "../shared/productPipeline";
import { handleAnalyzeRequest } from "./analyzeRoute";

describe("analyze route adapter", () => {
  it("turns a request body into a model router response", async () => {
    const response = await handleAnalyzeRequest(
      {
        platform: "xianyu",
        uploads: createSampleUploads("headphones")
      },
      {
        provider: "mock"
      }
    );

    expect(response.status).toBe(200);
    if (response.status !== 200) {
      throw new Error("expected success response");
    }
    expect(response.body.provider).toBe("mock");
    expect(response.body.analysis.productName).toContain("Sony");
  });

  it("rejects invalid request bodies before provider routing", async () => {
    const fetcher = vi.fn();

    const response = await handleAnalyzeRequest(
      {
        platform: "xianyu",
        uploads: []
      },
      {
        provider: "openai",
        openaiApiKey: "sk-test"
      },
      fetcher
    );

    expect(response.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
