# Integration Setup

This repo now has code boundaries for the next product services. Most providers can stay in `mock` mode until credentials are ready.

## 1. Railway Postgres

Purpose:

- Persist users, uploaded assets, saved projects, and generation jobs.

Code:

- `prisma/schema.prisma`
- `prisma/migrations/0001_initial/migration.sql`
- `src/server/projectRepository.ts`

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

## 6. Server Image Processing

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
