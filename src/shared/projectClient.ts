import { type UserSession, getLoginPromptCopy } from "./session";
import { type SavedProject } from "./workspace";

export type ProjectClientFetcher = (
  url: string,
  init: {
    method: "GET" | "POST";
    headers: Record<string, string>;
    body?: string;
  }
) => Promise<{
  ok: boolean;
  json: () => Promise<unknown>;
}>;

export type SaveProjectForAppResult =
  | {
      status: "saved";
      project: SavedProject;
    }
  | {
      status: "local_only";
      project: SavedProject;
    }
  | {
      status: "remote_failed";
      project: SavedProject;
    }
  | {
      status: "login_required";
      prompt: ReturnType<typeof getLoginPromptCopy>;
    };

export type ListProjectsForAppResult =
  | {
      status: "loaded";
      projects: SavedProject[];
    }
  | {
      status: "missing_endpoint" | "remote_failed" | "login_required";
      projects: SavedProject[];
    };

export async function saveProjectForApp({
  endpoint,
  session,
  project,
  fetcher = fetch as ProjectClientFetcher
}: {
  endpoint?: string;
  session: UserSession;
  project: SavedProject;
  fetcher?: ProjectClientFetcher;
}): Promise<SaveProjectForAppResult> {
  if (session.kind === "guest") {
    return {
      status: "login_required",
      prompt: getLoginPromptCopy("save_history")
    };
  }

  if (!endpoint) {
    return {
      status: "local_only",
      project
    };
  }

  try {
    const response = await fetcher(normalizeProjectEndpoint(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: session.id,
        project
      })
    });

    if (!response.ok) {
      return {
        status: "remote_failed",
        project
      };
    }

    const body = asRecord(await response.json());
    const remoteProject = asSavedProject(body.project);

    return {
      status: "saved",
      project: remoteProject ?? project
    };
  } catch {
    return {
      status: "remote_failed",
      project
    };
  }
}

export async function listProjectsForApp({
  endpoint,
  session,
  fetcher = fetch as ProjectClientFetcher
}: {
  endpoint?: string;
  session: UserSession;
  fetcher?: ProjectClientFetcher;
}): Promise<ListProjectsForAppResult> {
  if (session.kind === "guest") {
    return {
      status: "login_required",
      projects: []
    };
  }

  if (!endpoint) {
    return {
      status: "missing_endpoint",
      projects: []
    };
  }

  try {
    const response = await fetcher(`${normalizeProjectEndpoint(endpoint)}?userId=${encodeURIComponent(session.id)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return {
        status: "remote_failed",
        projects: []
      };
    }

    const body = asRecord(await response.json());
    const projects = Array.isArray(body.projects) ? body.projects.map(asSavedProject).filter(isSavedProject) : [];

    return {
      status: "loaded",
      projects
    };
  } catch {
    return {
      status: "remote_failed",
      projects: []
    };
  }
}

function normalizeProjectEndpoint(endpoint: string) {
  return endpoint.replace(/\/+$/, "");
}

function asSavedProject(value: unknown): SavedProject | undefined {
  if (!isSavedProject(value)) {
    return undefined;
  }

  return value;
}

function isSavedProject(value: unknown): value is SavedProject {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return Boolean(record.item) && Boolean(record.pack) && Boolean(record.analysis) && Array.isArray(record.uploads);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
