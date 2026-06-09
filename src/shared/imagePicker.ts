import { type UploadedAsset } from "./productPipeline";

export type PickedImageAsset = {
  uri: string;
  width?: number | null;
  height?: number | null;
  fileName?: string | null;
};

export function mapPickedImagesToUploads(assets: PickedImageAsset[]): UploadedAsset[] {
  return assets.map((asset, index) => {
    const position = index + 1;

    return {
      id: `picked_${String(position).padStart(2, "0")}`,
      uri: asset.uri,
      label: asset.fileName || `相册图 ${position}`,
      width: asset.width || 1080,
      height: asset.height || 1080
    };
  });
}

