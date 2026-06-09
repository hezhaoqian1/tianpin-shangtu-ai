import {
  createTitleShorteningCommand,
  type EditCommand,
  type EditOperation,
  type PublishPack
} from "./productPipeline";

export type AppEditSource = "mock" | "remote";

export type AppEditResult = {
  source: AppEditSource;
  command: EditCommand;
  fallbackReason?: string;
};

export type AppEditFetcher = (
  url: string,
  init: { method: "POST"; headers: Record<string, string>; body: string }
) => Promise<{
  ok: boolean;
  json: () => Promise<unknown>;
}>;

export type CreateEditCommandForAppParams = {
  pack: PublishPack;
  userMessage: string;
  apiEndpoint?: string;
  fetcher?: AppEditFetcher;
};

export async function createEditCommandForApp({
  pack,
  userMessage,
  apiEndpoint,
  fetcher = fetch as AppEditFetcher
}: CreateEditCommandForAppParams): Promise<AppEditResult> {
  if (!apiEndpoint) {
    return mockAppEdit(pack);
  }

  try {
    const response = await fetcher(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userMessage,
        pack
      })
    });

    if (!response.ok) {
      return mockAppEdit(pack, "remote_failed");
    }

    const payload = await response.json();
    const command = normalizeEditCommand(asRecord(payload).command);
    return {
      source: "remote",
      command
    };
  } catch {
    return mockAppEdit(pack, "remote_failed");
  }
}

function mockAppEdit(pack: PublishPack, fallbackReason?: string): AppEditResult {
  return {
    source: "mock",
    command: createTitleShorteningCommand(pack),
    fallbackReason
  };
}

function normalizeEditCommand(value: unknown): EditCommand {
  const record = asRecord(value);
  const copy = record.copy ? asRecord(record.copy) : undefined;

  return {
    intent: stringValue(record.intent),
    operations: arrayValue(record.operations).map(normalizeOperation),
    copy: copy?.primaryTitle
      ? {
          primaryTitle: stringValue(copy.primaryTitle)
        }
      : undefined,
    explanation: stringValue(record.explanation)
  };
}

function normalizeOperation(value: unknown): EditOperation {
  const record = asRecord(value);
  const type = stringValue(record.type);

  if (type === "updateText") {
    return {
      type,
      layerId: stringValue(record.layerId),
      text: stringValue(record.text)
    };
  }

  if (type === "updateBackground") {
    const background = asRecord(record.background);
    const backgroundType = stringValue(background.type);
    if (backgroundType !== "color") {
      throw new Error("Unsupported background");
    }

    return {
      type,
      assetId: stringValue(record.assetId),
      background: {
        type: "color",
        value: stringValue(background.value)
      }
    };
  }

  if (type === "addCallout") {
    return {
      type,
      assetId: stringValue(record.assetId),
      imageId: stringValue(record.imageId),
      label: stringValue(record.label),
      bbox: toBbox(record.bbox)
    };
  }

  throw new Error("Unsupported operation");
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new Error("Expected object");
  }

  return value as Record<string, unknown>;
}

function arrayValue(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error("Expected array");
  }

  return value;
}

function stringValue(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Expected string");
  }

  return value;
}

function toBbox(value: unknown): [number, number, number, number] {
  const values = arrayValue(value);
  if (values.length !== 4 || values.some((item) => typeof item !== "number")) {
    throw new Error("Expected bbox");
  }

  return values as [number, number, number, number];
}

