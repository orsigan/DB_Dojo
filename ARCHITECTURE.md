# Architecture

DB Dojo uses a **ports & adapters** (hexagonal) layout. The goal is isolation: the domain does not
know about React, PGlite, or the network, so any of those can change without touching the core.

## The dependency rule

Dependencies point inwards only:

```
exercises ─┐
apps/web ──┼─▶ exercise-kit ─┐
apps/server┘                 ├─▶ core   ◀── infrastructure
                             │
              (react)  ──────┘
```

- **`core`** depends on nothing (no frameworks, no browser APIs). A Biome rule enforces this.
- **`infrastructure`** implements `core`'s ports (PGlite, remote, persistence, telemetry).
- **`exercise-kit`** depends on `core` + React and defines the exercise contract and UI blocks.
- **`exercises/*`** depend on `core` + `exercise-kit` only.
- **`apps/web`** wires everything together in its composition root.

## Key ports (interfaces in `core`)

| Port                 | Meaning                                        | Adapter(s) in `infrastructure`                 |
| -------------------- | ---------------------------------------------- | ---------------------------------------------- |
| `DatabaseEngine`     | Run SQL / seed / reset                         | `PgliteEngine` (offline), `RemoteEngine` (hybrid) |
| `ExerciseRepository` | Read the exercise catalogue                    | `StaticExerciseRepository`                      |
| `ProgressRepository` | Store attempts                                 | `InMemoryProgressRepository`                    |
| `TelemetrySink`      | Collect events for monitoring/statistics       | `InMemoryTelemetry`                             |
| `Clock` / `IdGenerator` / `Logger` | Injected system services         | `SystemClock`, `CryptoIdGenerator`, `ConsoleLogger` |

Error handling avoids scattered `try/catch`: functions return `Result<Value>` (a success/failure
value), and callers branch once at the edge (the UI).

## Offline vs. hybrid

`createEngine({ kind })` picks the adapter. `pglite` runs Postgres in the browser (offline).
`remote` sends the same operations to `apps/server`. Switching is a one-line config change
(`VITE_DB_ENGINE`) — no caller changes, because everything goes through the `DatabaseEngine` port.

## How an exercise is hosted

1. The web app's registry lists the installed exercise packages.
2. The shell shows them in the sidebar and renders the selected one.
3. Before rendering, the host seeds the sandbox with the exercise's `seedSql`.
4. The host hands the exercise a small `ExerciseHostApi` (`runSql`, `submit`, `reset`).
   The exercise never touches the database or infrastructure directly.

## Authoring an exercise (as its own library)

An exercise is a standalone package. It can live in this repo under `packages/exercises/`, or in a
completely separate GitHub repo that depends on the published `@db-dojo/core` and
`@db-dojo/exercise-kit`.

**1. `package.json`**

```json
{
  "name": "@you/db-dojo-exercise-my-topic",
  "type": "module",
  "main": "./src/index.ts",
  "dependencies": { "@db-dojo/core": "^0.1.0", "@db-dojo/exercise-kit": "^0.1.0" },
  "peerDependencies": { "react": ">=18" }
}
```

**2. `src/definition.ts`** — pure data (no UI):

```ts
import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'my-topic-first',
  topic: ['sql'],
  difficulty: 'Beginner',
  title: 'My first exercise',
  prompt: 'Describe the task here.',
  seedSql: 'CREATE TABLE demo (id int);',
  hints: [{ text: 'A short why-hint is welcome.' }],
  grading: { kind: 'assertions', checks: [{ label: 'demo exists', sql: "SELECT to_regclass('demo') IS NOT NULL AS ok;" }] },
  tags: []
};
```

**3. `src/index.ts`** — export the module. Use the default UI:

```ts
import { defineExercise } from '@db-dojo/exercise-kit';
import { definition } from './definition';

export default defineExercise({ definition });
```

…or ship your own UI:

```ts
import { defineExercise } from '@db-dojo/exercise-kit';
import { definition } from './definition';
import { ExerciseView } from './ExerciseView'; // reuses <ExerciseScaffold/> or builds its own

export default defineExercise({ definition, View: ExerciseView });
```

**4. Register it** in `apps/web/src/app/exercise-registry.ts`:

```ts
import myTopic from '@you/db-dojo-exercise-my-topic';
export const exerciseModules = [/* … */, myTopic];
```

The sidebar automatically builds a nested folder tree from every registered exercise's
`topic` path — `['sql']` files under a top-level "SQL" folder, `['sql', 'select']` under a
"SELECT" sub-folder inside it, and so on. No central list of folders to edit: an exercise's
`topic` path is all a plugin needs to declare its place in the tree, and folders that don't
exist yet are created automatically.

**5. (optional) Folder metadata.** An unregistered topic path still renders fine — it falls
back to a title-cased version of the last path segment. For a nicer label, ordering among
siblings, or a short summary shown in the Library, add an entry to
`apps/web/src/app/topics.ts` keyed by the topic path joined with `/` (e.g. `'sql/select'`).

