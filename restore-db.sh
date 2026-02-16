#!/usr/bin/env bash
set -euo pipefail

# PostgreSQL database restore script
# Restores from a compressed SQL dump file

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

# Check if backup file is provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  echo ""
  echo "Available backups:"
  BACKUP_DIR="${BACKUP_DIR:-./data/backups}"
  if [ -d "$BACKUP_DIR" ]; then
    ls -lh "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | tail -5 || echo "No backups found"
  else
    echo "Backup directory not found: $BACKUP_DIR"
  fi
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "### WARNING: This will replace the current database!"
echo "Backup file: $BACKUP_FILE"
echo "Database: ${DB_NAME:-undocapital}"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Restore cancelled"
  exit 0
fi

echo "### Starting database restore..."

# Detect if running in Swarm mode
# Check if Swarm is initialized and active
SWARM_STATE=$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null || echo "inactive")
if [ "$SWARM_STATE" = "active" ]; then
  # Swarm mode: use docker service exec
  DB_SERVICE="${DB_SERVICE:-undocapital_db}"
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
  
  gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql \
    -U "$DB_USER" \
    -d "$DB_NAME"
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
  
  gunzip -c "$BACKUP_FILE" | "${COMPOSE[@]}" exec -T db psql \
    -U "$DB_USER" \
    -d "$DB_NAME"
fi

if [ $? -eq 0 ]; then
  echo "### Restore completed successfully"
  exit 0
else
  echo "### Restore failed!"
  exit 1
fi
