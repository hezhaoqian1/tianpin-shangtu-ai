import sharp from "sharp";

export type PreparedImage = {
  buffer: Buffer;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  width: number;
  height: number;
  byteLength: number;
};

export type PrepareImageOptions = {
  maxSize?: number;
  format?: "jpeg" | "png" | "webp";
  quality?: number;
};

export async function prepareProductImage(
  input: Buffer,
  options: PrepareImageOptions = {}
): Promise<PreparedImage> {
  const maxSize = options.maxSize ?? 1600;
  const format = options.format ?? "jpeg";
  const quality = options.quality ?? 86;

  let pipeline = sharp(input, { failOn: "none" }).rotate().resize({
    width: maxSize,
    height: maxSize,
    fit: "inside",
    withoutEnlargement: true
  });

  if (format === "webp") {
    pipeline = pipeline.webp({ quality });
  } else if (format === "png") {
    pipeline = pipeline.png({ compressionLevel: 9 });
  } else {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    contentType: contentTypeForFormat(format),
    width: info.width,
    height: info.height,
    byteLength: data.byteLength
  };
}

export async function createThumbnail(input: Buffer, size = 480): Promise<PreparedImage> {
  return prepareProductImage(input, {
    maxSize: size,
    format: "webp",
    quality: 78
  });
}

function contentTypeForFormat(format: "jpeg" | "png" | "webp") {
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  return "image/jpeg";
}
