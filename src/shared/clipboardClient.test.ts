import { describe, expect, it, vi } from "vitest";

import { copyTextToClipboard } from "./clipboardClient";

describe("clipboard client", () => {
  it("copies text through an injected clipboard implementation", async () => {
    const clipboard = {
      writeText: vi.fn(async (_text: string) => undefined)
    };

    const result = await copyTextToClipboard("hello", clipboard);

    expect(result.status).toBe("copied");
    expect(clipboard.writeText).toHaveBeenCalledWith("hello");
  });

  it("returns unavailable when the runtime has no clipboard", async () => {
    const result = await copyTextToClipboard("hello", null);

    expect(result.status).toBe("unavailable");
  });

  it("returns failed when the clipboard rejects", async () => {
    const clipboard = {
      writeText: vi.fn(async (_text: string) => {
        throw new Error("denied");
      })
    };

    const result = await copyTextToClipboard("hello", clipboard);

    expect(result.status).toBe("failed");
  });
});
