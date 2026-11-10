#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${1:?Usage: renew-certificate.sh /path/to/app}"
cd "$APP_DIR"
APP_DIR="$(pwd)"
source "$APP_DIR/scripts/lib/compose.sh"
configure_compose "$APP_DIR"

compose stop nginx
restart_proxy() { compose up -d nginx; }
trap restart_proxy EXIT

docker run --rm -p 80:80 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  certbot/certbot:latest renew --standalone --quiet