### Grading strategies

- `result-equals` — compares the result of the user's query against a reference query
  (`expectedSql`). Set `ordered: true` for `ORDER BY` tasks.
- `assertions` — runs the user's SQL, then a list of checks. Each check is SQL returning a single
  row `{ ok: boolean }`. Ideal for indexes (inspect `pg_indexes`), permissions
  (`has_table_privilege`), and PL/pgSQL (call the function and compare).

## How navigation modes work

The shell has no hardcoded router. Instead, `apps/web/src/app/modes/registry.ts` lists a static
array of `ModeDefinition`s (home, guided path, free mode, library, knowledge graph, exercise,
stats) — the same static-plugin-array idiom used for exercises. Each mode owns its own path parsing/building
(`parsePath`/`buildPath`), its own top-level component, and whether it appears in the sidebar nav.

`apps/web/src/app/use-url-view.ts` syncs the active `View` to `window.location.pathname` via
`history.pushState`/`popstate` — no router library, consistent with this app's existing
hand-rolled-hooks style (see `useLocalStorageState`). `AppShell` looks up the active mode by
`view.kind` and renders `mode.Component({ view, navigate })`; adding a new mode is one new file
implementing `ModeDefinition` plus one entry in the registry array — no changes to `AppShell`.

The **Guided Path** walks an authored curriculum tree (`apps/web/src/app/curriculum.ts`), separate
from the exercise-derived topic tree used by the **Library**. Curriculum chapters can nest
arbitrarily deep and exist even with zero exercises (rendered as a "coming soon" panel).

## Dependencies between chapters and folders

A chapter declares what it builds on itself, next to its own definition — no central dependency
list. Curriculum chapters use `requires: ['other-chapter-id']` in `curriculum.ts`; Library folders
use `requires: ['sql/select']` in `topics.ts` (topic keys). A dependency may point at any other
chapter, including one in a different branch.

Dependencies are **advisory**: the graph views draw the edge and mark a node whose prerequisites
still have unsolved challenges, but nothing is ever locked — every chapter and exercise stays
reachable. A prerequisite that carries no challenges yet ("coming soon") never blocks what follows
it, otherwise an empty chapter would block its branch forever.

## The dependency graph

Three surfaces render the same graph — the Library, a Guided Path chapter page, and the
**Knowledge Graph** mode — so the pieces are split by responsibility:

| Module                       | Responsibility                                                      |
| ---------------------------- | ------------------------------------------------------------------- |
| `app/graph/model.ts`         | `GraphNode` — the shape all three surfaces are reduced to            |
| `app/graph/sources.ts`       | Curriculum tree / topic tree / one chapter → `GraphNode[]`           |
| `app/graph/layout.ts`        | Pure layered layout: visible set, edges, layers, positions, SVG paths |
| `shell/graph/DependencyGraph.tsx` | Renders a layout; owns expand/collapse and pan/zoom             |

`layoutGraph()` is pure and does all the geometry, so the renderer never computes a coordinate.
Both containment (parent → child) and prerequisite (dependency → dependent) edges push a node down
one layer, which means every edge points downwards and a node always sits below everything it
needs. Two details worth knowing:

- **Collapsed subtrees.** A prerequisite hidden inside a collapsed parent re-attaches its edge to
  that parent, so collapsing never silently drops a dependency.
- **Scope.** A chapter page shows one branch, so a dependency on a sibling branch has nowhere to
  land. `sources.ts` splits those out into `externalPrerequisites`, rendered as a "needs …"
  caption instead of vanishing.

Authoring mistakes are contained rather than fatal: a `requires` cycle is broken by a `visiting`
guard during layering instead of recursing forever, and a `requires` id that matches nothing is
ignored.

Expand/collapse state persists per surface in `localStorage`, and `shell/graph/use-pan-zoom.ts`
is shared by the dependency graph and the Guided Path's snake map so both behave identically.

## Difficulty

`Difficulty` (`Beginner` / `Advanced` / `Profi` / `Ultra`) is part of the `Exercise` domain type.
`Ultra` sits above the exam-relevant range: it is reserved for challenges that go beyond what a
database lecture covers, so the lower three stay calibrated against the course. The colours
live as `--difficulty-*` tokens in `global.css` next to the other design tokens — light and dark —
and `app/difficulty.ts` maps a difficulty to its CSS modifier and sort rank. `DifficultyBadge`
renders the pill, `DifficultyDot` the dot alone for the sidebar. **Free Mode** filters the
challenge pool by difficulty, top-level topic and solved state, and picks its random suggestion
from whatever the filters left.

Progress (`Attempt` records) persists in `localStorage` via `LocalStorageProgressRepository`, an
adapter for the same `ProgressRepository` port `InMemoryProgressRepository` implements — swapping
one for the other in `composition-root.ts` is the only change persistence required. Weakness/
progress analytics are computed by the pure `analyzeProgress()` use-case in `core`, reused by both
the Guided Path (per-chapter progress) and the Statistics view (per-topic/difficulty breakdowns).
