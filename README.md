# One Day Less

Stop checking your bank balance. Start checking your life balance.

## Purpose

**One Day Less** is a small reminder that every day you live is one day less in your lifetime balance. With a very minimal interface, large numbers, and a live countdown, the app shows you how many days you have already lived and how many days are left (based on your birthday and target age), nudging you to ask: *Did I really live this day well?*

## Tech stack & architecture

- Monorepo: `pnpm + Turborepo`
- Shared core:
  - `packages/core`: lifespan domain models and calculations (birthday, target age, days lived, days left, life progress, etc.)
  - `packages/storage`: unified `StoragePort` interface with adapters for IndexedDB / AsyncStorage / WeChat Mini Program storage
- Apps:
  - `apps/web`: Next.js + Tailwind (main experience: Onboarding / Home / Settings, with i18n support)
  - `apps/extension`: Chrome extension (React + Manifest v3, compact Home in popup)
  - `apps/mobile`: React Native (Expo) app
  - `apps/wechat-mp`: Taro + React WeChat Mini Program

## Getting started

Install dependencies (pnpm recommended):

```bash
pnpm install
```

Start Web (Next.js, local port 3000+):

```bash
pnpm dev:web
```

Start Chrome extension dev (load built output into the browser manually):

```bash
pnpm dev:extension
```

Start mobile app (Expo; requires Expo CLI / Expo Go app):

```bash
pnpm dev:mobile
```

Start WeChat Mini Program (Taro; requires Taro CLI and WeChat DevTools):

```bash
pnpm dev:wechat-mp
```

Build all apps:

```bash
pnpm build
```

