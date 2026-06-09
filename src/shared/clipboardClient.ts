export type ClipboardLike = {
  writeText: (text: string) => Promise<void>;
};

export type ClipboardCopyResult =
  | {
      status: "copied";
    }
  | {
      status: "unavailable";
    }
  | {
      status: "failed";
    };

export async function copyTextToClipboard(
  text: string,
  clipboard: ClipboardLike | null | undefined = getRuntimeClipboard()
): Promise<ClipboardCopyResult> {
  if (!clipboard) {
    return { status: "unavailable" };
  }

  try {
    await clipboard.writeText(text);
    return { status: "copied" };
  } catch {
    return { status: "failed" };
  }
}

function getRuntimeClipboard(): ClipboardLike | null {
  const maybeNavigator = globalThis.navigator as { clipboard?: ClipboardLike } | undefined;
  return maybeNavigator?.clipboard ?? null;
}
