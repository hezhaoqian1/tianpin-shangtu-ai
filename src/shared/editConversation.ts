import { type EditCommand } from "./productPipeline";

const defaultEditPrompt = "标题短一点，背景别太商业，瑕疵说明更明显";

export function getDefaultEditPrompt(): string {
  return defaultEditPrompt;
}

export function normalizeEditPrompt(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function canSubmitEditPrompt(value: string): boolean {
  return normalizeEditPrompt(value).length > 0;
}

export function appendEditSuggestion(currentValue: string, suggestion: string): string {
  const current = normalizeEditPrompt(currentValue);
  const nextSuggestion = normalizeEditPrompt(suggestion);

  if (!current) {
    return nextSuggestion;
  }

  if (current.includes(nextSuggestion)) {
    return current;
  }

  return `${current}，${nextSuggestion}`;
}

export function getLatestEditExplanation(history: EditCommand[]): string | null {
  return history.at(-1)?.explanation ?? null;
}
