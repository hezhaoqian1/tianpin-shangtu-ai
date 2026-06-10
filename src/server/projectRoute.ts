import { type Platform, type ProductAnalysis, type PublishPack } from "../shared/productPipeline";
import { type SavedProject } from "../shared/workspace";
import {
  createMemoryProjectRepository,
  createProjectRepository,
  type ProjectRepository,
  type SavedProjectRecord
} from "./projectRepository";
import { createServerIntegrationConfig } from "./env";

export type ProjectRouteResponse =
  | {
      status: 200;
      body: {
        project: SavedProject;
        storageProvider: "database" | "memory_fallback";
      };
    }
  | {
      status: 400;
      body: {
        error: string;
      };
    };

export type ProjectListRouteResponse =
  | {
      status: 200;
      body: {
        projects: SavedProject[];
        storageProvider: "database" | "memory_fallback";
      };
    }
  | {
      status: 400;
      body: {
        error: string;
      };
    };

let sharedRepository: ProjectRepository | undefined;
const fallbackRepository = createMemoryProjectRepository();

export async function handleSaveProjectRequest(
  body: unknown,
  repository = getSharedProjectRepository()
): Promise<ProjectRouteResponse> {
  const parsed = parseSaveProjectBody(body);
  if (!parsed.ok) {
    return {
      status: 400,
      body: { error: parsed.error }
    };
  }

  const { project, userId } = parsed.body;
  let saved: { id: string };
  let storageProvider: "database" | "memory_fallback" = "database";
  try {
    saved = await repository.saveProject({
      id: project.item.id,
      userId,
      platform: project.pack.platform,
      title: project.item.title,
      analysis: project.analysis,
      pack: project.pack,
      uploads: project.uploads
    });
  } catch {
    saved = await fallbackRepository.saveProject({
      id: project.item.id,
      userId,
      platform: project.pack.platform,
      title: project.item.title,
      analysis: project.analysis,
      pack: project.pack,
      uploads: project.uploads
    });
    storageProvider = "memory_fallback";
  }

  return {
    status: 200,
    body: {
      project: {
        ...project,
        item: {
          ...project.item,
          id: saved.id,
          updatedAtLabel: "刚刚"
        }
      },
      storageProvider
    }
  };
}

export async function handleListProjectsRequest(
  userId: string | undefined,
  repository = getSharedProjectRepository()
): Promise<ProjectListRouteResponse> {
  if (!userId || userId.trim().length === 0) {
    return {
      status: 400,
      body: { error: "invalid_user_id" }
    };
  }

  let records: SavedProjectRecord[];
  let storageProvider: "database" | "memory_fallback" = "database";
  try {
    records = await repository.listProjects(userId.trim());
  } catch {
    records = await fallbackRepository.listProjects(userId.trim());
    storageProvider = "memory_fallback";
  }

  return {
    status: 200,
    body: {
      projects: records.map(projectRecordToSavedProject),
      storageProvider
    }
  };
}

function getSharedProjectRepository() {
  sharedRepository ??= createProjectRepository(createServerIntegrationConfig());
  return sharedRepository;
}

function parseSaveProjectBody(value: unknown):
  | {
      ok: true;
      body: {
        userId: string;
        project: SavedProject;
      };
    }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "invalid_body" };
  }

  const record = value as Record<string, unknown>;
  if (typeof record.userId !== "string" || record.userId.trim().length === 0) {
    return { ok: false, error: "invalid_user_id" };
  }

  if (!isSavedProject(record.project)) {
    return { ok: false, error: "invalid_project" };
  }

  return {
    ok: true,
    body: {
      userId: record.userId.trim(),
      project: record.project
    }
  };
}

function isSavedProject(value: unknown): value is SavedProject {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return isHistoryItem(record.item) && isPublishPack(record.pack) && isProductAnalysis(record.analysis) && Array.isArray(record.uploads);
}

function isHistoryItem(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    isPlatform(record.platform) &&
    typeof record.platformLabel === "string" &&
    typeof record.styleLabel === "string" &&
    typeof record.assetSummary === "string" &&
    typeof record.coverCanvasId === "string" &&
    typeof record.updatedAtLabel === "string"
  );
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

function isProductAnalysis(value: unknown): value is ProductAnalysis {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.productName === "string" && typeof record.productType === "string" && typeof record.category === "string";
}

function isPlatform(value: unknown): value is Platform {
  return value === "xianyu" || value === "xiaohongshu" || value === "shop_main" || value === "wechat";
}

function projectRecordToSavedProject(record: SavedProjectRecord): SavedProject {
  return {
    item: {
      id: record.id,
      title: record.title,
      platform: record.platform,
      platformLabel: getPlatformLabel(record.platform),
      styleLabel: record.pack.title,
      assetSummary: `${record.pack.canvases.length} 张画布 / ${record.uploads.length} 张原图`,
      coverCanvasId: record.pack.canvases[0]?.id ?? "cover",
      updatedAtLabel: "刚刚"
    },
    pack: record.pack,
    analysis: record.analysis,
    uploads: record.uploads
  };
}

function getPlatformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    xianyu: "闲鱼卖货",
    xiaohongshu: "小红书种草",
    shop_main: "商品主图",
    wechat: "朋友圈小店"
  };

  return labels[platform];
}
