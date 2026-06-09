import { describe, expect, it } from "vitest";

import { createDemoUserSession, createGuestSession, getLoginPromptCopy, shouldPromptForLogin } from "./session";

describe("guest session policy", () => {
  it("creates a guest session that can run the first local flow", () => {
    const session = createGuestSession();

    expect(session.kind).toBe("guest");
    expect(session.remainingFreePacks).toBe(1);
    expect(session.canExportStandard).toBe(true);
    expect(session.canSaveHistory).toBe(false);
  });

  it("prompts for login only on durable or high-value actions", () => {
    expect(shouldPromptForLogin("start_flow", createGuestSession())).toBe(false);
    expect(shouldPromptForLogin("save_history", createGuestSession())).toBe(true);
    expect(shouldPromptForLogin("high_res_export", createGuestSession())).toBe(true);
  });

  it("creates a signed-in seller session that unlocks durable workspace actions", () => {
    const session = createDemoUserSession();

    expect(session.kind).toBe("user");
    expect(session.canSaveHistory).toBe(true);
    expect(shouldPromptForLogin("save_history", session)).toBe(false);
    expect(shouldPromptForLogin("batch_generate", session)).toBe(false);
  });

  it("explains why login is required for high-value actions", () => {
    expect(getLoginPromptCopy("save_history").title).toBe("登录后保存作品");
    expect(getLoginPromptCopy("high_res_export").benefits).toContain("高清导出和跨设备找回");
  });
});
