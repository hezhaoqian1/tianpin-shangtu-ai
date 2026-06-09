import {
  createMockProductAnalysis,
  type Platform,
  type ProductAnalysis,
  type UploadedAsset
} from "../shared/productPipeline";

export type ModelProvider = "mock" | "openai" | "grok";

export type ModelRouterConfig = {
  provider: ModelProvider;
  openaiApiKey?: string;
  openaiModel: string;
  xaiApiKey?: string;
  xaiModel: string;
};

export type Fetcher = (url: string, init: RequestInit & { headers: Record<string, string>; body: string }) => Promise<Response>;

export type AnalyzeProductParams = {
  uploads: UploadedAsset[];
  platform: Platform;
  config: ModelRouterConfig;
  fetcher?: Fetcher;
};

export type AnalyzeProductResult = {
  provider: ModelProvider;
  analysis: ProductAnalysis;
  fallbackReason?: string;
};

export function createModelRouterConfig(overrides: Partial<ModelRouterConfig> = {}): ModelRouterConfig {
  return {
    provider: overrides.provider ?? readProvider(),
    openaiApiKey: overrides.openaiApiKey ?? readEnv("OPENAI_API_KEY"),
    openaiModel: overrides.openaiModel ?? readEnv("OPENAI_MODEL") ?? "gpt-5-mini",
    xaiApiKey: overrides.xaiApiKey ?? readEnv("XAI_API_KEY"),
    xaiModel: overrides.xaiModel ?? readEnv("XAI_MODEL") ?? "grok-4.1-fast",
    ...overrides
  };
}

export async function analyzeProductWithModel({
  uploads,
  platform,
  config,
  fetcher = fetch as Fetcher
}: AnalyzeProductParams): Promise<AnalyzeProductResult> {
  if (config.provider === "mock") {
    return mockResult(uploads, platform);
  }

  if (config.provider === "openai") {
    if (!config.openaiApiKey) {
      return mockResult(uploads, platform, "missing_openai_key");
    }

    try {
      const analysis = await analyzeWithOpenAI({ uploads, platform, config, fetcher });
      return { provider: "openai", analysis };
    } catch {
      return mockResult(uploads, platform, "openai_request_failed");
    }
  }

  if (!config.xaiApiKey) {
    return mockResult(uploads, platform, "missing_xai_key");
  }

  try {
    const analysis = await analyzeWithXai({ uploads, platform, config, fetcher });
    return { provider: "grok", analysis };
  } catch {
    return mockResult(uploads, platform, "xai_request_failed");
  }
}

async function analyzeWithOpenAI({
  uploads,
  platform,
  config,
  fetcher
}: Required<Pick<AnalyzeProductParams, "uploads" | "platform" | "config">> & { fetcher: Fetcher }) {
  const response = await fetcher("https://api.openai.com/v1/responses", {
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
          content: [{ type: "input_text", text: userPrompt(uploads, platform) }]
        }
      ],
      text: {
        format: productAnalysisJsonSchema()
      }
    })
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed");
  }

  const payload = await response.json();
  return parseOpenAiAnalysis(payload);
}

async function analyzeWithXai({
  uploads,
  platform,
  config,
  fetcher
}: Required<Pick<AnalyzeProductParams, "uploads" | "platform" | "config">> & { fetcher: Fetcher }) {
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
        { role: "user", content: userPrompt(uploads, platform) }
      ],
      response_format: {
        type: "json_schema",
        json_schema: productAnalysisJsonSchema().schema
      }
    })
  });

  if (!response.ok) {
    throw new Error("xAI request failed");
  }

  const payload = await response.json();
  return parseJsonAnalysis(payload.choices?.[0]?.message?.content);
}

function mockResult(uploads: UploadedAsset[], platform: Platform, fallbackReason?: string): AnalyzeProductResult {
  return {
    provider: "mock",
    analysis: createMockProductAnalysis(uploads, platform),
    fallbackReason
  };
}

function systemPrompt() {
  return [
    "你是移动端卖货图助手的商品诊断 agent。",
    "只返回符合 schema 的 JSON。",
    "不要虚构品牌、型号、配件或成色。",
    "发现瑕疵时应提示标注，不要建议隐藏。"
  ].join("\n");
}

function userPrompt(uploads: UploadedAsset[], platform: Platform) {
  const uploadSummary = uploads
    .map((asset, index) => `${index + 1}. ${asset.label} (${asset.width}x${asset.height}) uri=${asset.uri}`)
    .join("\n");

  return [`发布平台：${platform}`, "用户上传图片：", uploadSummary].join("\n");
}

function productAnalysisJsonSchema() {
  return {
    type: "json_schema",
    name: "ProductAnalysis",
    schema: {
      type: "object",
      additionalProperties: false,
      required: [
        "productType",
        "productName",
        "category",
        "condition",
        "sellingPoints",
        "missingShots",
        "truthfulnessWarnings"
      ],
      properties: {
        productType: { type: "string" },
        productName: { type: "string" },
        category: { type: "string" },
        condition: {
          type: "object",
          additionalProperties: false,
          required: ["label", "confidence", "visibleIssues"],
          properties: {
            label: { type: "string" },
            confidence: { type: "number" },
            visibleIssues: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["imageId", "description", "bbox"],
                properties: {
                  imageId: { type: "string" },
                  description: { type: "string" },
                  bbox: {
                    type: "array",
                    minItems: 4,
                    maxItems: 4,
                    items: { type: "number" }
                  }
                }
              }
            }
          }
        },
        sellingPoints: { type: "array", items: { type: "string" } },
        missingShots: { type: "array", items: { type: "string" } },
        truthfulnessWarnings: { type: "array", items: { type: "string" } }
      }
    },
    strict: true
  };
}

function parseOpenAiAnalysis(payload: unknown): ProductAnalysis {
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
        return parseJsonAnalysis(text);
      }
    }
  }

  throw new Error("Missing OpenAI JSON text");
}

function parseJsonAnalysis(raw: unknown): ProductAnalysis {
  if (typeof raw !== "string") {
    throw new Error("Missing JSON content");
  }

  const parsed = JSON.parse(raw);
  return normalizeProductAnalysis(parsed);
}

function normalizeProductAnalysis(value: unknown): ProductAnalysis {
  const record = asRecord(value);
  const condition = asRecord(record.condition);

  return {
    productType: stringValue(record.productType),
    productName: stringValue(record.productName),
    category: stringValue(record.category),
    condition: {
      label: stringValue(condition.label),
      confidence: numberValue(condition.confidence),
      visibleIssues: arrayValue(condition.visibleIssues).map((issue) => {
        const issueRecord = asRecord(issue);
        return {
          imageId: stringValue(issueRecord.imageId),
          description: stringValue(issueRecord.description),
          bbox: toBbox(issueRecord.bbox)
        };
      })
    },
    sellingPoints: arrayValue(record.sellingPoints).map(stringValue),
    missingShots: arrayValue(record.missingShots).map(stringValue),
    truthfulnessWarnings: arrayValue(record.truthfulnessWarnings).map(stringValue)
  };
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

function numberValue(value: unknown): number {
  if (typeof value !== "number") {
    throw new Error("Expected number");
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

function readProvider(): ModelProvider {
  const value = readEnv("MODEL_PROVIDER");
  if (value === "openai" || value === "grok" || value === "mock") {
    return value;
  }

  return "mock";
}

function readEnv(name: string): string | undefined {
  const env = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return env.process?.env?.[name];
}

