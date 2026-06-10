export type CapabilityStatus = "ready" | "configured" | "mock" | "needs_config";

export type CapabilityItem = {
  id: string;
  label: string;
  status: CapabilityStatus;
  detail: string;
};

export type CapabilitySnapshot = {
  generatedAt: string;
  items: CapabilityItem[];
};

export type CapabilityClientResult = CapabilitySnapshot & {
  source: "remote" | "local";
};

export type CapabilityClientFetcher = (
  url: string,
  init: {
    method: "GET";
    headers: Record<string, string>;
  }
) => Promise<{
  ok: boolean;
  json: () => Promise<unknown>;
}>;

export async function getCapabilitiesForApp({
  endpoint,
  fetcher = fetch as CapabilityClientFetcher
}: {
  endpoint?: string;
  fetcher?: CapabilityClientFetcher;
}): Promise<CapabilityClientResult> {
  if (!endpoint) {
    return {
      source: "local",
      ...createLocalCapabilitySnapshot()
    };
  }

  try {
    const response = await fetcher(endpoint.replace(/\/+$/, ""), {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return {
        source: "local",
        ...createLocalCapabilitySnapshot()
      };
    }

    const body = asRecord(await response.json());
    const items = Array.isArray(body.items) ? body.items.filter(isCapabilityItem) : [];
    if (items.length === 0) {
      return {
        source: "local",
        ...createLocalCapabilitySnapshot()
      };
    }

    return {
      source: "remote",
      generatedAt: typeof body.generatedAt === "string" ? body.generatedAt : new Date().toISOString(),
      items
    };
  } catch {
    return {
      source: "local",
      ...createLocalCapabilitySnapshot()
    };
  }
}

export function createLocalCapabilitySnapshot(): CapabilitySnapshot {
  return {
    generatedAt: new Date().toISOString(),
    items: [
      {
        id: "api",
        label: "服务端 API",
        status: "mock",
        detail: "未配置能力状态接口，移动端仅显示本地占位状态。"
      },
      {
        id: "text_edit",
        label: "AI 对话编辑",
        status: "mock",
        detail: "配置能力状态接口后可查看服务端模型状态。"
      }
    ]
  };
}

function isCapabilityItem(value: unknown): value is CapabilityItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.label === "string" &&
    isCapabilityStatus(record.status) &&
    typeof record.detail === "string"
  );
}

function isCapabilityStatus(value: unknown): value is CapabilityStatus {
  return value === "ready" || value === "configured" || value === "mock" || value === "needs_config";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
