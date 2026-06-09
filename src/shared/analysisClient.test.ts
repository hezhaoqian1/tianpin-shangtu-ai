import { describe, expect, it, vi } from "vitest";

import { analyzeUploadsForApp, type AppAnalysisFetcher } from "./analysisClient";
import { createSampleUploads } from "./productPipeline";

describe("mobile analysis client", () => {
  it("uses local mock analysis when no endpoint is configured", async () => {
    const fetcher = vi.fn<AppAnalysisFetcher>();
    const uploads = createSampleUploads("headphones");

    const result = await analyzeUploadsForApp({
      uploads,
      platform: "xianyu",
      apiEndpoint: "",
      fetcher
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.source).toBe("mock");
    expect(result.analysis.productName).toContain("Sony");
  });

  it("posts upload metadata to a server endpoint without any provider key", async () => {
    const fetcher = vi.fn<AppAnalysisFetcher>(async () => ({
      ok: true,
      json: async () => ({
        analysis: {
          productType: "headphones",
          productName: "Server 识别耳机",
          category: "闲置数码",
          condition: {
            label: "95 新",
            confidence: 0.82,
            visibleIssues: []
          },
          sellingPoints: ["服务端识别卖点"],
          missingShots: [],
          truthfulnessWarnings: ["保持真实"]
        }
      })
    }));

    const result = await analyzeUploadsForApp({
      uploads: createSampleUploads("headphones"),
      platform: "xianyu",
      apiEndpoint: "http://localhost:3001/api/analyze",
      fetcher
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, request] = fetcher.mock.calls[0]!;
    expect(url).toBe("http://localhost:3001/api/analyze");
    expect(request.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(request.body).openaiApiKey).toBeUndefined();
    expect(result.source).toBe("remote");
    expect(result.analysis.productName).toBe("Server 识别耳机");
  });

  it("falls back to mock analysis when the server endpoint fails", async () => {
    const fetcher = vi.fn<AppAnalysisFetcher>(async () => ({
      ok: false,
      json: async () => ({})
    }));

    const result = await analyzeUploadsForApp({
      uploads: createSampleUploads("headphones"),
      platform: "xianyu",
      apiEndpoint: "http://localhost:3001/api/analyze",
      fetcher
    });

    expect(result.source).toBe("mock");
    expect(result.fallbackReason).toBe("remote_failed");
  });
});
