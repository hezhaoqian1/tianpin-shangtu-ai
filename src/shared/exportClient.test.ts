import { describe, expect, it, vi } from "vitest";

import { prepareExportForApp } from "./exportClient";
import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "./productPipeline";
import { createDemoUserSession } from "./session";

describe("export client", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);
  const session = createDemoUserSession();

  it("posts a publish pack to the export endpoint and returns the manifest", async () => {
    const fetcher = vi.fn(async (_url: string, init: { body?: string }) => ({
      ok: true,
      json: async () => ({
        manifest: {
          exportId: "export_test",
          platformLabel: "闲鱼卖货",
          summary: "2 张图片 / 3 个标题 / 4 个标签",
          files: [],
          publishCopy: "copy",
          checklist: ["上传封面图并确认第一屏主体清晰"]
        },
        requestBody: JSON.parse(init.body ?? "{}")
      })
    }));

    const result = await prepareExportForApp({
      endpoint: "https://api.example.test/api/exports/prepare",
      pack,
      session,
      fetcher
    });

    expect(result.status).toBe("ready");
    if (result.status !== "ready") {
      throw new Error("expected ready export");
    }
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.test/api/exports/prepare",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
    );
    expect(result.manifest.exportId).toBe("export_test");
  });

  it("keeps export local when no endpoint is configured", async () => {
    const result = await prepareExportForApp({
      endpoint: "",
      pack,
      session
    });

    expect(result.status).toBe("local_only");
    expect(result.manifest.platformLabel).toBe("闲鱼卖货");
  });
});
