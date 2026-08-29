# Call Monitoring

A supervisor dashboard for reviewing customer call sentiment. Call records are
stored in PostgreSQL and served through a REST API; the dashboard lists them
with search, a period filter, a sentiment filter, sortable columns and
pagination.

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Backend  | Rust, Axum 0.7, SQLx 0.8, Tokio                                   |
| Database | PostgreSQL 16                                                     |
| Frontend | React 19, Vite 6, TypeScript, TanStack Query & Table, Tailwind 4  |
| Tests    | `cargo test` (backend), Vitest + React Testing Library (frontend) |

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |
| Database | `localhost:5432`      |

---

## Quick Start with Docker

The shortest path from nothing to a running app. Docker is the only tool you
need to install — no Rust, Node or PostgreSQL required.

### Step 1 — Install Docker

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), which
bundles Docker Compose v2. Confirm it is available:

```bash
docker --version
docker compose version
```

### Step 2 — Build and start everything

```bash
docker compose up --build
```

This builds the Rust binary and the frontend bundle, starts PostgreSQL, and
loads `backend/db/schema.sql` followed by `backend/db/seed.sql` automatically.
The first build compiles the whole Rust dependency tree and takes several
minutes; later runs reuse the cache. Wait for `call-mon-frontend` to report
that it has started.

### Step 3 — Open the dashboard

```
http://localhost:5173
```

You should see seven seeded call records, five per page.

### Step 4 — Stop the stack

```bash
docker compose down
```

The database is not stored in a named volume, so this also discards its data.
The next `docker compose up` starts from a freshly seeded database.

---

## Local Development Setup

Use this when you want hot reload and the test runners. The dev server runs on
port **3001**, not 5173.

### Step 1 — Install the toolchain

Run the bundled installer. It sets up whatever is missing and leaves anything
already new enough untouched, so it is safe to re-run:

```bash
./install-toolchain.sh
```

It installs Rust through rustup, Node 20 through nvm, and Yarn 1.x through npm.
**Docker is checked but never installed for you** — it needs administrator
rights, and on macOS it is a GUI application whose licence must be accepted
interactively, so the script prints the right command for your platform instead.

To see what is missing without changing anything:

```bash
./install-toolchain.sh --check   # exits non-zero if something is still needed
```

If you would rather install by hand, these are the requirements:

