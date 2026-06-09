import { describe, expect, it } from "vitest";

import { createTitleShorteningCommand, type EditCommand } from "./productPipeline";
import {
  appendEditSuggestion,
  canSubmitEditPrompt,
  getDefaultEditPrompt,
  getLatestEditExplanation,
  normalizeEditPrompt
} from "./editConversation";
import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "./productPipeline";

describe("edit conversation helpers", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);

  it("normalizes user prompts before sending them to the edit API", () => {
    expect(normalizeEditPrompt("  标题短一点\n背景真实一点  ")).toBe("标题短一点 背景真实一点");
    expect(canSubmitEditPrompt("   ")).toBe(false);
    expect(canSubmitEditPrompt("突出瑕疵")).toBe(true);
  });

  it("appends chip suggestions without duplicating the same instruction", () => {
    expect(appendEditSuggestion("", "标题短一点")).toBe("标题短一点");
    expect(appendEditSuggestion("标题短一点", "背景真实一点")).toBe("标题短一点，背景真实一点");
    expect(appendEditSuggestion("标题短一点，背景真实一点", "标题短一点")).toBe("标题短一点，背景真实一点");
  });

  it("uses the latest edit command explanation for the conversation status", () => {
    const firstCommand = createTitleShorteningCommand(pack);
    const secondCommand: EditCommand = {
      ...firstCommand,
      explanation: "已把瑕疵说明放大。"
    };

    expect(getDefaultEditPrompt()).toBe("标题短一点，背景别太商业，瑕疵说明更明显");
    expect(getLatestEditExplanation([firstCommand, secondCommand])).toBe("已把瑕疵说明放大。");
    expect(getLatestEditExplanation([])).toBeNull();
  });
});
