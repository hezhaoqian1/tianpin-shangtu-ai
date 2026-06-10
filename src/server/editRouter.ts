import {
  createTitleShorteningCommand,
  type EditCommand,
  type EditOperation,
  type PublishPack
} from "../shared/productPipeline";
import { type Fetcher, type ModelProvider, type ModelRouterConfig } from "./modelRouter";

export type EditCommandParams = {
  pack: PublishPack;
  userMessage: string;
  config: ModelRouterConfig;
  fetcher?: Fetcher;
};

export type EditCommandResult = {
  provider: ModelProvider;
  command: EditCommand;
  fallbackReason?: string;
};

export async function createEditCommandWithModel({
  pack,
  userMessage,
  config,
  fetcher = fetch as Fetcher
}: EditCommandParams): Promise<EditCommandResult> {
  if (config.provider === "mock") {
    return mockResult(pack);
  }

  if (config.provider === "openai") {
    if (!config.openaiApiKey) {
      return mockResult(pack, "missing_openai_key");
    }

    try {
      const command = await editWithOpenAI({ pack, userMessage, config, fetcher });
      return { provider: "openai", command };
    } catch {
      return mockResult(pack, "openai_request_failed");
    }
  }

  if (!config.xaiApiKey) {
    return mockResult(pack, "missing_xai_key");
  }

  try {
    const command = await editWithXai({ pack, userMessage, config, fetcher });
    return { provider: "grok", command };
  } catch {
    return mockResult(pack, "xai_request_failed");
  }
}

async function editWithOpenAI({
  pack,
  userMessage,
  config,
  fetcher
}: Required<Pick<EditCommandParams, "pack" | "userMessage" | "config">> & { fetcher: Fetcher }) {
  const response = await fetcher(`${config.openaiBaseUrl}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.openaiModel,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt() }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt(pack, userMessage) }]
        }
      ],
      text: {
        format: editCommandJsonSchema()
      }
    })
  });

  if (!response.ok) {
    throw new Error("OpenAI edit request failed");
  }

  const payload = await response.json();
  return parseOpenAiCommand(payload);
}

async function editWithXai({
  pack,
  userMessage,
  config,
  fetcher
}: Required<Pick<EditCommandParams, "pack" | "userMessage" | "config">> & { fetcher: Fetcher }) {
  const response = await fetcher("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.xaiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.xaiModel,
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userPrompt(pack, userMessage) }
      ],
      response_format: {
        type: "json_schema",
        json_schema: editCommandJsonSchema().schema
      }
    })
  });

  if (!response.ok) {
    throw new Error("xAI edit request failed");
  }

  const payload = await response.json();
  return parseJsonCommand(payload.choices?.[0]?.message?.content);
}

function mockResult(pack: PublishPack, fallbackReason?: string): EditCommandResult {
  return {
    provider: "mock",
    command: createTitleShorteningCommand(pack),
    fallbackReason
  };
}

function systemPrompt() {
  return [
    "你是移动端卖货图助手的画布编辑 agent。",
    "只返回符合 schema 的 JSON。",
    "你只能修改文字、背景、瑕疵标注。",
    "不要改商品本体颜色、形状，也不要隐藏瑕疵。"
  ].join("\n");
}

function userPrompt(pack: PublishPack, userMessage: string) {
  return JSON.stringify({
    userMessage,
    pack: {
      id: pack.id,
      platform: pack.platform,
      style: pack.style,
      copy: pack.copy,
      canvases: pack.canvases.map((canvas) => ({
        id: canvas.id,
        type: canvas.type,
        width: canvas.width,
        height: canvas.height,
        background: canvas.background,
        layers: canvas.layers.map((layer) => ({
          id: layer.id,
          type: layer.type
        }))
      }))
    }
  });
}

function editCommandJsonSchema() {
  return {
    type: "json_schema",
    name: "EditCommand",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["intent", "operations", "copy", "explanation"],
      properties: {
        intent: { type: "string" },
        operations: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["type", "layerId", "text", "assetId", "background", "imageId", "label", "bbox"],
            properties: {
              type: { enum: ["updateText", "updateBackground", "addCallout"] },
              layerId: { type: ["string", "null"] },
              text: { type: ["string", "null"] },
              assetId: { type: ["string", "null"] },
              background: {
                type: ["object", "null"],
                additionalProperties: false,
                required: ["type", "value"],
                properties: {
                  type: { enum: ["color"] },
                  value: { type: "string" }
                }
              },
              imageId: { type: ["string", "null"] },
              label: { type: ["string", "null"] },
              bbox: {
                type: ["array", "null"],
                minItems: 4,
                maxItems: 4,
                items: { type: "number" }
              }
            }
          }
        },
        copy: {
          type: "object",
          additionalProperties: false,
          required: ["primaryTitle"],
          properties: {
            primaryTitle: { type: ["string", "null"] }
          }
        },
        explanation: { type: "string" }
      }
    },
    strict: true
  };
}

function parseOpenAiCommand(payload: unknown): EditCommand {
  const output = asRecord(payload).output;
  if (!Array.isArray(output)) {
    throw new Error("Missing OpenAI output");
  }

  for (const item of output) {
    const content = asRecord(item).content;
    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      const text = asRecord(part).text;
      if (typeof text === "string") {
        return parseJsonCommand(text);
      }
    }
  }

  throw new Error("Missing OpenAI command text");
}

function parseJsonCommand(raw: unknown): EditCommand {
  if (typeof raw !== "string") {
    throw new Error("Missing JSON content");
  }

  const parsed = JSON.parse(raw);
  return normalizeEditCommand(parsed);
}

function normalizeEditCommand(value: unknown): EditCommand {
  const record = asRecord(value);
  const copyRecord = record.copy ? asRecord(record.copy) : undefined;

  return {
    intent: stringValue(record.intent),
    operations: arrayValue(record.operations).map(normalizeOperation),
    copy: copyRecord?.primaryTitle
      ? {
          primaryTitle: stringValue(copyRecord.primaryTitle)
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
