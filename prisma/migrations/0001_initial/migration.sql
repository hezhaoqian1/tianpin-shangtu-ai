CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE,
  "phone" TEXT UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "UploadAsset" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "storageKey" TEXT NOT NULL UNIQUE,
  "publicUrl" TEXT,
  "contentType" TEXT NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "byteLength" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "platform" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "analysis" JSONB NOT NULL,
  "pack" JSONB NOT NULL,
  "uploads" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "GenerationJob" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "output" JSONB,
  "fallbackReason" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "UploadAsset_userId_createdAt_idx" ON "UploadAsset" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Project_userId_updatedAt_idx" ON "Project" ("userId", "updatedAt" DESC);
CREATE INDEX IF NOT EXISTS "GenerationJob_userId_createdAt_idx" ON "GenerationJob" ("userId", "createdAt" DESC);
