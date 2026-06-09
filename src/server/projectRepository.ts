import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";

import { type ServerIntegrationConfig } from "./env";

export type GenerationJobInput = {
  userId?: string;
  type: "analysis" | "edit" | "image_generation" | "background_removal";
  provider: string;
  status: "queued" | "completed" | "failed";
  input: unknown;
  output?: unknown;
  fallbackReason?: string;
};

export type SavedProjectInput = {
  userId?: string;
  platform: string;
  title: string;
  analysis: unknown;
  pack: unknown;
  uploads: unknown;
};

export type ProjectRepository = {
  recordGenerationJob(input: GenerationJobInput): Promise<{ id: string }>;
  saveProject(input: SavedProjectInput): Promise<{ id: string }>;
  close(): Promise<void>;
};

export function createProjectRepository(config: ServerIntegrationConfig): ProjectRepository {
  if (!config.databaseUrl) {
    return createMemoryProjectRepository();
  }

  const pool = new Pool({
    connectionString: config.databaseUrl,
    max: 4
  });

  return createPgProjectRepository(pool);
}

export function createPgProjectRepository(pool: Pool): ProjectRepository {
  return {
    async recordGenerationJob(input) {
      const id = randomUUID();
      await withClient(pool, async (client) => {
        await client.query(
          [
            'INSERT INTO "GenerationJob"',
            '("id","userId","type","provider","status","input","output","fallbackReason")',
            "VALUES ($1,$2,$3,$4,$5,$6,$7,$8)"
          ].join(" "),
          [
            id,
            input.userId ?? null,
            input.type,
            input.provider,
            input.status,
            JSON.stringify(input.input),
            input.output === undefined ? null : JSON.stringify(input.output),
            input.fallbackReason ?? null
          ]
        );
      });
      return { id };
    },

    async saveProject(input) {
      const id = randomUUID();
      await withClient(pool, async (client) => {
        await client.query(
          [
            'INSERT INTO "Project"',
            '("id","userId","platform","title","analysis","pack","uploads")',
            "VALUES ($1,$2,$3,$4,$5,$6,$7)"
          ].join(" "),
          [
            id,
            input.userId ?? null,
            input.platform,
            input.title,
            JSON.stringify(input.analysis),
            JSON.stringify(input.pack),
            JSON.stringify(input.uploads)
          ]
        );
      });
      return { id };
    },

    async close() {
      await pool.end();
    }
  };
}

function createMemoryProjectRepository(): ProjectRepository {
  const jobs = new Map<string, GenerationJobInput>();
  const projects = new Map<string, SavedProjectInput>();

  return {
    async recordGenerationJob(input) {
      const id = randomUUID();
      jobs.set(id, input);
      return { id };
    },
    async saveProject(input) {
      const id = randomUUID();
      projects.set(id, input);
      return { id };
    },
    async close() {
      jobs.clear();
      projects.clear();
    }
  };
}

async function withClient<T>(pool: Pool, work: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    return await work(client);
  } finally {
    client.release();
  }
}
