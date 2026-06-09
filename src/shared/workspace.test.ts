import { describe, expect, it } from "vitest";

import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "./productPipeline";
import { createDemoUserSession, createGuestSession } from "./session";
import { createHistoryItemFromPack, createSavedProjectFromPack, getWorkspaceSummary } from "./workspace";

describe("workspace history", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);

  it("requires login before saving an export into history", () => {
    const result = createHistoryItemFromPack({
      session: createGuestSession(),
      pack,
      analysis,
      uploadsCount: uploads.length
    });

    expect(result.status).toBe("login_required");
    if (result.status !== "login_required") {
      throw new Error("expected login gate");
    }
    expect(result.prompt.title).toBe("登录后保存作品");
  });

  it("creates a seller-readable history item for logged-in users", () => {
    const result = createHistoryItemFromPack({
      session: createDemoUserSession(),
      pack,
      analysis,
      uploadsCount: uploads.length
    });

    expect(result.status).toBe("saved");
    if (result.status !== "saved") {
      throw new Error("expected saved history item");
    }
    expect(result.item.title).toBe("Sony WH-1000XM5 头戴降噪耳机");
    expect(result.item.platformLabel).toBe("闲鱼卖货");
    expect(result.item.assetSummary).toBe("2 张画布 / 4 张原图");
  });

  it("creates a restorable saved project for logged-in users", () => {
    const result = createSavedProjectFromPack({
      session: createDemoUserSession(),
      pack,
      analysis,
      uploads
    });

    expect(result.status).toBe("saved");
    if (result.status !== "saved") {
      throw new Error("expected saved project");
    }
    expect(result.project.item.id).toBe("demo_seller_account_pack_authentic");
    expect(result.project.pack.id).toBe(pack.id);
    expect(result.project.analysis.productName).toBe(analysis.productName);
    expect(result.project.uploads).toHaveLength(4);
  });

  it("requires login before creating a restorable saved project", () => {
    const result = createSavedProjectFromPack({
      session: createGuestSession(),
      pack,
      analysis,
      uploads
    });

    expect(result.status).toBe("login_required");
  });

  it("summarizes an empty guest workspace without pretending history exists", () => {
    const summary = getWorkspaceSummary({
      session: createGuestSession(),
      historyItems: []
    });

    expect(summary.heading).toBe("游客工作台");
    expect(summary.recentCountLabel).toBe("暂未保存");
    expect(summary.loginHint).toBe("登录后保留历史、风格和高清导出记录。");
  });
});
