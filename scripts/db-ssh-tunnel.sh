#!/usr/bin/env bash
#
# Connect to PostgreSQL via SSH tunnel.
# On the server, run once: sudo ./scripts/restrict-db-port.sh
# This restricts access to 5432 to localhost only (connect via tunnel only).
#
# Usage:
#   ./scripts/db-ssh-tunnel.sh                    # start tunnel, then psql in another terminal
#   ./scripts/db-ssh-tunnel.sh --psql             # start tunnel, run psql, then close tunnel
#
# Environment variables (or arguments):
#   DB_SSH_HOST   - server host (or first argument)
#   DB_SSH_USER   - SSH user (default: root)
#   DB_SSH_PORT   - SSH port (default: 22)
#   DB_LOCAL_PORT - local tunnel port (default: 5432)
#
# Example:
#   DB_SSH_HOST=undocapital-dev.vladdizlaw.com DB_SSH_USER=root ./scripts/db-ssh-tunnel.sh
#   # In another terminal:
#   psql -h localhost -p 5432 -U undo_admin -d UNDO_CAPITAL
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# SSH parameters
DB_SSH_HOST="${DB_SSH_HOST:-}"
DB_SSH_USER="${DB_SSH_USER:-root}"
DB_SSH_PORT="${DB_SSH_PORT:-22}"
DB_LOCAL_PORT="${DB_LOCAL_PORT:-5432}"
RUN_PSQL=""

ARGS=()
for arg in "$@"; do
  case "$arg" in
    --psql) RUN_PSQL=1 ;;
    -h|--help)
      head -30 "$0" | tail -n +3
      exit 0
      ;;
    *) ARGS+=("$arg") ;;
  esac
done

if [[ -n "${ARGS[0]:-}" ]]; then
  DB_SSH_HOST="${ARGS[0]}"
fi

if [[ -z "$DB_SSH_HOST" ]]; then
  echo "Error: specify server host."
  echo ""
  echo "  DB_SSH_HOST=example.com $0"
  echo "  $0 example.com"
  echo ""
  exit 1
fi

echo "SSH tunnel: localhost:${DB_LOCAL_PORT} -> ${DB_SSH_USER}@${DB_SSH_HOST}:5432"
echo ""
echo "Connect to DB:"
echo "  psql -h localhost -p ${DB_LOCAL_PORT} -U undo_admin -d UNDO_CAPITAL"
echo ""
echo "Press Ctrl+C to close the tunnel."
echo ""

if [[ -n "$RUN_PSQL" ]]; then
  ssh -o ExitOnForwardFailure=yes -L "${DB_LOCAL_PORT}:localhost:5432" -p "$DB_SSH_PORT" -N "${DB_SSH_USER}@${DB_SSH_HOST}" &
  SSH_PID=$!
  trap "kill $SSH_PID 2>/dev/null || true" EXIT
  sleep 2
  exec psql -h localhost -p "$DB_LOCAL_PORT" -U undo_admin -d UNDO_CAPITAL "${ARGS[@]:1}"
fi

exec ssh -o ExitOnForwardFailure=yes -L "${DB_LOCAL_PORT}:localhost:5432" -p "$DB_SSH_PORT" "${DB_SSH_USER}@${DB_SSH_HOST}" -N
