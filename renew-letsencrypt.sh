#!/usr/bin/env bash
set -euo pipefail

# Runs Let's Encrypt renewal inside the certbot container and reloads nginx if anything changed.
# Intended to be executed on the host via cron/systemd.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${PROJECT_DIR:-/root/undocapital}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"

cd "$PROJECT_DIR"

# If COMPOSE_FILE is absolute, use it as-is; otherwise resolve relative to PROJECT_DIR
if [[ "$COMPOSE_FILE" = /* ]]; then
  COMPOSE_PATH="$COMPOSE_FILE"
else
  COMPOSE_PATH="$PROJECT_DIR/$COMPOSE_FILE"
fi

COMPOSE=(docker compose -f "$COMPOSE_PATH")

# Renew certificates (no-op if not due)
"${COMPOSE[@]}" run --rm certbot renew --webroot -w /var/www/certbot

# Reload nginx to pick up renewed certs (prefer graceful reload)
if "${COMPOSE[@]}" exec -T nginx nginx -s reload; then
  exit 0
fi

# Fallback: send HUP
"${COMPOSE[@]}" kill -s HUP nginx
