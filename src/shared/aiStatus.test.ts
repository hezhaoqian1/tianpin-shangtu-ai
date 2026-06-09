import { describe, expect, it } from "vitest";

import { getAnalysisStatus } from "./aiStatus";

describe("AI status copy", () => {
  it("explains local demo mode when no endpoint is configured", () => {
    const status = getAnalysisStatus({
      source: "mock",
      endpointConfigured: false
    });

    expect(status.label).toBe("本地演示");
    expect(status.title).toBe("稳定 mock 流程");
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

    expect(status.label).toBe("降级演示");
    expect(status.title).toBe("远端失败，已自动兜底");
    expect(status.detail).toContain("面试现场");
  });
});
