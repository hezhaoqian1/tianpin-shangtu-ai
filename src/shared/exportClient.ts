import { createExportManifest, type ExportManifest } from "./exportBundle";
import { type PublishPack } from "./productPipeline";
import { type UserSession } from "./session";

export type ExportClientFetcher = (
  url: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
  }
) => Promise<{
  ok: boolean;
  json: () => Promise<unknown>;
}>;

export type PrepareExportForAppResult =
  | {
      status: "ready";
      manifest: ExportManifest;
    }
  | {
      status: "local_only";
      manifest: ExportManifest;
    }
  | {
      status: "remote_failed";
      manifest: ExportManifest;
    };

export async function prepareExportForApp({
  endpoint,
  pack,
  session,
  fetcher = fetch as ExportClientFetcher
}: {
  endpoint?: string;
  pack: PublishPack;
  session: UserSession;
  fetcher?: ExportClientFetcher;
}): Promise<PrepareExportForAppResult> {
  const localManifest = createExportManifest(pack, session);

  if (!endpoint) {
    return {
      status: "local_only",
      manifest: localManifest
    };
  }

  try {
    const response = await fetcher(normalizeExportEndpoint(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pack,
        session
      })
    });

    if (!response.ok) {
      return {
        status: "remote_failed",
        manifest: localManifest
      };
    }

    const body = asRecord(await response.json());
    const manifest = asExportManifest(body.manifest);

    return {
      status: manifest ? "ready" : "remote_failed",
      manifest: manifest ?? localManifest
    };
  } catch {
    return {
      status: "remote_failed",
      manifest: localManifest
    };
  }
}

function normalizeExportEndpoint(endpoint: string) {
  return endpoint.replace(/\/+$/, "");
}

function asExportManifest(value: unknown): ExportManifest | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  if (
    typeof record.exportId !== "string" ||
    typeof record.platformLabel !== "string" ||
    typeof record.summary !== "string" ||
    !Array.isArray(record.files) ||
    typeof record.publishCopy !== "string" ||
    !Array.isArray(record.checklist)
  ) {
    return undefined;
  }

  return record as ExportManifest;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
