import { describe, expect, it } from "vitest";

import {
  applyEditCommand,
  applyGeneratedCoverImage,
  createMockProductAnalysis,
  createPublishPacks,
  createSampleUploads,
  createTitleShorteningCommand
} from "./productPipeline";

describe("seller image assistant pipeline", () => {
  it("analyzes uploaded product photos into a diagnosis with truthfulness warnings", () => {
    const uploads = createSampleUploads("headphones");

    const analysis = createMockProductAnalysis(uploads, "xianyu");

    expect(analysis.productName).toContain("Sony");
    expect(analysis.sellingPoints).toContain("降噪通勤");
    expect(analysis.missingShots).toContain("充电口细节");
    expect(analysis.truthfulnessWarnings[0]).toContain("不要隐藏");
  });

  it("creates three publish pack options from an analysis", () => {
    const uploads = createSampleUploads("headphones");
    const analysis = createMockProductAnalysis(uploads, "xianyu");

    const packs = createPublishPacks(analysis, uploads);

    expect(packs).toHaveLength(3);
    expect(packs.map((pack) => pack.style)).toEqual([
      "authentic_resale",
      "clean_product",
      "xiaohongshu_seed"
    ]);
    expect(packs[0].canvases[0].layers.some((layer) => layer.type === "text")).toBe(true);
    expect(packs[0].copy.titles[0]).toContain("95 新");
  });

  it("prioritizes publish pack options for the selected platform", () => {
    const uploads = createSampleUploads("headphones");
    const xhsAnalysis = createMockProductAnalysis(uploads, "xiaohongshu");
    const shopAnalysis = createMockProductAnalysis(uploads, "shop_main");

    const xhsPacks = createPublishPacks(xhsAnalysis, uploads, "xiaohongshu");
    const shopPacks = createPublishPacks(shopAnalysis, uploads, "shop_main");

    expect(xhsPacks[0].style).toBe("xiaohongshu_seed");
    expect(xhsPacks.every((pack) => pack.platform === "xiaohongshu")).toBe(true);
    expect(xhsPacks[0].platformFitLabel).toBe("首推");
    expect(shopPacks[0].style).toBe("clean_product");
    expect(shopPacks.every((pack) => pack.platform === "shop_main")).toBe(true);
  });

  it("uses platform-specific copy tone in publish packs", () => {
    const uploads = createSampleUploads("headphones");
    const xhsAnalysis = createMockProductAnalysis(uploads, "xiaohongshu");
    const wechatAnalysis = createMockProductAnalysis(uploads, "wechat");
    const shopAnalysis = createMockProductAnalysis(uploads, "shop_main");

    const [xhsPack] = createPublishPacks(xhsAnalysis, uploads, "xiaohongshu");
    const [wechatPack] = createPublishPacks(wechatAnalysis, uploads, "wechat");
    const [shopPack] = createPublishPacks(shopAnalysis, uploads, "shop_main");

    expect(xhsPack.copy.description).toContain("通勤降噪体验");
    expect(xhsPack.copy.tags).toContain("小红书数码");
    expect(wechatPack.copy.description).toContain("今日可出");
    expect(wechatPack.copy.tags).toContain("朋友圈小店");
    expect(shopPack.copy.description).toContain("主体清楚");
    expect(shopPack.copy.tags).toContain("商品主图");
  });

  it("applies AI edit commands to the selected canvas and copy", () => {
    const uploads = createSampleUploads("headphones");
    const analysis = createMockProductAnalysis(uploads, "xianyu");
    const [pack] = createPublishPacks(analysis, uploads);
    const command = createTitleShorteningCommand(pack);

    const edited = applyEditCommand(pack, command);

    expect(edited.copy.titles[0]).toBe("自用 Sony 耳机，95 新");
    expect(edited.canvases[0].background.value).toBe("#F7F3EC");
    expect(edited.canvases[0].layers.find((layer) => layer.id === "title")?.type).toBe("text");
    expect(edited.canvases[1].layers.some((layer) => layer.type === "callout")).toBe(true);
    expect(edited.history).toHaveLength(1);
  });

  it("replaces the cover canvas with a persisted AI-generated cover image", () => {
    const uploads = createSampleUploads("headphones");
    const analysis = createMockProductAnalysis(uploads, "xianyu");
    const [pack] = createPublishPacks(analysis, uploads);

    const edited = applyGeneratedCoverImage(pack, {
      id: "generated_cover_pack_authentic",
      uri: "https://cdn.example.com/generated/cover.png",
      remoteUrl: "https://cdn.example.com/generated/cover.png",
      mimeType: "image/png",
      label: "AI 生成封面",
      width: 1024,
      height: 1024
    });

    expect(edited.canvases[0].layers).toEqual([
      {
        id: "generated_cover_image",
        type: "image",
        imageId: "generated_cover_pack_authentic",
        x: 0,
        y: 0,
        width: edited.canvases[0].width,
        height: edited.canvases[0].height,
        cornerRadius: 0
      }
    ]);
    expect(edited.canvases[1]).toBe(pack.canvases[1]);
  });
});
