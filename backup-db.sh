#!/usr/bin/env bash
set -euo pipefail

# PostgreSQL database backup script
# Creates compressed SQL dump with timestamp and optional retention policy

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${PROJECT_DIR:-$SCRIPT_DIR}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"

# If COMPOSE_FILE is absolute, use it as-is; otherwise resolve relative to PROJECT_DIR
if [[ "$COMPOSE_FILE" = /* ]]; then
  COMPOSE_PATH="$COMPOSE_FILE"
else
  COMPOSE_PATH="$PROJECT_DIR/$COMPOSE_FILE"
fi

COMPOSE=(docker compose -f "$COMPOSE_PATH")

cd "$PROJECT_DIR"

# Backup configuration
BACKUP_DIR="${BACKUP_DIR:-./data/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"  # Keep backups for 7 days by default
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "### Starting database backup..."
echo "Backup file: $BACKUP_FILE"
echo "Database: ${DB_NAME:-undocapital}"
echo "User: ${DB_USER:-undocapital}"

# Load environment variables from .env if available
# Safely parse .env file, ignoring comments and invalid lines
if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  while IFS= read -r line || [ -n "$line" ]; do
    # Trim leading/trailing whitespace
    line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    # Skip lines without = sign
    [[ ! "$line" =~ = ]] && continue
    # Extract key and value
    key="${line%%=*}"
    value="${line#*=}"
    # Remove quotes from value if present
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    # Export the variable
    export "${key}=${value}" 2>/dev/null || true
  done < "$PROJECT_DIR/.env"
  set +a
fi

# Debug: show loaded DB variables (without passwords)
if [ "${DEBUG:-0}" = "1" ]; then
  echo "DEBUG: DB_USER=${DB_USER:-<not set>}"
  echo "DEBUG: DB_NAME=${DB_NAME:-<not set>}"
  echo "DEBUG: DB_HOST=${DB_HOST:-<not set>}"
fi

# Detect if running in Swarm mode
# Check if Swarm is initialized and active
SWARM_STATE=$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null || echo "inactive")
if [ "$SWARM_STATE" = "active" ]; then
  # Swarm mode: use docker service exec
  DB_SERVICE="${DB_SERVICE:-coachops_db}"
  CONTAINER_NAME=$(docker service ps "$DB_SERVICE" --format "{{.Name}}" --filter "desired-state=running" 2>/dev/null | head -1)
  if [ -z "$CONTAINER_NAME" ]; then
    echo "Error: Could not find running container for service $DB_SERVICE"
    exit 1
  fi
  # Try to get DB credentials from container environment if not set
  if [ -z "${DB_USER:-}" ] || [ -z "${DB_NAME:-}" ]; then
    echo "### Attempting to get DB credentials from container..."
    CONTAINER_ENV=$(docker exec "$CONTAINER_NAME" env 2>/dev/null | grep -E "^(POSTGRES_USER|POSTGRES_DB)=" || true)
    if [ -n "$CONTAINER_ENV" ]; then
      eval "$CONTAINER_ENV"
      DB_USER="${DB_USER:-${POSTGRES_USER:-undocapital}}"
      DB_NAME="${DB_NAME:-${POSTGRES_DB:-undocapital}}"
    fi
  fi
  
  # Final fallback to defaults
  DB_USER="${DB_USER:-undocapital}"
  DB_NAME="${DB_NAME:-undocapital}"
  
  docker exec "$CONTAINER_NAME" pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    | gzip > "$BACKUP_FILE"
else
  # Compose mode: use docker compose exec
  # Try to get DB credentials from container environment if not set
  if [ -z "${DB_USER:-}" ] || [ -z "${DB_NAME:-}" ]; then
    echo "### Attempting to get DB credentials from container..."
    CONTAINER_ENV=$("${COMPOSE[@]}" exec -T db env 2>/dev/null | grep -E "^(POSTGRES_USER|POSTGRES_DB)=" || true)
    if [ -n "$CONTAINER_ENV" ]; then
      eval "$CONTAINER_ENV"
      DB_USER="${DB_USER:-${POSTGRES_USER:-undocapital}}"
      DB_NAME="${DB_NAME:-${POSTGRES_DB:-undocapital}}"
    fi
  fi
  
  # Final fallback to defaults
  DB_USER="${DB_USER:-undocapital}"
  DB_NAME="${DB_NAME:-undocapital}"
  
  "${COMPOSE[@]}" exec -T db pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    | gzip > "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "### Backup completed successfully"
  echo "Size: $BACKUP_SIZE"
  echo "File: $BACKUP_FILE"
  
  # Cleanup old backups (keep only last N days)
  if [ "$RETENTION_DAYS" -gt 0 ]; then
    echo "### Cleaning up backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    echo "Cleanup completed"
  fi
  
  exit 0
else
  echo "### Backup failed!"
  rm -f "$BACKUP_FILE"
  exit 1
fi