| Tool    | Version       | Install                                                         |
| ------- | ------------- | --------------------------------------------------------------- |
| Rust    | 1.88 or newer | [rustup.rs](https://rustup.rs) — `Cargo.lock` needs edition2024 |
| Node.js | 20 or newer   | [nodejs.org](https://nodejs.org) or `nvm install 20`            |
| Yarn    | 1.22.x        | `npm install -g yarn` — npm is blocked by `engineStrict`        |
| Docker  | any recent    | only used to run PostgreSQL                                     |

After Rust or Node is installed for the first time, open a new terminal so they
land on your `PATH`, then confirm:

```bash
rustc --version && node --version && yarn --version
```

### Step 2 — Start PostgreSQL

```bash
docker compose up -d postgres
```

This creates the `call_monitoring` database and applies the schema and seed data
on first boot. If you already run PostgreSQL locally, skip this and point
`DATABASE_URL` at your own instance instead.

### Step 3 — Create the frontend environment file

```bash
cp frontend/.env.example frontend/.env
```

The backend needs no `.env`: it falls back to
`postgres://postgres:postgres@localhost:5432/call_monitoring`, which matches the
container from Step 3.

### Step 4 — Install frontend dependencies

```bash
cd frontend && yarn install && cd ..
```

### Step 5 — Start the backend and frontend

```bash
./dev.sh
```

One command runs both. It checks the ports, installs frontend dependencies if
they are missing, starts PostgreSQL when it is not already up, prefixes each
side's output, and shuts both down on a single `Ctrl+C`. Run `./dev.sh --help`
for the available flags.

To run them separately instead, use two terminals:

```bash
cd backend && cargo run      # terminal 1
cd frontend && yarn dev      # terminal 2
```

### Step 6 — Open the dashboard

```
http://localhost:3001
```

---

## Running the Tests

### Backend — 32 unit tests

```bash
cd backend
cargo test
```

No database is required. The filter tests assert the SQL that `QueryBuilder`
produces; everything else is pure functions.

```bash
cargo test query::          # one module
cargo test -- --list        # list test names
```

`cargo test` runs three targets, so two of the three `test result` lines
legitimately report `0 passed` — the lib target holds all the tests.

### Frontend — 24 unit tests

```bash
cd frontend
yarn test                   # single run
yarn test:watch             # watch mode
```

Tests live in a `__test__/` folder next to the code they cover.

---

## Code Quality

```bash
cd backend  && cargo clippy --all-targets && cargo fmt --check
cd frontend && yarn lint && yarn format:check && yarn build
```

---

## Environment Variables

### Backend

| Variable       | Default                                                       | Purpose                                              |
| -------------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/call_monitoring` | PostgreSQL connection string                         |
| `CORS_ORIGINS` | `http://localhost:3001,http://localhost:5173`                 | Comma-separated list of allowed browser origins      |
| `APP_TIMEZONE` | `UTC`                                                         | Zone used for the period filter and timestamp search |

`APP_TIMEZONE` matters: period bounds are local midnights in that zone, and the
timestamp the search matches is rendered in it, so what the table displays is
what a search finds. `docker-compose.yml` sets `Asia/Jakarta`.

### Frontend

See `frontend/.env.example`. `VITE_APP_API_HOST` points at the backend and
defaults to `http://localhost:3000`.

---

## API Reference

### `GET /api/calls`

| Parameter                 | Example                | Notes                                                                      |
| ------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| `search`                  | `Andi`                 | Case-insensitive across every displayed column                             |
| `sentiment`               | `under_70`, `70_above` | Splits at a score of 70                                                    |
| `start_date` / `end_date` | `2026-08-01`           | `YYYY-MM-DD`, inclusive on both ends                                       |
| `tz`                      | `Asia/Jakarta`         | Overrides `APP_TIMEZONE` for this request                                  |
| `sort_by`                 | `cs_name`              | `call_id`, `cs_name`, `customer_name`, `sentiment_score`, `call_timestamp` |
| `sort_dir`                | `asc`, `desc`          | Defaults to `desc`                                                         |
| `page` / `limit`          | `2` / `5`              | `limit` is clamped to 1–100                                                |

```bash
curl "http://localhost:3000/api/calls?search=Andi&sentiment=under_70&sort_by=sentiment_score&sort_dir=asc"
```

```json
{ "data": [ ... ], "total_data": 2, "page": 1, "limit": 5 }
```

Sortable columns come from an allowlist, and every other value is a bound
parameter, so no user input reaches the SQL text.

---

## AI Usage

### Tool

**Claude** (Anthropic), used through Claude Code in the terminal.

### Where AI was used

| Area                   | What AI contributed                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Backend API            | The `GET /api/calls` endpoint: filter composition, the sorting allowlist, pagination, and the accompanying unit tests                |
| Frontend               | **Project structure only** — the module / elements / layouts split, barrel files, and the usecase layer that separates state from UI |
| `docker-compose.yml`   | Service wiring, health check, and the environment variables passed to the backend                                                    |
| `dev.sh`               | Running backend and frontend from a single command, with port checks and a clean shutdown                                            |
| `install-toolchain.sh` | Toolchain bootstrap with version checks and a `--check` dry-run mode                                                                 |

The UI itself — layout, styling, component behaviour, and the wording shown to
users — was written by hand.

### Main prompts

**Backend API**

> Build `GET /api/calls` in Rust with Axum and SQLx over PostgreSQL for a
> call-monitoring table. It has to support, all combinable in one request:
> keyword search across every column the UI displays, a sentiment filter split
> at a score of 70, an inclusive start/end date period filter, sortable columns
> in both directions, and page/limit pagination. Two constraints: the total row
> count must describe the filtered result set, not the whole table, and the sort
> column must not be injectable — it cannot be a bound parameter, so treat that
> explicitly. Keep the WHERE-clause building in one place so the data query and
> the count query can never drift apart. Show me the plan before writing any
> code.

**Frontend project structure**

> Restructure the React + Vite frontend so the dashboard is no longer one large
> `App.tsx`. Follow the conventions in `frontend/agent/project-structure.md`: a
> feature module under `src/components/modules/<feature>` that holds UI only,
> with a `usecase/` folder for state, queries, derived values and data mapping;
> reusable presentational blocks promoted to `src/components/elements` and page
> chrome to `src/components/layouts`; every block in a kebab-case folder whose
> name matches its component one-to-one, with its own `PropsType` in a local
> `types.ts` and an `index.ts` re-export; imports grouped external → alias →
> relative. Propose the folder tree first and do not create any file until I
> approve it.

### How the output was reviewed and verified

Every task went through the same three stages, and nothing was written to disk
before stage 2 was settled.

**1. Implementation plan.** AI was asked for a plan first — which files it would
touch, the shape of the change, and the trade-offs — with no edits permitted at
this stage. This is also where gaps surfaced: reviewing a plan against the user
story is much faster than reviewing a diff.

**2. Decision.** The plan was checked against the acceptance criteria and then
accepted, narrowed, or rejected. Scope was chosen deliberately rather than
taking everything on offer — several suggestions were explicitly declined, and
some were deferred with a reason.

**3. Execution and verification.** Only then was the code written, and every
change had to prove itself by running:

- `cargo test`, `cargo clippy --all-targets`, `cargo fmt --check` for the backend
- `yarn test`, `yarn lint`, `yarn format:check`, `yarn build` for the frontend
- live `curl` calls against a running API to confirm real behaviour, including
  boundary cases such as the inclusive ends of the period filter and an
  injection payload in `sort_by`
- a full `docker compose up --build` from a **fresh clone** of the repository,
  to confirm the committed state actually runs rather than just the working copy

That last check earned its place: it caught a Docker build that failed on a
toolchain version, which had gone unnoticed because the code compiled fine on
the host. The fix was applied and the fresh-clone run repeated until it passed.
