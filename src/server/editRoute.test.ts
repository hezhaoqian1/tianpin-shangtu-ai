import { describe, expect, it, vi } from "vitest";

import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "../shared/productPipeline";
import { handleEditRequest } from "./editRoute";

describe("edit route adapter", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);

  it("turns a request body into an edit command response", async () => {
    const response = await handleEditRequest(
      {
        userMessage: "标题短一点",
        pack
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
    expect(response.body.command.operations.length).toBeGreaterThan(0);
  });

  it("rejects invalid edit bodies before provider routing", async () => {
    const fetcher = vi.fn();

    const response = await handleEditRequest(
      {
        userMessage: "",
        pack
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

