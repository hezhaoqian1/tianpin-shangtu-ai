import { type Platform, type UploadedAsset } from "../shared/productPipeline";
import {
  analyzeProductWithModel,
  createModelRouterConfig,
  type Fetcher,
  type ModelRouterConfig
} from "./modelRouter";

export type AnalyzeRouteBody = {
  platform: Platform;
  uploads: UploadedAsset[];
};

export type AnalyzeRouteResponse =
  | {
      status: 200;
      body: {
        provider: string;
        fallbackReason?: string;
        analysis: Awaited<ReturnType<typeof analyzeProductWithModel>>["analysis"];
      };
    }
  | {
      status: 400;
      body: {
        error: string;
      };
    };

export async function handleAnalyzeRequest(
  body: unknown,
  configOverrides: Partial<ModelRouterConfig> = {},
  fetcher?: Fetcher
): Promise<AnalyzeRouteResponse> {
  const parsed = parseAnalyzeBody(body);
  if (!parsed.ok) {
    return {
      status: 400,
      body: { error: parsed.error }
    };
  }

  const result = await analyzeProductWithModel({
    uploads: parsed.body.uploads,
    platform: parsed.body.platform,
    config: createModelRouterConfig(configOverrides),
    fetcher
  });

  return {
    status: 200,
    body: {
      provider: result.provider,
      fallbackReason: result.fallbackReason,
      analysis: result.analysis
    }
  };
}

function parseAnalyzeBody(value: unknown): { ok: true; body: AnalyzeRouteBody } | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "invalid_body" };
  }

  const record = value as Record<string, unknown>;
  if (!isPlatform(record.platform)) {
    return { ok: false, error: "invalid_platform" };
  }

  if (!Array.isArray(record.uploads) || record.uploads.length === 0) {
    return { ok: false, error: "invalid_uploads" };
  }

  const uploads: UploadedAsset[] = [];
  for (const upload of record.uploads) {
    if (!upload || typeof upload !== "object") {
      return { ok: false, error: "invalid_upload" };
    }

    const uploadRecord = upload as Record<string, unknown>;
    if (
      typeof uploadRecord.id !== "string" ||
      typeof uploadRecord.uri !== "string" ||
      typeof uploadRecord.label !== "string" ||
      typeof uploadRecord.width !== "number" ||
      typeof uploadRecord.height !== "number"
    ) {
      return { ok: false, error: "invalid_upload" };
    }

    uploads.push({
      id: uploadRecord.id,
      uri: uploadRecord.uri,
      remoteUrl: optionalString(uploadRecord.remoteUrl),
      mimeType: optionalString(uploadRecord.mimeType),
      label: uploadRecord.label,
      width: uploadRecord.width,
      height: uploadRecord.height
    });
  }

  return {
    ok: true,
    body: {
      platform: record.platform,
      uploads
    }
  };
}

function isPlatform(value: unknown): value is Platform {
  return value === "xianyu" || value === "xiaohongshu" || value === "shop_main" || value === "wechat";
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}
