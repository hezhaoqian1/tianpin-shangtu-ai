import { describe, expect, it } from "vitest";

import { mapPickedImagesToUploads } from "./imagePicker";

describe("image picker mapping", () => {
  it("maps picked gallery assets to uploaded assets with stable labels", () => {
    const uploads = mapPickedImagesToUploads([
      {
        uri: "file:///front.jpg",
        width: 1200,
        height: 900,
        fileName: "front.jpg"
      },
      {
        uri: "file:///detail.jpg",
        width: 800,
        height: 800
      }
    ]);

    expect(uploads).toEqual([
      {
        id: "picked_01",
        uri: "file:///front.jpg",
        mimeType: "image/jpeg",
        label: "front.jpg",
        width: 1200,
        height: 900
      },
      {
        id: "picked_02",
        uri: "file:///detail.jpg",
        mimeType: "image/jpeg",
        label: "相册图 2",
        width: 800,
        height: 800
      }
    ]);
  });

  it("falls back to square dimensions when native metadata is missing", () => {
    const [upload] = mapPickedImagesToUploads([{ uri: "file:///unknown.jpg" }]);

    expect(upload.width).toBe(1080);
    expect(upload.height).toBe(1080);
  });
});
