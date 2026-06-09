import { describe, expect, it } from "vitest";

import { evaluateUploadReadiness, getUploadGuidance } from "./uploadGuidance";

describe("platform upload guidance", () => {
  it("gives marketplace-specific shot guidance", () => {
    const xianyu = getUploadGuidance("xianyu");
    const xiaohongshu = getUploadGuidance("xiaohongshu");

    expect(xianyu.title).toBe("闲鱼照片清单");
    expect(xianyu.requiredShots).toContain("瑕疵近景");
    expect(xianyu.toneHint).toContain("真实");
    expect(xiaohongshu.title).toBe("小红书照片清单");
    expect(xiaohongshu.requiredShots).toContain("生活场景图");
    expect(xiaohongshu.toneHint).toContain("封面");
  });

  it("evaluates upload readiness from image count and resolution", () => {
    expect(evaluateUploadReadiness([], "xianyu").status).toBe("empty");

    const partial = evaluateUploadReadiness(
      [
        { id: "a", uri: "file:///a.jpg", label: "a", width: 640, height: 640 },
        { id: "b", uri: "file:///b.jpg", label: "b", width: 1080, height: 1080 }
      ],
      "xianyu"
    );

    expect(partial.status).toBe("needs_more");
    expect(partial.messages).toContain("建议至少 3 张：正面、细节、瑕疵/配件。");
    expect(partial.messages).toContain("有 1 张图片低于 800px，导出高清图时可能发虚。");

    const ready = evaluateUploadReadiness(
      [
        { id: "a", uri: "file:///a.jpg", label: "a", width: 1200, height: 1200 },
        { id: "b", uri: "file:///b.jpg", label: "b", width: 1080, height: 1080 },
        { id: "c", uri: "file:///c.jpg", label: "c", width: 1000, height: 1200 }
      ],
      "xianyu"
    );

    expect(ready.status).toBe("ready");
    expect(ready.messages[0]).toBe("照片数量足够，可以生成可信发布包。");
  });
});
