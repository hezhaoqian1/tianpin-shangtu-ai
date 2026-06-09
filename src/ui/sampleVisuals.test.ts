import { describe, expect, it } from "vitest";

import { getSampleVisual } from "./sampleVisuals";

describe("sample product visuals", () => {
  it("maps demo sample URIs to visual presets", () => {
    expect(getSampleVisual("sample://headphones/front")?.kind).toBe("headphones_front");
    expect(getSampleVisual("sample://headphones/case")?.kind).toBe("headphones_case");
    expect(getSampleVisual("sample://headphones/wear")?.kind).toBe("headphones_wear");
  });

  it("does not claim regular uploaded files as sample visuals", () => {
    expect(getSampleVisual("file:///front.jpg")).toBeNull();
    expect(getSampleVisual(undefined)).toBeNull();
  });
});
