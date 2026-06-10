import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";

import { type Platform, type ProductAnalysis, type PublishPack, type UploadedAsset } from "../shared/productPipeline";
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
  id?: string;
  userId?: string;
  platform: Platform;
  title: string;
  analysis: ProductAnalysis;
  pack: PublishPack;
  uploads: UploadedAsset[];
};

export type SavedProjectRecord = SavedProjectInput & {
  id: string;
  updatedAt: string;
};

export type ProjectRepository = {
  recordGenerationJob(input: GenerationJobInput): Promise<{ id: string }>;
  saveProject(input: SavedProjectInput): Promise<{ id: string }>;
  listProjects(userId: string): Promise<SavedProjectRecord[]>;
  close(): Promise<void>;
};

export function createProjectRepository(config: ServerIntegrationConfig): ProjectRepository {
  if (!config.databaseUrl) {
    return createMemoryProjectRepository();
  }

  const pool = new Pool({
    connectionString: config.databaseUrl,
    max: 4,
    connectionTimeoutMillis: 2500,
    query_timeout: 5000
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
      const id = input.id ?? randomUUID();
      await withClient(pool, async (client) => {
        await client.query(
          [
            'INSERT INTO "Project"',
            '("id","userId","platform","title","analysis","pack","uploads")',
            "VALUES ($1,$2,$3,$4,$5,$6,$7)",
            'ON CONFLICT ("id") DO UPDATE SET',
            '"userId" = EXCLUDED."userId",',
            '"platform" = EXCLUDED."platform",',
            '"title" = EXCLUDED."title",',
            '"analysis" = EXCLUDED."analysis",',
            '"pack" = EXCLUDED."pack",',
            '"uploads" = EXCLUDED."uploads",',
            '"updatedAt" = now()'
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

    async listProjects(userId) {
      return await withClient(pool, async (client) => {
        const result = await client.query(
          [
            'SELECT "id","userId","platform","title","analysis","pack","uploads","updatedAt"',
            'FROM "Project"',
            'WHERE "userId" = $1',
            'ORDER BY "updatedAt" DESC',
            "LIMIT 50"
          ].join(" "),
          [userId]
        );

        return result.rows.map((row) => ({
          id: row.id,
          userId: row.userId ?? undefined,
          platform: row.platform,
          title: row.title,
          analysis: row.analysis,
          pack: row.pack,
          uploads: row.uploads,
          updatedAt: new Date(row.updatedAt).toISOString()
        }));
      });
    },

    async close() {
      await pool.end();
    }
  };
}

export function createMemoryProjectRepository(): ProjectRepository {
  const jobs = new Map<string, GenerationJobInput>();
  const projects = new Map<string, SavedProjectRecord>();

  return {
    async recordGenerationJob(input) {
      const id = randomUUID();
      jobs.set(id, input);
      return { id };
    },
    async saveProject(input) {
      const id = input.id ?? randomUUID();
      projects.set(id, {
        ...input,
        id,
        updatedAt: new Date().toISOString()
      });
      return { id };
    },
    async listProjects(userId) {
      return [...projects.values()]
        .filter((project) => project.userId === userId)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .slice(0, 50);
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
