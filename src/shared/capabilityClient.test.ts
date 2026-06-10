import { describe, expect, it, vi } from "vitest";

import { getCapabilitiesForApp } from "./capabilityClient";

describe("capability client", () => {
  it("loads capability items from the API endpoint", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        generatedAt: "2026-06-10T00:00:00.000Z",
        items: [
          {
            id: "text_edit",
            label: "AI 对话编辑",
            status: "configured",
            detail: "OpenAI-compatible text model configured."
          }
        ]
      })
    }));

    const result = await getCapabilitiesForApp({
      endpoint: "https://api.example.test/api/capabilities",
      fetcher
    });

    expect(result.source).toBe("remote");
    expect(result.items[0].id).toBe("text_edit");
  });

  it("returns local placeholder items when no endpoint is configured", async () => {
    const result = await getCapabilitiesForApp({
      endpoint: ""
    });

    expect(result.source).toBe("local");
    expect(result.items.map((item) => item.id)).toContain("api");
    expect(result.items.find((item) => item.id === "api")?.status).toBe("mock");
  });
});
