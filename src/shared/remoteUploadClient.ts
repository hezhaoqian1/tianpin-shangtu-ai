import { type UploadedAsset } from "./productPipeline";
import { createUploadIntentForApp, type UploadIntent, type UploadIntentFetcher } from "./uploadClient";

export type BinaryUploadFetcher = (
  url: string,
  init?: {
    method?: "GET" | "PUT";
    headers?: Record<string, string>;
    body?: BodyInit;
  }
) => Promise<{
  ok: boolean;
  blob?: () => Promise<Blob>;
  arrayBuffer?: () => Promise<ArrayBuffer>;
}>;

export type UploadAssetResult = {
  asset: UploadedAsset;
  uploaded: boolean;
  fallbackReason?: "missing_endpoint" | "missing_public_url" | "read_failed" | "upload_failed";
};

export async function uploadAssetsForAnalysis({
  assets,
  endpoint,
  ownerId,
  intentFetcher,
  binaryFetcher = fetch as BinaryUploadFetcher
}: {
  assets: UploadedAsset[];
  endpoint?: string;
  ownerId?: string;
  intentFetcher?: UploadIntentFetcher;
  binaryFetcher?: BinaryUploadFetcher;
}): Promise<UploadAssetResult[]> {
  if (!endpoint) {
    return assets.map((asset) => ({
      asset,
      uploaded: false,
      fallbackReason: "missing_endpoint"
    }));
  }

  return Promise.all(
    assets.map(async (asset) => {
      try {
        const intent = await createUploadIntentForApp({
          endpoint,
          fileName: fileNameForAsset(asset),
          contentType: asset.mimeType ?? "image/jpeg",
          ownerId,
          fetcher: intentFetcher
        });

        if (!intent?.publicUrl) {
          return {
            asset,
            uploaded: false,
            fallbackReason: "missing_public_url" as const
          };
        }

        const body = await readAssetBody(asset.uri, binaryFetcher);
        if (!body) {
          return {
            asset,
            uploaded: false,
            fallbackReason: "read_failed" as const
          };
        }

        const uploaded = await putObject(intent, body, binaryFetcher);
        if (!uploaded) {
          return {
            asset,
            uploaded: false,
            fallbackReason: "upload_failed" as const
          };
        }

        return {
          asset: {
            ...asset,
            remoteUrl: intent.publicUrl,
            uri: intent.publicUrl,
            mimeType: asset.mimeType ?? intent.headers["Content-Type"]
          },
          uploaded: true
        };
      } catch {
        return {
          asset,
          uploaded: false,
          fallbackReason: "upload_failed" as const
        };
      }
    })
  );
}

async function readAssetBody(uri: string, fetcher: BinaryUploadFetcher): Promise<BodyInit | undefined> {
  const response = await fetcher(uri, { method: "GET" });
  if (!response.ok) {
    return undefined;
  }

  if (response.blob) {
    return response.blob();
  }

  if (response.arrayBuffer) {
    return response.arrayBuffer();
  }

  return undefined;
}

async function putObject(intent: UploadIntent, body: BodyInit, fetcher: BinaryUploadFetcher) {
  const response = await fetcher(intent.uploadUrl, {
    method: intent.method,
    headers: intent.headers,
    body
  });

  return response.ok;
}

function fileNameForAsset(asset: UploadedAsset) {
  const label = asset.label && /\.[a-z0-9]+$/i.test(asset.label) ? asset.label : undefined;
  if (label) {
    return label;
  }

  const extension = extensionForMimeType(asset.mimeType);
  return `${asset.id}${extension}`;
}

function extensionForMimeType(mimeType?: string) {
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  return ".jpg";
}
