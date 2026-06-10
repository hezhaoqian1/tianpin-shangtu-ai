import { describe, expect, it } from "vitest";

import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "../shared/productPipeline";
import { createDemoUserSession } from "../shared/session";
import { handlePrepareExportRequest } from "./exportRoute";

describe("export route adapter", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);

  it("prepares a platform-ready export manifest from a publish pack", async () => {
    const response = await handlePrepareExportRequest({
      pack,
      session: createDemoUserSession()
    });

    expect(response.status).toBe(200);
    if (response.status !== 200) {
      throw new Error("expected export manifest");
    }
    expect(response.body.manifest.exportId).toMatch(/^export_/);
    expect(response.body.manifest.platformLabel).toBe("闲鱼卖货");
    expect(response.body.manifest.files.map((file) => file.kind)).toEqual(["image", "image", "copy", "tags"]);
    expect(response.body.manifest.checklist).toContain("上传封面图并确认第一屏主体清晰");
    expect(response.body.manifest.publishCopy).toContain(pack.copy.titles[0]);
  });

  it("rejects malformed export requests before preparing a manifest", async () => {
    const response = await handlePrepareExportRequest({
      pack: null,
      session: createDemoUserSession()
    });

    expect(response.status).toBe(400);
    if (response.status !== 400) {
      throw new Error("expected validation error");
    }
    expect(response.body.error).toBe("invalid_pack");
  });
});
