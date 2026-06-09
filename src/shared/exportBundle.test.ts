import { describe, expect, it } from "vitest";

import { createExportBundle, evaluateExportAction, formatPublishCopy } from "./exportBundle";
import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "./productPipeline";
import { createDemoUserSession, createGuestSession } from "./session";

describe("export bundle", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);

  it("builds a seller-readable export checklist from a publish pack", () => {
    const bundle = createExportBundle(pack, createGuestSession());

    expect(bundle.platformLabel).toBe("闲鱼卖货");
    expect(bundle.summary).toBe("2 张图片 / 3 个标题 / 4 个标签");
    expect(bundle.items.map((item) => item.label)).toEqual(["封面图", "详情拼图", "发布文案", "平台标签"]);
    expect(bundle.items[0]?.sizeLabel).toBe("1080×1080");
    expect(bundle.items[1]?.sizeLabel).toBe("1080×1440");
  });

  it("formats publish copy for one-tap copy and platform paste", () => {
    const copy = formatPublishCopy(pack);

    expect(copy).toContain(pack.copy.titles[0]);
    expect(copy).toContain(pack.copy.description);
    expect(copy).toContain("#索尼耳机 #降噪耳机 #通勤耳机 #闲置数码");
  });

  it("lets guests standard-export but gates high-res export behind login", () => {
    const guest = createGuestSession();

    const standardResult = evaluateExportAction("standard", guest, pack);
    expect(standardResult.status).toBe("ready");
    if (standardResult.status !== "ready") {
      throw new Error("expected standard export");
    }
    expect(standardResult.message).toBe("标准导出已准备：2 张图片和 1 份文案。");
    const highResResult = evaluateExportAction("high_res", guest, pack);
    expect(highResResult.status).toBe("login_required");
    if (highResResult.status !== "login_required") {
      throw new Error("expected login prompt");
    }
    expect(highResResult.prompt.title).toBe("登录后高清导出");
  });

  it("unlocks high-res export for logged-in demo users", () => {
    const result = evaluateExportAction("high_res", createDemoUserSession(), pack);

    expect(result.status).toBe("ready");
    if (result.status !== "ready") {
      throw new Error("expected ready export");
    }
    expect(result.message).toBe("高清导出已加入任务记录：2 张 PNG。");
  });

  it("returns copy feedback for the publish copy action", () => {
    const result = evaluateExportAction("copy", createGuestSession(), pack);

    expect(result.status).toBe("ready");
    if (result.status !== "ready") {
      throw new Error("expected copy feedback");
    }
    expect(result.message).toBe("发布文案已复制：1 个标题、1 段描述、4 个标签。");
  });
});
