import { describe, expect, it } from "vitest";

import { resetImageGenerationJobsForTests } from "./imageJobQueue";
import { handleCreateImageJobRequest, handleGenerateImageRequest, handleGetImageJobRequest, handleRemoveBackgroundRequest } from "./imageRoute";

describe("image routes", () => {
  it("creates and reads asynchronous image generation jobs", async () => {
    resetImageGenerationJobsForTests();

    const response = await handleCreateImageJobRequest(
      {
        mode: "seller_cover",
        prompt: "干净真实的闲鱼耳机封面",
        ownerId: "seller-1"
      },
      {
        provider: "openai",
        openaiApiKey: "",
        openaiModel: "gpt-5-mini"
      },
      {
        imageGeneration: {
          model: "gpt-image-2"
        }
      }
    );

    expect(response.status).toBe(200);
    if (response.status !== 200) {
      throw new Error("expected image job");
    }
    const body = response.body as { jobId: string; status: string };
    expect(body.status).toBe("queued");
    expect(body.jobId).toMatch(/^img_job_/);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const snapshot = handleGetImageJobRequest(body.jobId);

    expect(snapshot.status).toBe(200);
    if (snapshot.status !== 200) {
      throw new Error("expected image job snapshot");
    }
    const snapshotBody = snapshot.body as { status: string };
    expect(["running", "succeeded"]).toContain(snapshotBody.status);
  });

  it("returns a mock image generation result until OpenAI image credentials are configured", async () => {
    const response = await handleGenerateImageRequest(
      {
        mode: "seller_cover",
        prompt: "干净真实的闲鱼耳机封面",
        productImageUrl: "https://cdn.example.com/headphones.jpg"
      },
      {
        provider: "openai",
        openaiApiKey: "",
        openaiModel: "gpt-5-mini"
      },
      {
        imageGeneration: {
          model: "gpt-image-2"
        }
      }
    );

    expect(response.status).toBe(200);
    if (response.status !== 200) {
      throw new Error("expected image result");
    }
    expect(response.body).toMatchObject({
      provider: "mock",
      model: "gpt-image-2",
      fallbackReason: "missing_openai_key"
    });
  });

  it("returns a mock background removal result until a provider is configured", async () => {
    const response = await handleRemoveBackgroundRequest(
      {
        imageUrl: "https://cdn.example.com/headphones.jpg"
      },
      {
        backgroundRemoval: {
          provider: "mock"
        }
      }
    );

    expect(response.status).toBe(200);
    if (response.status !== 200) {
      throw new Error("expected background removal result");
    }
    expect(response.body).toMatchObject({
      provider: "mock",
      fallbackReason: "mock_configured"
    });
  });
});
