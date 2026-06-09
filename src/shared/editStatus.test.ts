import { describe, expect, it } from "vitest";

import { getEditStatus } from "./editStatus";

describe("edit status copy", () => {
  it("explains the idle edit state before any command runs", () => {
    const status = getEditStatus({
      hasHistory: false,
      endpointConfigured: false
    });

    expect(status.label).toBe("待改图");
    expect(status.title).toBe("输入修改要求");
    expect(status.detail).toContain("AI 会返回可应用到画布的编辑指令");
  });

  it("explains remote edit command routing", () => {
    const status = getEditStatus({
      source: "remote",
      hasHistory: true,
      endpointConfigured: true
    });

    expect(status.label).toBe("远端改图");
    expect(status.title).toBe("服务端编辑指令");
    expect(status.detail).toContain("/api/edit");
    expect(status.securityNote).toBe("移动端只发送画布状态和用户指令，不保存模型密钥。");
  });

  it("explains fallback edit commands when the remote route fails", () => {
    const status = getEditStatus({
      source: "mock",
      hasHistory: true,
      endpointConfigured: true,
      fallbackReason: "remote_failed"
    });

    expect(status.label).toBe("降级改图");
    expect(status.title).toBe("远端失败，已使用稳定编辑指令");
  });
});
