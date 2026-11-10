#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="$APP_DIR/.local-certs"
mkdir -p -- "$CERT_DIR"
docker run --rm --user 0:0 \
  --volume "$CERT_DIR:/certs" \
  --entrypoint sh alpine:3.22@sha256:49340b346798875b5592e5d420241f2f9cfba5f47e62ebb1446a1b34734e898f -ec '
    apk add --no-cache openssl >/dev/null
    openssl req -x509 -nodes -days 30 -newkey rsa:2048 \
      -keyout /certs/privkey.pem -out /certs/fullchain.pem \
      -subj "/CN=localhost" \
      -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    chgrp 101 /certs/privkey.pem
    chmod 640 /certs/privkey.pem
    chmod 644 /certs/fullchain.pem
  '
printf 'Local self-signed certificate created under %s\n' "$CERT_DIR"
