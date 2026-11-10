#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/lib/compose.sh"
configure_compose "$APP_DIR"

BACKUP_DIR="${1:-$APP_DIR/backups}"
if [[ "$BACKUP_DIR" != /* ]]; then BACKUP_DIR="$APP_DIR/$BACKUP_DIR"; fi
mkdir -p -- "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/bus-trip-$(date -u +%Y%m%dT%H%M%SZ)-$$.sql.gz"
TEMP_FILE="$(mktemp "$BACKUP_DIR/.bus-trip-backup.XXXXXX")"
trap 'rm -f -- "$TEMP_FILE"' EXIT

compose exec -T database sh -c \
  'pg_dump --no-owner --no-acl -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip -c > "$TEMP_FILE"
gzip -t -- "$TEMP_FILE"
mv -- "$TEMP_FILE" "$BACKUP_FILE"
trap - EXIT
sha256sum -- "$BACKUP_FILE" > "$BACKUP_FILE.sha256"
chmod 600 "$BACKUP_FILE" "$BACKUP_FILE.sha256"
printf 'Backup created: %s\n' "$BACKUP_FILE"
printf 'SHA-256: %s\n' "$(cut -d ' ' -f 1 "$BACKUP_FILE.sha256")"
