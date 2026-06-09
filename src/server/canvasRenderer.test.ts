import { describe, expect, it } from "vitest";

import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "../shared/productPipeline";
import { renderCanvasSvg, renderCanvasToPng } from "./canvasRenderer";

describe("canvas renderer", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);
  const [canvas] = pack.canvases;

  it("renders publish canvas layers into SVG", () => {
    const svg = renderCanvasSvg(canvas, uploads);

    expect(svg).toContain("<svg");
    expect(svg).toContain("Sony WH-1000XM5");
    expect(svg).toContain("正面主图");
  });

  it("exports a PNG buffer with sharp", async () => {
    const rendered = await renderCanvasToPng(canvas, uploads);

    expect(rendered.contentType).toBe("image/png");
    expect(rendered.width).toBe(1080);
    expect(rendered.height).toBe(1080);
    expect(rendered.buffer.subarray(1, 4).toString("ascii")).toBe("PNG");
  });
});
