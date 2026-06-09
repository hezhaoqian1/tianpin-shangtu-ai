import { describe, expect, it, vi } from "vitest";

import { createSampleUploads } from "../shared/productPipeline";
import { analyzeProductWithModel, createModelRouterConfig, type Fetcher } from "./modelRouter";

describe("model router", () => {
  it("uses mock provider without network calls", async () => {
    const fetcher = vi.fn<Fetcher>();
    const uploads = createSampleUploads("headphones");

    const result = await analyzeProductWithModel({
      uploads,
      platform: "xianyu",
      config: createModelRouterConfig({ provider: "mock" }),
      fetcher
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.provider).toBe("mock");
    expect(result.analysis.productName).toContain("Sony");
  });

  it("falls back to mock when an API key is missing", async () => {
    const fetcher = vi.fn<Fetcher>();
    const uploads = createSampleUploads("headphones");

    const result = await analyzeProductWithModel({
      uploads,
      platform: "xianyu",
      config: createModelRouterConfig({ provider: "openai", openaiApiKey: "" }),
      fetcher
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.provider).toBe("mock");
    expect(result.fallbackReason).toBe("missing_openai_key");
  });

  it("sends OpenAI Responses requests with server-side bearer auth", async () => {
    const uploads = createSampleUploads("headphones");
    const fetcher = vi.fn<Fetcher>(async () => jsonResponse(openAiPayload()));

    const result = await analyzeProductWithModel({
      uploads,
      platform: "xianyu",
      config: createModelRouterConfig({ provider: "openai", openaiApiKey: "sk-test", openaiModel: "gpt-5-mini" }),
      fetcher
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, request] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(request.headers.Authorization).toBe("Bearer sk-test");
    expect(JSON.parse(request.body).model).toBe("gpt-5-mini");
    expect(result.provider).toBe("openai");
    expect(result.analysis.productName).toBe("AI 识别耳机");
  });

  it("supports an OpenAI-compatible base URL", async () => {
    const uploads = createSampleUploads("headphones");
    const fetcher = vi.fn<Fetcher>(async () => jsonResponse(openAiPayload()));

    await analyzeProductWithModel({
      uploads,
      platform: "xianyu",
      config: createModelRouterConfig({
        provider: "openai",
        openaiBaseUrl: "https://api.apexpoc.com/v1/",
        openaiApiKey: "sk-test",
        openaiModel: "gpt-5-mini"
      }),
      fetcher
    });

    const [url] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://api.apexpoc.com/v1/responses");
  });

  it("adds remote product images to OpenAI vision content", async () => {
    const uploads = createSampleUploads("headphones").map((upload, index) => ({
      ...upload,
      remoteUrl: `https://cdn.example.com/product-${index + 1}.jpg`
    }));
    const fetcher = vi.fn<Fetcher>(async () => jsonResponse(openAiPayload()));

    await analyzeProductWithModel({
      uploads,
      platform: "xianyu",
      config: createModelRouterConfig({ provider: "openai", openaiApiKey: "sk-test" }),
      fetcher
    });

    const [, request] = fetcher.mock.calls[0]!;
    const body = JSON.parse(request.body);
    const userContent = body.input[1].content;
    expect(userContent.filter((part: { type: string }) => part.type === "input_image")).toHaveLength(4);
    expect(userContent[1].image_url).toBe("https://cdn.example.com/product-1.jpg");
  });

  it("sends Grok chat completion requests with xAI bearer auth", async () => {
    const uploads = createSampleUploads("headphones");
    const fetcher = vi.fn<Fetcher>(async () => jsonResponse(xaiPayload()));

    const result = await analyzeProductWithModel({
      uploads,
      platform: "xianyu",
      config: createModelRouterConfig({ provider: "grok", xaiApiKey: "xai-test", xaiModel: "grok-4.1" }),
      fetcher
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, request] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://api.x.ai/v1/chat/completions");
    expect(request.headers.Authorization).toBe("Bearer xai-test");
    expect(JSON.parse(request.body).model).toBe("grok-4.1");
    expect(result.provider).toBe("grok");
    expect(result.analysis.productName).toBe("Grok 识别耳机");
  });
});

function jsonResponse(payload: unknown): Response {
  return {
    ok: true,
    json: async () => payload
  } as Response;
}

function openAiPayload() {
  return {
    output: [
      {
        content: [
          {
            text: JSON.stringify({
              productType: "headphones",
              productName: "AI 识别耳机",
              category: "闲置数码",
              condition: {
                label: "95 新",
                confidence: 0.81,
                visibleIssues: []
              },
              sellingPoints: ["AI 识别卖点"],
              missingShots: [],
              truthfulnessWarnings: ["保持真实"]
            })
          }
        ]
      }
    ]
  };
}

function xaiPayload() {
  return {
    choices: [
      {
        message: {
          content: JSON.stringify({
            productType: "headphones",
            productName: "Grok 识别耳机",
            category: "闲置数码",
            condition: {
              label: "95 新",
              confidence: 0.8,
              visibleIssues: []
            },
            sellingPoints: ["Grok 卖点"],
            missingShots: [],
            truthfulnessWarnings: ["保持真实"]
          })
        }
      }
    ]
  };
}
