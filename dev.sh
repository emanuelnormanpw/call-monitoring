#!/usr/bin/env bash
# Run the backend (cargo run) and the frontend (yarn dev) together from the
# repository root.
#
#   ./dev.sh              start everything (brings up Postgres via docker compose if needed)
#   ./dev.sh --no-db      skip the Postgres check and bootstrap
#   ./dev.sh --help

set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_PORT=5432
BE_PORT=3000
FE_PORT=3001
SKIP_DB=0

for arg in "$@"; do
  case "$arg" in
    --no-db) SKIP_DB=1 ;;
    # Print the header block above: from line 2 up to the first blank line, so
    # this keeps working when lines are added or removed.
    -h|--help) sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $arg (try --help)" >&2; exit 2 ;;
  esac
done

# Colours only when stdout is a terminal, so piped output stays clean.
if [ -t 1 ]; then
  C_BE=$'\033[36m'; C_FE=$'\033[35m'; C_SYS=$'\033[32m'; C_ERR=$'\033[31m'; C_OFF=$'\033[0m'
else
  C_BE=''; C_FE=''; C_SYS=''; C_ERR=''; C_OFF=''
fi

say()  { echo "${C_SYS}[dev]${C_OFF} $*"; }
fail() { echo "${C_ERR}[dev]${C_OFF} $*" >&2; exit 1; }

port_open() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

# ---------- preflight ----------
command -v cargo >/dev/null 2>&1 || fail "cargo is not on PATH."
command -v yarn  >/dev/null 2>&1 || fail "yarn is not on PATH."

port_open "$BE_PORT" && fail "Port $BE_PORT is already in use (backend). Stop that process first."
port_open "$FE_PORT" && fail "Port $FE_PORT is already in use (frontend). Stop that process first."

if [ ! -d "$ROOT/frontend/node_modules" ]; then
  say "frontend/node_modules is missing - running yarn install..."
  (cd "$ROOT/frontend" && yarn install --frozen-lockfile) || fail "yarn install failed."
fi

if [ "$SKIP_DB" -eq 0 ] && ! port_open "$DB_PORT"; then
  command -v docker >/dev/null 2>&1 || fail "Postgres is not listening on port $DB_PORT and docker is unavailable. Start the database yourself, or pass --no-db."
  say "Postgres is not running - starting the 'postgres' service with docker compose..."
  (cd "$ROOT" && docker compose up -d postgres) || fail "docker compose up -d postgres failed."
  say "Waiting for Postgres to accept connections..."
  for _ in $(seq 1 60); do
    port_open "$DB_PORT" && break
    sleep 1
  done
  port_open "$DB_PORT" || fail "Postgres was not ready after 60 seconds. Check: docker compose logs postgres"
  say "Postgres is ready on port $DB_PORT."
fi

# ---------- run both sides ----------
# Job control gives each background job its own process group, so a single
# kill can take down the job together with the children it spawned.
set -m

BE_PID=""
FE_PID=""

cleanup() {
  trap - INT TERM EXIT
  echo
  say "Stopping backend and frontend..."
  for pid in "$BE_PID" "$FE_PID"; do
    [ -n "$pid" ] || continue
    # Negative pid targets the whole process group: cargo also spawns the
    # compiled binary, and yarn spawns vite.
    kill -TERM "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  say "Done."
  exit 0
}
trap cleanup INT TERM EXIT

(
  cd "$ROOT/backend" || exit 1
  cargo run 2>&1 | awk -v p="${C_BE}[backend]${C_OFF} " '{ print p $0; fflush() }'
) &
BE_PID=$!

(
  cd "$ROOT/frontend" || exit 1
  yarn dev 2>&1 | awk -v p="${C_FE}[frontend]${C_OFF} " '{ print p $0; fflush() }'
) &
FE_PID=$!

say "backend  -> http://localhost:$BE_PORT/api/calls"
say "frontend -> http://localhost:$FE_PORT"
say "Press Ctrl+C to stop both."

# If either side exits on its own, take the other down too rather than
# leaving half a stack running.
while true; do
  kill -0 "$BE_PID" 2>/dev/null || { say "Backend exited."; break; }
  kill -0 "$FE_PID" 2>/dev/null || { say "Frontend exited."; break; }
  sleep 1
done
