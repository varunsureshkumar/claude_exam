# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UIGen** — an AI-powered React component generator with live preview. Users describe components in chat; Claude generates JSX/TSX files into a virtual file system; a sandboxed iframe renders the result in real time.

The application lives in `UI_Generator/`. All commands below assume that as the working directory.

## Commands

```bash
# First-time setup (install deps + generate Prisma client + run migrations)
npm run setup

# Development server (Turbopack)
npm run dev

# Build
npm run build

# Lint
npm run lint

# Run all tests (Vitest + jsdom)
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Database
npx prisma migrate dev        # apply new migrations
npm run db:reset               # reset DB (destructive)
```

The app needs `ANTHROPIC_API_KEY` in `UI_Generator/.env` (or at the repo root in `.env`). Without it the app runs with a `MockLanguageModel` that returns canned static components.

## Architecture

### Request / AI flow

1. **`src/app/api/chat/route.ts`** — the only API route. Receives `{ messages, files, projectId }`, reconstructs a `VirtualFileSystem` from the serialized `files` payload, calls `streamText` (Vercel AI SDK) with two tools, and pipes a data stream back to the client. On finish it persists `messages` + `files` to the `Project` row (authenticated users only).

2. **`src/lib/provider.ts`** — returns either the real `anthropic("claude-haiku-4-5")` model or a `MockLanguageModel` when `ANTHROPIC_API_KEY` is absent.

3. **Two AI tools** exposed to the model:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create / view / str_replace / insert operations on the virtual FS.
   - `file_manager` (`src/lib/tools/file-manager.ts`) — rename / delete operations.

### Virtual file system

`src/lib/file-system.ts` — `VirtualFileSystem` class. All generated code lives in memory (no disk writes). Serialised to/from plain JSON for storage in the `Project.data` SQLite column and for transport in API payloads.

`src/lib/contexts/file-system-context.tsx` — React context that wraps `VirtualFileSystem`, exposes CRUD helpers, and provides a `handleToolCall` dispatcher so streaming tool-call events from the chat directly mutate the in-memory FS and trigger re-renders.

### Preview pipeline

`src/lib/transform/jsx-transformer.ts`:
- `transformJSX` — compiles JSX/TSX to plain JS via `@babel/standalone` in the browser.
- `createImportMap` — builds an ES module import map; local files become `Blob` URLs, unknown third-party packages are proxied through `esm.sh`.
- `createPreviewHTML` — produces a self-contained HTML document (with Tailwind CDN + `importmap`) rendered inside `PreviewFrame`'s `<iframe>`.

`src/components/preview/PreviewFrame.tsx` — rerenders the iframe whenever the virtual FS changes.

### Auth

Custom JWT auth (`src/lib/auth.ts`): sessions stored as an `httpOnly` cookie (`auth-token`), signed with `jose`. `src/middleware.ts` reads the cookie for protected routes. Passwords hashed with `bcrypt`.

### Data model (Prisma / SQLite)

```
User      { id, email, password, createdAt, updatedAt }
Project   { id, name, userId?, messages (JSON string), data (JSON string), createdAt, updatedAt }
```

`Project.messages` stores the full Vercel AI SDK message array. `Project.data` stores the serialised `VirtualFileSystem` node map. Anonymous users can use the app but projects are not persisted.

### Routing

- `/` — home; authenticated users are immediately redirected to their latest project (or a newly created one).
- `/[projectId]` — the main editor UI for a specific project.

### Key contexts

- `FileSystemContext` — virtual FS state + tool-call handler (file-system-context.tsx).
- `ChatContext` — chat message state and streaming logic (chat-context.tsx).

Both contexts are provided in `src/app/main-content.tsx` which is the client-side shell for the whole editor layout.
