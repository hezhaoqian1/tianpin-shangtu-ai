# AI Model Router

The mobile app must never contain provider API keys. All real model calls should go through a server boundary that imports `src/server/modelRouter.ts`.

## Providers

```text
mock
  No network calls. Uses deterministic local diagnosis for stable demos.

openai
  Calls ${OPENAI_BASE_URL}/responses
  Uses server-side OPENAI_API_KEY
  Sends remote upload URLs as input_image content when available.
  Expects structured JSON matching ProductAnalysis.

grok
  Calls https://api.x.ai/v1/chat/completions
  Uses server-side XAI_API_KEY
  Expects json_schema response_format matching ProductAnalysis.
```

## Environment

Copy `.env.example` into the server runtime environment. For a local mock run:

```text
MODEL_PROVIDER=mock
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
XAI_API_KEY=
XAI_MODEL=grok-4.1-fast
```

For Railway with an OpenAI-compatible gateway:

```text
MODEL_PROVIDER=openai
OPENAI_BASE_URL=https://api.apexpoc.com/v1
OPENAI_API_KEY=replace-with-rotated-server-key
OPENAI_MODEL=gpt-5-mini
API_HOST=0.0.0.0
```

The gateway must support the Responses-style route:

```text
POST ${OPENAI_BASE_URL}/responses
```

If the gateway only supports `/chat/completions`, this router needs a separate API-style branch before real calls will work.

Keep `MODEL_PROVIDER=mock` when network, model names, or keys are not confirmed. The app still demonstrates the full product flow because the editable canvas state is the source of truth.

## Uploaded Images

`UploadedAsset` supports optional `remoteUrl` and `mimeType` fields. The intended production path is:

```text
Expo image picker
  -> POST /api/uploads/presign
  -> PUT image to R2/S3
  -> pass public remoteUrl into /api/analyze
  -> modelRouter sends remoteUrl as input_image
```

Without `remoteUrl`, the router still sends text metadata so the product flow remains usable in mock and local demos.

## Integration Shape

Local development API:

```bash
npm run api
```

Railway should use `npm run api` as the service start command. The API server
listens on Railway's injected `PORT` first, then falls back to local `API_PORT`.
The repo also includes `railway.toml` with `startCommand = "npm run api"` and
`healthcheckPath = "/health"`.

Then point the mobile app at it:

```text
EXPO_PUBLIC_ANALYZE_ENDPOINT=http://localhost:3001/api/analyze
EXPO_PUBLIC_EDIT_ENDPOINT=http://localhost:3001/api/edit
```

For deployed Railway:

```text
EXPO_PUBLIC_ANALYZE_ENDPOINT=https://your-service.up.railway.app/api/analyze
EXPO_PUBLIC_EDIT_ENDPOINT=https://your-service.up.railway.app/api/edit
EXPO_PUBLIC_UPLOAD_ENDPOINT=https://your-service.up.railway.app/api/uploads/presign
EXPO_PUBLIC_IMAGE_GENERATE_ENDPOINT=https://your-service.up.railway.app/api/images/generate
EXPO_PUBLIC_REMOVE_BACKGROUND_ENDPOINT=https://your-service.up.railway.app/api/images/remove-background
```

Core route adapter:

```ts
const result = await analyzeProductWithModel({
  uploads,
  platform,
  config: createModelRouterConfig()
});
```

Return `result.analysis` to the mobile app, then generate publish packs through the existing `createPublishPacks` pipeline.

## Safety Boundary

- No provider API key in Expo code.
- No real key in `.env.example`, README, tests, screenshots, or commits.
- Missing keys automatically fall back to `mock`.
- Request failures automatically fall back to `mock`.
- Product diagnosis must preserve truthfulness warnings and avoid hiding flaws.

## Troubleshooting

- `npm ci` fails on Railway with missing `@emnapi/*`: regenerate `package-lock.json` with `npx npm@10.8.2 install --package-lock-only`, then verify with `npx npm@10.8.2 ci`.
- Railway uses Node 18: this repo pins Node 20 through `.nvmrc` and `package.json` `engines.node`; if needed, set `NIXPACKS_NODE_VERSION=20`.
- API deploys but health check fails: confirm `tsx` is in `dependencies`, `railway.toml` points to `npm run api`, and `/health` returns `{"ok":true}` locally.
