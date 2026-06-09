import {
  createMockProductAnalysis,
  type Platform,
  type ProductAnalysis,
  type UploadedAsset
} from "./productPipeline";

export type AppAnalysisSource = "mock" | "remote";

export type AppAnalysisResult = {
  source: AppAnalysisSource;
  analysis: ProductAnalysis;
  fallbackReason?: string;
};

export type AppAnalysisFetcher = (
  url: string,
  init: { method: "POST"; headers: Record<string, string>; body: string }
) => Promise<{
  ok: boolean;
  json: () => Promise<unknown>;
}>;

export type AnalyzeUploadsForAppParams = {
  uploads: UploadedAsset[];
  platform: Platform;
  apiEndpoint?: string;
  fetcher?: AppAnalysisFetcher;
};

export async function analyzeUploadsForApp({
  uploads,
  platform,
  apiEndpoint,
  fetcher = fetch as AppAnalysisFetcher
}: AnalyzeUploadsForAppParams): Promise<AppAnalysisResult> {
  if (!apiEndpoint) {
    return mockAppAnalysis(uploads, platform);
  }

  try {
    const response = await fetcher(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        platform,
        uploads: uploads.map((asset) => ({
          id: asset.id,
          uri: asset.uri,
          label: asset.label,
          width: asset.width,
          height: asset.height
        }))
      })
    });

    if (!response.ok) {
      return mockAppAnalysis(uploads, platform, "remote_failed");
    }

    const payload = await response.json();
    const analysis = normalizeProductAnalysis(asRecord(payload).analysis);
    return {
      source: "remote",
      analysis
    };
  } catch {
    return mockAppAnalysis(uploads, platform, "remote_failed");
  }
}

function mockAppAnalysis(uploads: UploadedAsset[], platform: Platform, fallbackReason?: string): AppAnalysisResult {
  return {
    source: "mock",
    analysis: createMockProductAnalysis(uploads, platform),
    fallbackReason
  };
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

