import { describe, expect, it, vi } from "vitest";

import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "../shared/productPipeline";
import { createModelRouterConfig, type Fetcher } from "./modelRouter";
import { createEditCommandWithModel } from "./editRouter";

describe("edit command router", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);

  it("uses mock provider without network calls", async () => {
    const fetcher = vi.fn<Fetcher>();

    const result = await createEditCommandWithModel({
      pack,
      userMessage: "标题短一点，背景别太商业",
      config: createModelRouterConfig({ provider: "mock" }),
      fetcher
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.provider).toBe("mock");
    expect(result.command.operations.some((operation) => operation.type === "updateText")).toBe(true);
  });

  it("falls back to mock when OpenAI key is missing", async () => {
    const fetcher = vi.fn<Fetcher>();

    const result = await createEditCommandWithModel({
      pack,
      userMessage: "标题短一点",
      config: createModelRouterConfig({ provider: "openai", openaiApiKey: "" }),
      fetcher
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.provider).toBe("mock");
    expect(result.fallbackReason).toBe("missing_openai_key");
  });

  it("sends OpenAI Responses requests for edit commands", async () => {
    const fetcher = vi.fn<Fetcher>(async () => jsonResponse(openAiEditPayload()));

    const result = await createEditCommandWithModel({
      pack,
      userMessage: "标题短一点",
      config: createModelRouterConfig({ provider: "openai", openaiApiKey: "sk-test", openaiModel: "gpt-5-mini" }),
      fetcher
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, request] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(request.headers.Authorization).toBe("Bearer sk-test");
    const body = JSON.parse(request.body);
    expect(body.model).toBe("gpt-5-mini");
    expect(body.text.format.schema.required).toEqual(["intent", "operations", "copy", "explanation"]);
    expect(body.text.format.schema.properties.operations.items.required).toEqual([
      "type",
      "layerId",
      "text",
      "assetId",
      "background",
      "imageId",
      "label",
      "bbox"
    ]);
    expect(result.provider).toBe("openai");
    expect(result.command.copy?.primaryTitle).toBe("AI 改短标题");
  });

  it("parses strict OpenAI edit commands with nullable unused fields", async () => {
    const fetcher = vi.fn<Fetcher>(async () => jsonResponse(openAiNullableEditPayload()));

    const result = await createEditCommandWithModel({
      pack,
      userMessage: "只改画布背景",
      config: createModelRouterConfig({ provider: "openai", openaiApiKey: "sk-test", openaiModel: "gpt-5-mini" }),
      fetcher
    });

    expect(result.provider).toBe("openai");
    expect(result.command.copy).toBeUndefined();
    expect(result.command.operations[0]).toEqual({
      type: "updateBackground",
      assetId: "cover_01",
      background: { type: "color", value: "#F4F1EA" }
    });
  });

  it("supports an OpenAI-compatible base URL for edit commands", async () => {
    const fetcher = vi.fn<Fetcher>(async () => jsonResponse(openAiEditPayload()));

    await createEditCommandWithModel({
      pack,
      userMessage: "标题短一点",
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

  it("sends Grok chat completion requests for edit commands", async () => {
    const fetcher = vi.fn<Fetcher>(async () => jsonResponse(xaiEditPayload()));

    const result = await createEditCommandWithModel({
      pack,
      userMessage: "标题短一点",
      config: createModelRouterConfig({ provider: "grok", xaiApiKey: "xai-test", xaiModel: "grok-4.1" }),
      fetcher
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, request] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://api.x.ai/v1/chat/completions");
    expect(request.headers.Authorization).toBe("Bearer xai-test");
    expect(JSON.parse(request.body).model).toBe("grok-4.1");
    expect(result.provider).toBe("grok");
    expect(result.command.copy?.primaryTitle).toBe("Grok 改短标题");
  });
});

function jsonResponse(payload: unknown): Response {
  return {
    ok: true,
    json: async () => payload
  } as Response;
}

function openAiEditPayload() {
  return {
    output: [
      {
        content: [
          {
            text: JSON.stringify({
              intent: "shorten_title",
              operations: [
                {
                  type: "updateText",
                  layerId: "title",
                  text: "AI 改短标题",
                  assetId: null,
                  background: null,
                  imageId: null,
                  label: null,
                  bbox: null
                }
              ],
              copy: { primaryTitle: "AI 改短标题" },
              explanation: "已改短标题"
            })
          }
        ]
      }
    ]
  };
}

function openAiNullableEditPayload() {
  return {
    output: [
      {
        content: [
          {
            text: JSON.stringify({
              intent: "soften_background",
              operations: [
                {
                  type: "updateBackground",
                  layerId: null,
                  text: null,
                  assetId: "cover_01",
                  background: { type: "color", value: "#F4F1EA" },
                  imageId: null,
                  label: null,
                  bbox: null
                }
              ],
              copy: { primaryTitle: null },
              explanation: "已改成更适合闲鱼的浅暖背景"
            })
          }
        ]
      }
    ]
  };
}

function xaiEditPayload() {
  return {
    choices: [
      {
        message: {
          content: JSON.stringify({
            intent: "shorten_title",
            operations: [
              {
                type: "updateText",
                layerId: "title",
                text: "Grok 改短标题",
                assetId: null,
                background: null,
                imageId: null,
                label: null,
                bbox: null
              }
            ],
            copy: { primaryTitle: "Grok 改短标题" },
            explanation: "已改短标题"
          })
        }
      }
    ]
  };
}
