#!/usr/bin/env bash
set -euo pipefail

# Initial Let's Encrypt certificate issuance for this docker-compose stack.
# Uses webroot challenge shared with nginx.

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

# Space-separated domains, e.g.: "api.getcoachops.com www.api.getcoachops.com"
DOMAINS_STR="${DOMAINS:-undocapital-dev.vladdizlaw.com}"
EMAIL="${EMAIL:-vladdizlaw@gmail.com}"
RSA_KEY_SIZE="${RSA_KEY_SIZE:-4096}"
STAGING="${STAGING:-0}"  # set to 1 to use LE staging

cd "$PROJECT_DIR"

DATA_PATH="$PROJECT_DIR/data/certbot"
LIVE_DOMAIN="$(echo "$DOMAINS_STR" | awk '{print $1}')"

mkdir -p "$DATA_PATH/conf" "$DATA_PATH/www"

echo "### Ensuring dummy cert exists for $LIVE_DOMAIN (to start nginx)"
"${COMPOSE[@]}" run --rm --entrypoint "sh -c \"\
  set -e; \
  path=/etc/letsencrypt/live/$LIVE_DOMAIN; \
  mkdir -p \\\"\\\$path\\\"; \
  if [ ! -f \\\"\\\$path/fullchain.pem\\\" ] || [ ! -f \\\"\\\$path/privkey.pem\\\" ]; then \
    openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1 \
      -keyout \\\"\\\$path/privkey.pem\\\" \
      -out \\\"\\\$path/fullchain.pem\\\" \
      -subj \\\"/CN=localhost\\\"; \
  fi\" " certbot

echo "### Starting nginx (must serve /.well-known/acme-challenge/ over HTTP)"
# Start nginx only; it can run even if API is down.
"${COMPOSE[@]}" up -d --build --no-deps nginx

# Build -d args
DOMAIN_ARGS=""
for d in $DOMAINS_STR; do
  DOMAIN_ARGS+=" -d $d"
done

EMAIL_ARG=""
if [ -n "$EMAIL" ]; then
  EMAIL_ARG="--email $EMAIL"
else
  EMAIL_ARG="--register-unsafely-without-email"
fi

STAGING_ARG=""
if [ "$STAGING" != "0" ]; then
  STAGING_ARG="--staging"
fi

echo "### Requesting Let's Encrypt certificate for: $DOMAINS_STR"
"${COMPOSE[@]}" run --rm certbot certonly --webroot -w /var/www/certbot \
  $STAGING_ARG \
  $EMAIL_ARG \
  $DOMAIN_ARGS \
  --rsa-key-size "$RSA_KEY_SIZE" \
  --agree-tos \
  --force-renewal

echo "### Reloading nginx"
"${COMPOSE[@]}" exec -T nginx nginx -s reload

echo "### Done"
