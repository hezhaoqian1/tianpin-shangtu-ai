# Integration Setup

This repo now has code boundaries for the next product services. Most providers can stay in `mock` mode until credentials are ready.

## 1. Railway Postgres

Purpose:

- Persist users, uploaded assets, saved projects, and generation jobs.

Code:

- `prisma/schema.prisma`
- `prisma/migrations/0001_initial/migration.sql`
- `src/server/projectRepository.ts`
- `src/server/projectRoute.ts`
- `src/shared/projectClient.ts`

API:

```text
POST /api/projects
GET /api/projects?userId=seller-id
```

`POST /api/projects` saves the current export package for a logged-in seller. The app keeps a local copy first, then syncs this endpoint when `EXPO_PUBLIC_PROJECTS_ENDPOINT` is configured.

Request:

```json
{
  "userId": "seller-id",
  "project": {
    "item": {},
    "pack": {},
    "analysis": {},
    "uploads": []
  }
}
```

`GET /api/projects?userId=...` returns the seller's latest 50 projects as restorable app projects. If `DATABASE_URL` is missing or temporarily unavailable, the API uses an in-memory fallback and marks the response as `storageProvider: "memory_fallback"` so the endpoint can still be smoke-tested on Railway. Fallback projects will not survive a service restart.

Variables:

```env
DATABASE_URL=postgresql://...
```

Commands:

```bash
npm run db:generate
npm run db:migrate
```

The service currently has a memory fallback when `DATABASE_URL` is missing.

## 2. Cloudflare R2 or S3-compatible Storage

Purpose:

- Store user-uploaded product images and generated images.
- Return public URLs that the model router can pass as `input_image`.

Code:

- `src/server/storage.ts`
- `src/server/uploadRoute.ts`
- `src/shared/uploadClient.ts`
- `src/shared/remoteUploadClient.ts`

API:

```text
POST /api/uploads/presign
```

Request:

```json
{
  "fileName": "product.jpg",
  "contentType": "image/jpeg",
  "ownerId": "seller-id"
}
```

App flow:

```text
ImagePicker asset
  -> createUploadIntentForApp
  -> PUT file/blob to uploadUrl
  -> write publicUrl into UploadedAsset.remoteUrl
  -> analyzeUploadsForApp sends remoteUrl to /api/analyze
```

Variables:

```env
STORAGE_PROVIDER=s3
STORAGE_BUCKET=
STORAGE_REGION=auto
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_PUBLIC_BASE_URL=
```

For Cloudflare R2, `STORAGE_ENDPOINT` is usually:

```text
https://<account-id>.r2.cloudflarestorage.com
```

## 3. OpenAI-compatible Text/Vision Analysis

Purpose:

- Understand real uploaded product images.
- Return `ProductAnalysis`.
- Generate publish copy and edit commands.

Code:

- `src/server/modelRouter.ts`
- `src/server/analyzeRoute.ts`
- `src/server/editRoute.ts`

Variables:

