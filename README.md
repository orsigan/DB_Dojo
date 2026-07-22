# DB Dojo

Interactive practice platform for PostgreSQL — SQL, permissions, indexes and PL/pgSQL.
Offline-first PWA. The point is **doing**, not lecturing: short "why" hints are welcome, long theory is not.

- **Offline by default:** PostgreSQL runs in the browser via [PGlite](https://pglite.dev) (WASM).
- **Hybrid ready:** the same `DatabaseEngine` port can talk to a real backend for exercises
  that need true role/permission enforcement.
- **Cross-platform:** installable PWA today; the same codebase can later ship via Capacitor
  (iOS/Android) and Tauri (desktop) without a rewrite.
- **Modular exercises:** every exercise is its own package with its own UI

## Quick start

```bash
npm install
npm run dev        # starts the web app (apps/web)
```

Then open the printed URL. The first load initialises PostgreSQL (WASM) in your browser.

Useful scripts (run from the repo root):

```bash
npm run build          # production build of the PWA
npm run preview        # preview the production build
npm run typecheck      # type-check packages + web app
npm run check          # Biome lint + format check
npm run server:dev     # run the hybrid backend scaffold (apps/server)
```

For the hybrid path (`VITE_DB_ENGINE=remote`), start a local Postgres first with
`docker compose up -d` (matches `DATABASE_URL` in `.env.example`), then run `npm run server:dev`.

## Workspace layout

```
packages/
  core/             Framework-free domain: entities, ports (interfaces), use-cases
  infrastructure/   Adapters for the ports: PGlite, remote backend, persistence, telemetry
  exercise-kit/     The contract every exercise builds against + reusable UI building blocks
  exercises/
    sql-orders-per-customer/          an exercise package (default UI)
    permissions-analyst-read-access/  an exercise package (its own UI)
apps/
  web/              The React PWA shell (sidebar + location bar + exercise host)
  server/           Hybrid backend scaffold (mirrors the RemoteEngine contract)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the layering rules and a step-by-step guide to
authoring a new exercise as its own library.

## Status

This is a **fast-needed solution for exam practices**, not a finished product. It runs end to end (open an exercise, run SQL,
submit, see a verdict, read session statistics), and it deliberately leaves clear extension points:

- Persistence is in-memory (`InMemoryProgressRepository`) / browser storage -> swap in an IndexedDB adapter for
  durable offline progress.
- The backend (`apps/server`) is just implemented in a very bare minimum way and not safe
- exercise's could be wrong in terms of content
