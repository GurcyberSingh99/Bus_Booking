#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${1:?Usage: deploy.sh /path/to/app}"
cd "$APP_DIR"
APP_DIR="$(pwd)"
source "$APP_DIR/scripts/lib/compose.sh"
configure_compose "$APP_DIR"
APP_DOMAIN="$(read_env_value APP_DOMAIN)"
CERTBOT_EMAIL="$(read_env_value CERTBOT_EMAIL)"
[[ "$APP_DOMAIN" =~ ^[A-Za-z0-9.-]+$ ]] || { printf 'Set a valid APP_DOMAIN in .env.production.\n' >&2; exit 2; }
[[ "$CERTBOT_EMAIL" =~ ^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$ ]] || { printf 'Set a valid CERTBOT_EMAIL in .env.production.\n' >&2; exit 2; }
trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT

compose pull
compose up -d database backend frontend

if [[ ! -s /etc/letsencrypt/live/app/fullchain.pem ]]; then
  docker run --rm -p 80:80 \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/lib/letsencrypt:/var/lib/letsencrypt \
    certbot/certbot:latest certonly --standalone --non-interactive \
    --agree-tos --keep-until-expiring --no-eff-email \
    --cert-name app --domain "$APP_DOMAIN" --email "$CERTBOT_EMAIL"
fi

"$APP_DIR/scripts/prepare-cert-permissions.sh"
compose up -d nginx
curl --fail --silent --show-error --retry 20 --retry-connrefused --retry-delay 3 \
  --resolve "$APP_DOMAIN:443:127.0.0.1" "https://$APP_DOMAIN/ready"
printf '\nDeployment is healthy at https://%s\n' "$APP_DOMAIN"
