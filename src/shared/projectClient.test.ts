import { describe, expect, it, vi } from "vitest";

import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "./productPipeline";
import { saveProjectForApp } from "./projectClient";
import { createDemoUserSession, createGuestSession } from "./session";
import { createSavedProjectFromPack } from "./workspace";

describe("project client", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);
  const session = createDemoUserSession();
  const saved = createSavedProjectFromPack({ session, pack, analysis, uploads });

  if (saved.status !== "saved") {
    throw new Error("expected fixture to produce a saved project");
  }

  it("posts a logged-in seller project to the cloud workspace endpoint", async () => {
    const fetcher = vi.fn(async (_url: string, init: { body?: string }) => ({
      ok: true,
      json: async () => ({
        ...JSON.parse(init.body ?? "{}"),
        storageProvider: "database"
      })
    }));

    const result = await saveProjectForApp({
      endpoint: "https://api.example.test/api/projects",
      session,
      project: saved.project,
      fetcher
    });

    expect(result.status).toBe("saved");
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.test/api/projects",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
    );
    const body = JSON.parse(fetcher.mock.calls[0][1].body ?? "{}");
    expect(body.userId).toBe(session.id);
    expect(body.project.item.id).toBe(saved.project.item.id);
  });

  it("keeps saving local when the endpoint is not configured", async () => {
    const result = await saveProjectForApp({
      endpoint: "",
      session,
      project: saved.project
    });

    expect(result.status).toBe("local_only");
    if (result.status !== "local_only") {
      throw new Error("expected local-only save");
    }
    expect(result.project.item.id).toBe(saved.project.item.id);
  });

  it("keeps the login gate for guests", async () => {
    const result = await saveProjectForApp({
      endpoint: "https://api.example.test/api/projects",
      session: createGuestSession(),
      project: saved.project
    });

    expect(result.status).toBe("login_required");
  });
});
