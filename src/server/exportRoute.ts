import { randomUUID } from "node:crypto";

import { createExportManifest, type ExportManifest } from "../shared/exportBundle";
import { type Platform, type PublishPack } from "../shared/productPipeline";
import { createGuestSession, type UserSession } from "../shared/session";

export type ExportRouteResponse =
  | {
      status: 200;
      body: {
        manifest: ExportManifest;
      };
    }
  | {
      status: 400;
      body: {
        error: string;
      };
    };

export async function handlePrepareExportRequest(body: unknown): Promise<ExportRouteResponse> {
  const parsed = parsePrepareExportBody(body);
  if (!parsed.ok) {
    return {
      status: 400,
      body: {
        error: parsed.error
      }
    };
  }

  return {
    status: 200,
    body: {
      manifest: createExportManifest(parsed.body.pack, parsed.body.session, `export_${randomUUID()}`)
    }
  };
}

function parsePrepareExportBody(value: unknown):
  | {
      ok: true;
      body: {
        pack: PublishPack;
        session: UserSession;
      };
    }
  | {
      ok: false;
      error: string;
    } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "invalid_body" };
  }

  const record = value as Record<string, unknown>;
  if (!isPublishPack(record.pack)) {
    return { ok: false, error: "invalid_pack" };
  }

  return {
    ok: true,
    body: {
      pack: record.pack,
      session: isUserSession(record.session) ? record.session : createGuestSession()
    }
  };
}

function isPublishPack(value: unknown): value is PublishPack {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    isPlatform(record.platform) &&
    typeof record.style === "string" &&
    typeof record.title === "string" &&
    typeof record.summary === "string" &&
    Array.isArray(record.canvases) &&
    record.canvases.length > 0 &&
    Boolean(record.copy)
  );
}

function isUserSession(value: unknown): value is UserSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    (record.kind === "guest" || record.kind === "user") &&
    typeof record.id === "string" &&
    typeof record.remainingFreePacks === "number" &&
    record.canExportStandard === true
  );
}

function isPlatform(value: unknown): value is Platform {
  return value === "xianyu" || value === "xiaohongshu" || value === "shop_main" || value === "wechat";
}