```env
MODEL_PROVIDER=openai
OPENAI_BASE_URL=https://api.apexpoc.com/v1
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

When an upload includes `remoteUrl`, `modelRouter` adds it as OpenAI `input_image` content. If the gateway only supports `/chat/completions`, add a separate provider branch before relying on vision calls.

## 4. GPT Image 2 / Image Generation

Purpose:

- Generate seller cover images.
- Generate clean backgrounds.
- Generate lifestyle scenes.

Code:

- `src/server/imageGeneration.ts`
- `src/server/imageRoute.ts`

API:

```text
POST /api/images/generate
```

Request:

```json
{
  "mode": "seller_cover",
  "prompt": "真实闲鱼风封面，保留成色和瑕疵",
  "productImageUrl": "https://pub-...r2.dev/uploads/seller/2026-06-10/photo.jpg",
  "size": "1024x1024",
  "ownerId": "seller-demo"
}
```

When storage is configured, the route uploads GPT Image output back to the configured S3/R2 bucket under `generated/{ownerId}/{date}/...png` and returns a persistent `imageUrl`. The mobile app uses that URL as an `UploadedAsset`, replaces the current cover canvas with it, and keeps it when saving the project.

For the mobile app, prefer the async job API so long GPT Image requests do not block the editor screen:

```text
POST /api/images/jobs
GET /api/images/jobs/{jobId}
```

`POST /api/images/jobs` accepts the same request body as `/api/images/generate` and immediately returns:

```json
{
  "jobId": "img_job_...",
  "status": "queued"
}
```

The app polls `GET /api/images/jobs/{jobId}` until the job reaches `succeeded` or `failed`. On success, `result.imageUrl` contains the persisted R2 image URL.

The editor currently creates three cover variants as separate jobs:

- Xianyu authentic resale cover.
- Clean product main image.
- Xiaohongshu lifestyle seeding cover.

Each completed image is displayed as a selectable card. The seller chooses one with "set as cover"; generation results that were not selected remain available in the editor until the current project is reset.

Variables:

```env
OPENAI_IMAGE_MODEL=gpt-image-2
```

This route uses the same `OPENAI_BASE_URL` and `OPENAI_API_KEY` as the model router. Without a key it returns a mock image result so UI development can continue.

## 5. Background Removal

Purpose:

- Remove product backgrounds for clean product cards.

Code:

- `src/server/backgroundRemoval.ts`
- `src/server/imageRoute.ts`

API:

```text
POST /api/images/remove-background
```

Choose one provider:

```env
BACKGROUND_REMOVAL_PROVIDER=removebg
REMOVEBG_API_KEY=
```

or:

```env
BACKGROUND_REMOVAL_PROVIDER=photoroom
PHOTOROOM_API_KEY=
```

Default:

```env
BACKGROUND_REMOVAL_PROVIDER=mock
```

## 6. Export Bundle Manifest

Purpose:

- Turn the current publish pack into a platform-ready export manifest.
- Give the app a concrete file list, publish copy, and checklist before the user leaves for Xianyu/Xiaohongshu/shop tools.

Code:

- `src/shared/exportBundle.ts`
- `src/shared/exportClient.ts`
- `src/server/exportRoute.ts`

API:

```text
POST /api/exports/prepare
```

Request:

```json
{
  "pack": {},
  "session": {}
}
```

Response:

```json
{
  "manifest": {
    "exportId": "export_...",
    "platformLabel": "闲鱼卖货",
    "summary": "2 张图片 / 3 个标题 / 4 个标签",
    "files": [],
    "publishCopy": "...",
    "checklist": []
  }
}
```

Expo variable:

```env
EXPO_PUBLIC_EXPORT_ENDPOINT=https://your-service.up.railway.app/api/exports/prepare
```

## 7. Capability Status

Purpose:

- Show which production capabilities are ready, configured, still mock, or waiting for configuration.
- Help the Account tab and deployment smoke tests catch missing providers without exposing secrets.

Code:

- `src/server/capabilityRoute.ts`
- `src/shared/capabilityClient.ts`
- `src/screens/AccountScreen.tsx`

API:

```text
GET /api/capabilities
```

Response:

```json
{
  "generatedAt": "2026-06-10T00:00:00.000Z",
  "items": [
    {
      "id": "text_edit",
      "label": "AI 对话编辑",
      "status": "configured",
      "detail": "OpenAI-compatible / gpt-5-mini"
    }
  ]
}
```

The response never includes API keys, storage credentials, or raw secret values.

Expo variable:

```env
EXPO_PUBLIC_CAPABILITIES_ENDPOINT=https://your-service.up.railway.app/api/capabilities
```

## 8. Server Image Processing

Purpose:

- Compress uploads before analysis.
- Create thumbnails.
- Normalize image format and size.
- Render publish canvases to PNG on the server.

Code:

- `src/server/imageProcessing.ts`
- `src/server/canvasRenderer.ts`

Dependency:

```text
sharp
```

This is ready for the next step where uploads are proxied through the API instead of direct-to-storage presigned upload.

## 7. Mobile Canvas / Skia

`@shopify/react-native-skia` is the likely mobile canvas dependency when we need high-performance on-device rendering and export. It is not installed yet because the latest package requires `react-native-reanimated` as a peer dependency, which changes the Expo native surface.

Current decision:

- P0: use the existing React Native preview canvas plus server-side `sharp` rendering.
- P1: add Skia together with `react-native-reanimated` when mobile export quality becomes the blocker.

## 8. Expo Public Endpoints

Expo receives only public API URLs:

```env
EXPO_PUBLIC_ANALYZE_ENDPOINT=https://your-service.up.railway.app/api/analyze
EXPO_PUBLIC_EDIT_ENDPOINT=https://your-service.up.railway.app/api/edit
EXPO_PUBLIC_UPLOAD_ENDPOINT=https://your-service.up.railway.app/api/uploads/presign
EXPO_PUBLIC_IMAGE_GENERATE_ENDPOINT=https://your-service.up.railway.app/api/images/generate
EXPO_PUBLIC_REMOVE_BACKGROUND_ENDPOINT=https://your-service.up.railway.app/api/images/remove-background
```

Never put provider API keys in Expo variables.
