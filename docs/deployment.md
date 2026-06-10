# Deployment Guide

This project deploys as two surfaces:

1. Railway runs the server API.
2. Expo runs the mobile app and calls the Railway API.

The model provider key belongs only on Railway. Expo only receives public API endpoint URLs.

## Railway Service

Railway reads `railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run api"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

The API server listens on `process.env.PORT` first, then local `API_PORT`.

## Railway Variables

Required for real OpenAI-compatible calls:

```env
MODEL_PROVIDER=openai
OPENAI_BASE_URL=https://api.apexpoc.com/v1
OPENAI_API_KEY=replace-with-rotated-server-key
OPENAI_MODEL=gpt-5-mini
OPENAI_IMAGE_MODEL=gpt-image-2
API_HOST=0.0.0.0
```

Optional fallback if Railway/Nixpacks still selects Node 18:

```env
NIXPACKS_NODE_VERSION=22
```

Optional xAI/Grok provider:

```env
XAI_API_KEY=
XAI_MODEL=grok-4.1-fast
```

Optional Railway Postgres:

```env
DATABASE_URL=postgresql://...
```

Optional S3-compatible storage, such as Cloudflare R2:

```env
STORAGE_PROVIDER=s3
STORAGE_BUCKET=
STORAGE_REGION=auto
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_PUBLIC_BASE_URL=
```

Optional background removal:

```env
BACKGROUND_REMOVAL_PROVIDER=mock
REMOVEBG_API_KEY=
PHOTOROOM_API_KEY=
```

Do not configure `EXPO_PUBLIC_*` variables on the Railway API service unless you are also building the frontend there. They are frontend variables.

## Expo App Variables

After Railway deploys, copy its public domain and create a local `.env`:

```env
EXPO_PUBLIC_ANALYZE_ENDPOINT=https://your-service.up.railway.app/api/analyze
EXPO_PUBLIC_EDIT_ENDPOINT=https://your-service.up.railway.app/api/edit
EXPO_PUBLIC_UPLOAD_ENDPOINT=https://your-service.up.railway.app/api/uploads/presign
EXPO_PUBLIC_IMAGE_GENERATE_ENDPOINT=https://your-service.up.railway.app/api/images/generate
EXPO_PUBLIC_REMOVE_BACKGROUND_ENDPOINT=https://your-service.up.railway.app/api/images/remove-background
EXPO_PUBLIC_PROJECTS_ENDPOINT=https://your-service.up.railway.app/api/projects
EXPO_PUBLIC_EXPORT_ENDPOINT=https://your-service.up.railway.app/api/exports/prepare
```

For local API development:

```env
EXPO_PUBLIC_ANALYZE_ENDPOINT=http://localhost:3001/api/analyze
EXPO_PUBLIC_EDIT_ENDPOINT=http://localhost:3001/api/edit
EXPO_PUBLIC_UPLOAD_ENDPOINT=http://localhost:3001/api/uploads/presign
EXPO_PUBLIC_IMAGE_GENERATE_ENDPOINT=http://localhost:3001/api/images/generate
EXPO_PUBLIC_REMOVE_BACKGROUND_ENDPOINT=http://localhost:3001/api/images/remove-background
EXPO_PUBLIC_PROJECTS_ENDPOINT=http://localhost:3001/api/projects
EXPO_PUBLIC_EXPORT_ENDPOINT=http://localhost:3001/api/exports/prepare
```

For real-device testing, replace `localhost` with the computer's LAN IP.

## Health Check

Railway health check:

```text
GET /health
```

Expected response:

```json
{"ok":true}
```

## Common Railway Failures

### `npm ci` says package-lock is not in sync

Use the same npm generation path as Railway:

```bash
npx npm@10.8.2 install --package-lock-only
npx npm@10.8.2 ci
```

Commit the changed `package-lock.json`.

### Node engine warnings

Expo 54 / React Native 0.81 expects Node 20.19.4 or newer. This repo pins Node 22 through:

- `.nvmrc`
- `package.json` `engines.node`

If Railway still uses Node 18, add:

```env
NIXPACKS_NODE_VERSION=22
```

### API starts locally but fails on Railway

Make sure `tsx` stays in `dependencies`, not only `devDependencies`. Railway production installs may omit dev dependencies.

### Docker warning about `OPENAI_API_KEY`

Railway/Nixpacks may show a Docker warning because the variable name is sensitive. The fix is not to write secrets into Dockerfile or source files. Keep the value only in Railway Variables and rotate keys that were pasted into chat or logs.

## Release Checklist

Before redeploying:

```bash
npm run typecheck
npm test -- --run
npm run lint
```

Before exposing to users:

- Rotate any key that has been pasted into chat, logs, screenshots, or commits.
- Confirm `OPENAI_BASE_URL` supports the `/v1/responses` endpoint.
- Confirm `/health` is green on Railway.
- Point Expo `EXPO_PUBLIC_ANALYZE_ENDPOINT` and `EXPO_PUBLIC_EDIT_ENDPOINT` to the deployed Railway service.
- Keep optional providers in `mock` mode until their keys are ready.
