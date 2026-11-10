#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/lib/compose.sh"
configure_compose "$APP_DIR"

BACKUP_FILE="${1:?Usage: restore-db.sh /path/to/backup.sql.gz new_database_name}"
TARGET_DB="${2:?Usage: restore-db.sh /path/to/backup.sql.gz new_database_name}"
if [[ "$BACKUP_FILE" != /* ]]; then BACKUP_FILE="$APP_DIR/$BACKUP_FILE"; fi
[[ -f "$BACKUP_FILE" ]] || { printf 'Backup file not found: %s\n' "$BACKUP_FILE" >&2; exit 2; }
[[ -f "$BACKUP_FILE.sha256" ]] || { printf 'Backup checksum not found: %s.sha256\n' "$BACKUP_FILE" >&2; exit 2; }
[[ "$TARGET_DB" =~ ^[A-Za-z][A-Za-z0-9_]{0,62}$ ]] || {
  printf 'Target database name must be 1-63 letters, digits or underscores and start with a letter.\n' >&2
  exit 2
}
[[ "$TARGET_DB" != "$POSTGRES_DB" ]] || {
  printf 'Restore target must differ from the active database; use a new database name.\n' >&2
  exit 2
}
gzip -t -- "$BACKUP_FILE"
(cd -- "$(dirname -- "$BACKUP_FILE")" && sha256sum --check -- "$(basename -- "$BACKUP_FILE").sha256")

created=0
cleanup_failed_restore() {
  status=$?
  if (( status != 0 && created == 1 )); then
    compose exec -T database sh -c 'dropdb --if-exists -U "$POSTGRES_USER" "$1"' sh "$TARGET_DB" || true
  fi
  exit "$status"
}
trap cleanup_failed_restore EXIT

compose exec -T database sh -c 'createdb -U "$POSTGRES_USER" "$1"' sh "$TARGET_DB"
created=1
gzip -dc -- "$BACKUP_FILE" | compose exec -T database sh -c \
  'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$1"' sh "$TARGET_DB"
trip_count="$(compose exec -T database sh -c \
  'psql -U "$POSTGRES_USER" -d "$1" -Atqc "$2"' sh "$TARGET_DB" 'SELECT count(*) FROM "Trip"')"
seat_count="$(compose exec -T database sh -c \
  'psql -U "$POSTGRES_USER" -d "$1" -Atqc "$2"' sh "$TARGET_DB" 'SELECT count(*) FROM "TripSeat"')"
created=0
trap - EXIT
printf 'Restore verified in database %s: %s trips, %s seats.\n' "$TARGET_DB" "$trip_count" "$seat_count"
printf 'The active application database was not changed.\n'
