#!/usr/bin/env bash
set -Eeuo pipefail

CERT_PATH="/etc/letsencrypt/live/app/privkey.pem"
[[ -s "$CERT_PATH" ]] || { printf 'TLS private key not found: %s\n' "$CERT_PATH" >&2; exit 1; }

docker run --rm --user 0:0 \
  --volume /etc/letsencrypt:/etc/letsencrypt:rw \
  --entrypoint sh nginxinc/nginx-unprivileged:alpine -ec \
  'chgrp 11001 /etc/letsencrypt/live/app/privkey.pem && chmod 640 /etc/letsencrypt/live/app/privkey.pem'
