import { describe, expect, it } from "vitest";

import {
  createImageGenerationJob,
  getImageGenerationJobSnapshot,
  resetImageGenerationJobsForTests,
  type ImageGenerationJobExecutor
} from "./imageJobQueue";

describe("image generation job queue", () => {
  it("creates an async image generation job and stores the final result", async () => {
    resetImageGenerationJobsForTests();
    let resolveJob!: () => void;
    const unblock = new Promise<void>((resolve) => {
      resolveJob = resolve;
    });
    const executor: ImageGenerationJobExecutor = async () => {
      await unblock;
      return {
        provider: "openai",
        model: "gpt-image-2",
        imageUrl: "https://cdn.example.com/generated/cover.png",
        storageProvider: "s3",
        storageKey: "generated/seller-1/cover.png"
      };
    };

    const job = createImageGenerationJob({
      request: {
        mode: "seller_cover",
        prompt: "真实闲鱼封面",
        ownerId: "seller-1"
      },
      config: {
        provider: "openai",
        openaiBaseUrl: "https://api.openai.com/v1",
        openaiApiKey: "sk-test",
        openaiModel: "gpt-5-mini",
        xaiModel: "grok-4.1-fast"
      },
      imageModel: "gpt-image-2",
      executor
    });

    expect(job.status).toBe("queued");
    expect(job.result).toBeUndefined();

    await Promise.resolve();
    expect(getImageGenerationJobSnapshot(job.id)?.status).toBe("running");

    resolveJob();
    await job.completion;

    expect(getImageGenerationJobSnapshot(job.id)).toMatchObject({
      id: job.id,
      status: "succeeded",
      result: {
        provider: "openai",
        model: "gpt-image-2",
        imageUrl: "https://cdn.example.com/generated/cover.png",
        storageProvider: "s3"
      }
    });
  });

  it("records a failed job without throwing from the creator", async () => {
    resetImageGenerationJobsForTests();
    const job = createImageGenerationJob({
      request: {
        mode: "seller_cover",
        prompt: "真实闲鱼封面"
      },
      config: {
        provider: "openai",
        openaiBaseUrl: "https://api.openai.com/v1",
        openaiApiKey: "sk-test",
        openaiModel: "gpt-5-mini",
        xaiModel: "grok-4.1-fast"
      },
      imageModel: "gpt-image-2",
      executor: async () => {
        throw new Error("model timeout");
      }
    });

    await job.completion;

    expect(getImageGenerationJobSnapshot(job.id)).toMatchObject({
      status: "failed",
      error: "model timeout"
    });
  });
});
