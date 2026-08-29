#!/usr/bin/env bash
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_PORT=5432
BE_PORT=3000
FE_PORT=3001
SKIP_DB=0

for arg in "$@"; do
  case "$arg" in
    --no-db) SKIP_DB=1 ;;
    -h|--help) sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Argumen tidak dikenal: $arg (pakai --help)" >&2; exit 2 ;;
  esac
done

if [ -t 1 ]; then
  C_BE=$'\033[36m'; C_FE=$'\033[35m'; C_SYS=$'\033[32m'; C_ERR=$'\033[31m'; C_OFF=$'\033[0m'
else
  C_BE=''; C_FE=''; C_SYS=''; C_ERR=''; C_OFF=''
fi

say()  { echo "${C_SYS}[dev]${C_OFF} $*"; }
fail() { echo "${C_ERR}[dev]${C_OFF} $*" >&2; exit 1; }

port_open() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

# ---------- preflight ----------
command -v cargo >/dev/null 2>&1 || fail "cargo tidak ditemukan di PATH."
command -v yarn  >/dev/null 2>&1 || fail "yarn tidak ditemukan di PATH."

port_open "$BE_PORT" && fail "Port $BE_PORT sudah dipakai (backend). Matikan dulu prosesnya."
port_open "$FE_PORT" && fail "Port $FE_PORT sudah dipakai (frontend). Matikan dulu prosesnya."

if [ ! -d "$ROOT/frontend/node_modules" ]; then
  say "frontend/node_modules belum ada — menjalankan yarn install..."
  (cd "$ROOT/frontend" && yarn install --frozen-lockfile) || fail "yarn install gagal."
fi

if [ "$SKIP_DB" -eq 0 ] && ! port_open "$DB_PORT"; then
  command -v docker >/dev/null 2>&1 || fail "Postgres di port $DB_PORT tidak aktif dan docker tidak ada. Nyalakan DB manual, atau pakai --no-db."
  say "Postgres belum jalan — menyalakan service 'postgres' via docker compose..."
  (cd "$ROOT" && docker compose up -d postgres) || fail "Gagal menjalankan docker compose up -d postgres."
  say "Menunggu Postgres siap menerima koneksi..."
  for _ in $(seq 1 60); do
    port_open "$DB_PORT" && break
    sleep 1
  done
  port_open "$DB_PORT" || fail "Postgres tidak siap setelah 60 detik. Cek: docker compose logs postgres"
  say "Postgres siap di port $DB_PORT."
fi

set -m

BE_PID=""
FE_PID=""

cleanup() {
  trap - INT TERM EXIT
  echo
  say "Mematikan backend & frontend..."
  for pid in "$BE_PID" "$FE_PID"; do
    [ -n "$pid" ] || continue
    kill -TERM "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  say "Selesai."
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
say "Tekan Ctrl+C untuk menghentikan keduanya."

while true; do
  kill -0 "$BE_PID" 2>/dev/null || { say "Backend berhenti."; break; }
  kill -0 "$FE_PID" 2>/dev/null || { say "Frontend berhenti."; break; }
  sleep 1
done
