# Deployment & Integration

## Overview
This project (**susu**) is hosted as a standalone animation playground inside the **neeshsamsi.com** Next.js project.

## Integration Strategy: Iframe
We use a decoupled "Static Build + Iframe" approach. This allows **susu** to remain a pure Vite project while being accessible within the Next.js site structure.

### 1. Build & Sync
The app must be built with a specific base path so assets load correctly from `/experiments/susu/`.

- **Target Path:** `~/repos/neeshsamsi.com/public/experiments/susu/`
- **Next.js Route:** `/experiments/susu`

### 2. Automation
A deployment script is available in `package.json`:

```bash
pnpm run deploy:nextjs
```

This command:
1. Builds the production bundle (`tsc && vite build`).
2. Creates the target directory in the Next.js project.
3. Copies all built files from `dist/` to the Next.js `public/` directory.

### 3. Next.js Page Configuration
The route is handled in `neeshsamsi.com` at `src/app/experiments/susu/page.tsx`. It uses a full-screen iframe with `fixed inset-0` to bypass the root layout and provide an immersive experience.

## Permanent Presets (Vertical Dance)
Since this app is hosted in an iframe, `localStorage` is scoped to the parent site's origin. To save presets permanently:
1. Create a preset in the "Vertical Dance" experiment UI.
2. Open the browser console (F12).
3. Copy the JSON object logged under `--- NEW PRESET CREATED ---`.
4. Paste it into `src/data/presets.json` in this repository.
5. Run `pnpm run deploy:nextjs` to sync the changes.

## Manual Steps (if automation fails)
1. Ensure `vite.config.ts` has `base: '/experiments/susu/'`.
2. Run `pnpm build`.
3. Copy `dist/*` content to `~/repos/neeshsamsi.com/public/experiments/susu/`.
