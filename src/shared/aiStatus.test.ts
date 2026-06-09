import { describe, expect, it } from "vitest";

import { getAnalysisStatus } from "./aiStatus";

describe("AI status copy", () => {
  it("explains local fast mode when no endpoint is configured", () => {
    const status = getAnalysisStatus({
      source: "mock",
      endpointConfigured: false
    });

    expect(status.label).toBe("快速模式");
    expect(status.title).toBe("本机快速诊断");
    expect(status.detail).toContain("不依赖网络");
    expect(status.securityNote).toBe("移动端不保存 OpenAI/Grok API Key。");
  });

  it("explains remote model mode when the server responds", () => {
    const status = getAnalysisStatus({
      source: "remote",
      endpointConfigured: true
    });

    expect(status.label).toBe("远端 AI");
    expect(status.title).toBe("服务端模型路由");
    expect(status.detail).toContain("/api/analyze");
  });

  it("explains fallback mode when the remote route fails", () => {
    const status = getAnalysisStatus({
      source: "mock",
      endpointConfigured: true,
      fallbackReason: "remote_failed"
    });

    expect(status.label).toBe("快速模式");
    expect(status.title).toBe("远端暂不可用，已自动兜底");
    expect(status.detail).toContain("发布包流程");
  });
});
