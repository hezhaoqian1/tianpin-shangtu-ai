import { describe, expect, it } from "vitest";

import { createMockProductAnalysis, createPublishPacks, createSampleUploads } from "../shared/productPipeline";
import { createDemoUserSession } from "../shared/session";
import { createSavedProjectFromPack } from "../shared/workspace";
import { createMemoryProjectRepository } from "./projectRepository";
import { handleListProjectsRequest, handleSaveProjectRequest } from "./projectRoute";

describe("project route adapter", () => {
  const uploads = createSampleUploads("headphones");
  const analysis = createMockProductAnalysis(uploads, "xianyu");
  const [pack] = createPublishPacks(analysis, uploads);
  const session = createDemoUserSession();
  const saved = createSavedProjectFromPack({ session, pack, analysis, uploads });

  if (saved.status !== "saved") {
    throw new Error("expected fixture to produce a saved project");
  }

  it("saves a project and lists it for the same seller", async () => {
    const repository = createMemoryProjectRepository();

    const saveResponse = await handleSaveProjectRequest(
      {
        userId: session.id,
        project: saved.project
      },
      repository
    );

    expect(saveResponse.status).toBe(200);
    if (saveResponse.status !== 200) {
      throw new Error("expected project save to succeed");
    }
    expect(saveResponse.body.project.item.title).toBe("Sony WH-1000XM5 头戴降噪耳机");

    const listResponse = await handleListProjectsRequest(session.id, repository);

    expect(listResponse.status).toBe(200);
    if (listResponse.status !== 200) {
      throw new Error("expected project list to succeed");
    }
    expect(listResponse.body.projects).toHaveLength(1);
    expect(listResponse.body.projects[0].item.id).toBe(saved.project.item.id);
    expect(listResponse.body.projects[0].pack.id).toBe(pack.id);
    expect(listResponse.body.projects[0].uploads).toHaveLength(4);
  });

  it("rejects malformed project save requests before touching storage", async () => {
    const repository = createMemoryProjectRepository();

    const response = await handleSaveProjectRequest(
      {
        userId: session.id,
        project: {
          item: saved.project.item,
          pack: null,
          analysis,
          uploads
        }
      },
      repository
    );

    expect(response.status).toBe(400);
    if (response.status !== 400) {
      throw new Error("expected validation failure");
    }
    expect(response.body.error).toBe("invalid_project");
  });

  it("returns a storage error instead of hanging when project storage is unavailable", async () => {
    const repository = {
      ...createMemoryProjectRepository(),
      async saveProject() {
        throw new Error("database unavailable");
      },
      async listProjects() {
        throw new Error("database unavailable");
      }
    };

    const saveResponse = await handleSaveProjectRequest(
      {
        userId: session.id,
        project: saved.project
      },
      repository
    );
    const listResponse = await handleListProjectsRequest(session.id, repository);

    expect(saveResponse.status).toBe(400);
    if (saveResponse.status !== 400) {
      throw new Error("expected save storage failure");
    }
    expect(saveResponse.body.error).toBe("project_storage_unavailable");

    expect(listResponse.status).toBe(400);
    if (listResponse.status !== 400) {
      throw new Error("expected list storage failure");
    }
    expect(listResponse.body.error).toBe("project_storage_unavailable");
  });
});
