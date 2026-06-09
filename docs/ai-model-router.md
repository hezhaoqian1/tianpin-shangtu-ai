# AI Model Router

The mobile app must never contain provider API keys. All real model calls should go through a server boundary that imports `src/server/modelRouter.ts`.

## Providers

```text
mock
  No network calls. Uses deterministic local diagnosis for stable demos.

openai
  Calls ${OPENAI_BASE_URL}/responses
  Uses server-side OPENAI_API_KEY
  Expects structured JSON matching ProductAnalysis.

grok
  Calls https://api.x.ai/v1/chat/completions
  Uses server-side XAI_API_KEY
  Expects json_schema response_format matching ProductAnalysis.
```

## Environment

Copy `.env.example` into the server runtime environment:

```text
MODEL_PROVIDER=mock
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
XAI_API_KEY=
XAI_MODEL=grok-4.1-fast
```

For OpenAI-compatible gateways, set `OPENAI_BASE_URL` to the provider's `/v1`
base URL, for example:

```text
OPENAI_BASE_URL=https://api.apexpoc.com/v1
```

For interview demos, keep `MODEL_PROVIDER=mock` unless the network and keys are confirmed. The app still demonstrates the full product flow because the editable canvas state is the source of truth.

## Integration Shape

Local development API:

```bash
npm run api
```

Railway should use `npm run api` as the service start command. The API server
listens on Railway's injected `PORT` first, then falls back to local `API_PORT`.

Then point the mobile app at it:

```text
EXPO_PUBLIC_ANALYZE_ENDPOINT=http://localhost:3001/api/analyze
EXPO_PUBLIC_EDIT_ENDPOINT=http://localhost:3001/api/edit
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
- Missing keys automatically fall back to `mock`.
- Request failures automatically fall back to `mock`.
- Product diagnosis must preserve truthfulness warnings and avoid hiding flaws.
