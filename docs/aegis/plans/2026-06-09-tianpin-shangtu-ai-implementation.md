# 甜拼商图 AI Implementation Plan

## Goal

Implement the first runnable demo slice for the approved PRD: a mobile-oriented Expo app that demonstrates the seller image assistant flow from scenario selection to product diagnosis, publish pack selection, AI-assisted editing, and export-ready output.

## Architecture

- `src/shared/` owns typed product data, canvas state, mock AI generation, and edit command application.
- `src/screens/` owns the user-visible Expo screens.
- `src/App.tsx` owns lightweight navigation state for the demo.
- `src/__tests__/` verifies the core product pipeline before UI work.

## Tech Stack

- Expo + React Native + TypeScript
- Vitest for shared logic tests
- Local mock AI pipeline first; API adapters later

## Baseline/Authority Refs

- `outputs/tianpin-shangtu-ai-prd.md`
- `docs/aegis/specs/2026-06-09-tianpin-shangtu-ai-design.md`

## Compatibility Boundary

- API keys must not be placed in the mobile app.
- The first demo must run without external AI services through mock fallback.
- The core AI contract remains `ProductAnalysis -> PublishPack -> EditCommand`.
- Image generation is auxiliary; editable canvas state is the source of truth.

## Verification

- `npm test -- --run`
- `npm run typecheck`
- `npm run lint`
- `npm run web` for manual browser/mobile-web verification

## Atomic Tasks

1. Create the Expo/Vitest project shell and shared types.
2. Write failing tests for mock product analysis, publish pack generation, and edit command application.
3. Implement the mock AI pipeline and canvas edit reducer.
4. Build the Expo screen flow: Home, Upload, Diagnosis, Pack Select, Editor, Export.
5. Polish the UI to avoid generic AI-template styling.
6. Run automated verification and start the dev server.

## Risks

- React Native Skia is intentionally deferred from the first thin slice if setup friction blocks the runnable demo; canvas state and layout are structured so Skia can replace the preview renderer.
- Real image upload/export is simulated in P0 if native permissions slow the loop; the UI and data model keep the correct shape for `expo-image-picker` and storage upload.
- External APIs are not required for the first verified demo.

