#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${1:?Usage: renew-certificate.sh /path/to/app}"
cd "$APP_DIR"
APP_DIR="$(pwd)"
source "$APP_DIR/scripts/lib/compose.sh"
configure_compose "$APP_DIR"

compose stop nginx
restart_proxy() {
  status=$?
  trap - EXIT
  if [[ -s /etc/letsencrypt/live/app/privkey.pem ]]; then
    "$APP_DIR/scripts/prepare-cert-permissions.sh" || status=1
  fi
  compose up -d nginx || status=1
  exit "$status"
}
trap restart_proxy EXIT

docker run --rm -p 80:80 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  certbot/certbot:latest renew --standalone --quiet
