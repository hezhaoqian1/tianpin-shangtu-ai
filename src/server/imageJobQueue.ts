import { randomUUID } from "node:crypto";

import { type ServerIntegrationConfig } from "./env";
import { generateSellerImage, type ImageGenerationRequest, type ImageGenerationResult } from "./imageGeneration";
import { type ModelRouterConfig } from "./modelRouter";

export type ImageGenerationJobStatus = "queued" | "running" | "succeeded" | "failed";

export type ImageGenerationJobSnapshot = {
  id: string;
  status: ImageGenerationJobStatus;
  createdAt: string;
  updatedAt: string;
  result?: ImageGenerationResult;
  error?: string;
};

export type ImageGenerationJob = ImageGenerationJobSnapshot & {
  completion: Promise<void>;
};

export type ImageGenerationJobExecutor = (params: {
  request: ImageGenerationRequest;
  config: ModelRouterConfig;
  imageModel: string;
  storageConfig?: ServerIntegrationConfig["storage"];
}) => Promise<ImageGenerationResult>;

const jobs = new Map<string, ImageGenerationJob>();

export function createImageGenerationJob({
  request,
  config,
  imageModel,
  storageConfig,
  executor = generateSellerImage
}: {
  request: ImageGenerationRequest;
  config: ModelRouterConfig;
  imageModel: string;
  storageConfig?: ServerIntegrationConfig["storage"];
  executor?: ImageGenerationJobExecutor;
}): ImageGenerationJob {
  const now = new Date().toISOString();
  const id = `img_job_${randomUUID()}`;
  const job = {
    id,
    status: "queued" as const,
    createdAt: now,
    updatedAt: now,
    completion: Promise.resolve()
  };

  jobs.set(id, job);

  job.completion = runJob({
    id,
    request,
    config,
    imageModel,
    storageConfig,
    executor
  });

  return job;
}

export function getImageGenerationJobSnapshot(id: string): ImageGenerationJobSnapshot | undefined {
  const job = jobs.get(id);
  if (!job) {
    return undefined;
  }

  return {
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    result: job.result,
    error: job.error
  };
}

export function resetImageGenerationJobsForTests() {
  jobs.clear();
}

async function runJob({
  id,
  request,
  config,
  imageModel,
  storageConfig,
  executor
}: {
  id: string;
  request: ImageGenerationRequest;
  config: ModelRouterConfig;
  imageModel: string;
  storageConfig?: ServerIntegrationConfig["storage"];
  executor: ImageGenerationJobExecutor;
}) {
  updateJob(id, {
    status: "running"
  });

  try {
    const result = await executor({
      request,
      config,
      imageModel,
      storageConfig
    });

    updateJob(id, {
      status: "succeeded",
      result
    });
  } catch (error) {
    updateJob(id, {
      status: "failed",
      error: error instanceof Error ? error.message : "image_generation_failed"
    });
  }
}

function updateJob(id: string, patch: Partial<Omit<ImageGenerationJob, "id" | "completion" | "createdAt">>) {
  const current = jobs.get(id);
  if (!current) {
    return;
  }

  jobs.set(id, {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  });
}
