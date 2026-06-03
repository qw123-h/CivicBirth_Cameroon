#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"
backend_dir="$root_dir/backend"
frontend_dir="$root_dir/frontend"

cleanup() {
  if [[ -n "${backend_pid:-}" ]]; then
    kill "$backend_pid" 2>/dev/null || true
  fi
  if [[ -n "${frontend_pid:-}" ]]; then
    kill "$frontend_pid" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

if systemctl is-active --quiet postgresql; then
  echo "✓ PostgreSQL is already active"
else
  sudo systemctl start postgresql
fi

cd "$backend_dir"
npm run db:deploy
npm run db:seed

cd "$root_dir"
(cd "$backend_dir" && npm run dev) &
backend_pid=$!
(cd "$frontend_dir" && npm run dev) &
frontend_pid=$!

wait "$backend_pid" "$frontend_pid"