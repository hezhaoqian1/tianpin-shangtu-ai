import { describe, expect, it, vi } from "vitest";

import { createEditCommandForApp, type AppEditFetcher } from "./editClient";
import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "./productPipeline";

describe("mobile edit client", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);

  it("uses local mock command when no endpoint is configured", async () => {
    const fetcher = vi.fn<AppEditFetcher>();

    const result = await createEditCommandForApp({
      pack,
      userMessage: "标题短一点",
      apiEndpoint: "",
      fetcher
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.source).toBe("mock");
    expect(result.command.copy?.primaryTitle).toContain("Sony");
  });

  it("posts current pack and user message without model keys", async () => {
    const fetcher = vi.fn<AppEditFetcher>(async () => ({
      ok: true,
      json: async () => ({
        command: {
          intent: "shorten_title",
          operations: [{ type: "updateText", layerId: "title", text: "远端改短标题" }],
          copy: { primaryTitle: "远端改短标题" },
          explanation: "已改短"
        }
      })
    }));

    const result = await createEditCommandForApp({
      pack,
      userMessage: "标题短一点",
      apiEndpoint: "http://localhost:3001/api/edit",
      fetcher
    });

    const [url, request] = fetcher.mock.calls[0]!;
    const body = JSON.parse(request.body);
    expect(url).toBe("http://localhost:3001/api/edit");
    expect(body.openaiApiKey).toBeUndefined();
    expect(body.userMessage).toBe("标题短一点");
    expect(body.pack.id).toBe(pack.id);
    expect(result.source).toBe("remote");
    expect(result.command.copy?.primaryTitle).toBe("远端改短标题");
  });

  it("falls back to mock command when the remote endpoint fails", async () => {
    const fetcher = vi.fn<AppEditFetcher>(async () => ({
      ok: false,
      json: async () => ({})
    }));

    const result = await createEditCommandForApp({
      pack,
      userMessage: "标题短一点",
      apiEndpoint: "http://localhost:3001/api/edit",
      fetcher
    });

    expect(result.source).toBe("mock");
    expect(result.fallbackReason).toBe("remote_failed");
  });
});

