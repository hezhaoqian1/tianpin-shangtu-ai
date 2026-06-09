import sharp from "sharp";

import { type CanvasAsset, type UploadedAsset } from "../shared/productPipeline";

export type RenderedCanvas = {
  buffer: Buffer;
  contentType: "image/png";
  width: number;
  height: number;
};

export async function renderCanvasToPng(canvas: CanvasAsset, uploads: UploadedAsset[]): Promise<RenderedCanvas> {
  const svg = renderCanvasSvg(canvas, uploads);
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return {
    buffer,
    contentType: "image/png",
    width: canvas.width,
    height: canvas.height
  };
}

export function renderCanvasSvg(canvas: CanvasAsset, uploads: UploadedAsset[]) {
  const uploadMap = new Map(uploads.map((upload) => [upload.id, upload]));
  const background = escapeXml(canvas.background.value);
  const layers = canvas.layers
    .map((layer) => {
      if (layer.type === "image") {
        const upload = uploadMap.get(layer.imageId);
        const href = upload?.remoteUrl;
        if (href) {
          return `<image href="${escapeXml(href)}" x="${layer.x}" y="${layer.y}" width="${layer.width}" height="${layer.height}" preserveAspectRatio="xMidYMid slice" />`;
        }

        return [
          `<rect x="${layer.x}" y="${layer.y}" width="${layer.width}" height="${layer.height}" rx="${layer.cornerRadius ?? 18}" fill="#DED8C9" />`,
          `<text x="${layer.x + layer.width / 2}" y="${layer.y + layer.height / 2}" text-anchor="middle" dominant-baseline="middle" fill="#6D6A61" font-size="32" font-family="Arial" font-weight="700">${escapeXml(upload?.label ?? layer.imageId)}</text>`
        ].join("");
      }

      if (layer.type === "text") {
        return `<text x="${layer.x}" y="${layer.y}" fill="${escapeXml(layer.color)}" font-size="${layer.fontSize}" font-family="Arial" font-weight="${fontWeight(layer.fontWeight)}">${escapeXml(layer.text)}</text>`;
      }

      if (layer.type === "label") {
        const width = Math.max(120, layer.text.length * 28);
        const height = 56;
        return [
          `<rect x="${layer.x}" y="${layer.y - 40}" width="${width}" height="${height}" rx="28" fill="${escapeXml(layer.backgroundColor)}" />`,
          `<text x="${layer.x + 24}" y="${layer.y}" fill="${escapeXml(layer.color)}" font-size="28" font-family="Arial" font-weight="700">${escapeXml(layer.text)}</text>`
        ].join("");
      }

      const [x, y, width, height] = layer.bbox;
      return [
        `<rect x="${x * canvas.width}" y="${y * canvas.height}" width="${width * canvas.width}" height="${height * canvas.height}" fill="none" stroke="#B25542" stroke-width="8" rx="16" />`,
        `<text x="${x * canvas.width}" y="${y * canvas.height - 16}" fill="#B25542" font-size="28" font-family="Arial" font-weight="700">${escapeXml(layer.label)}</text>`
      ].join("");
    })
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">`,
    `<rect width="100%" height="100%" fill="${background}" />`,
    layers,
    "</svg>"
  ].join("");
}

function fontWeight(weight: "regular" | "medium" | "bold" | undefined) {
  if (weight === "bold") return 800;
  if (weight === "medium") return 600;
  return 500;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
