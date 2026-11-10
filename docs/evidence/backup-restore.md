# Recovery drill evidence

## Backup and restore

The backup script creates a compressed `pg_dump`, a SHA-256 sidecar and restrictive file permissions. Restore verifies both before importing into a new database, refuses to overwrite the active DB, and reports trip and seat counts. On 2026-11-10, the local drill restored a scratch database containing **450 trips and 10,800 seats**; the active database remained unchanged. The checksum verified before import. The scratch database and temporary backup files were removed after verification.

Reproduce with `bash scripts/backup-db.sh /var/backups/bus-trip`, then restore the resulting archive to a fresh target name using `bash scripts/restore-db.sh <archive> <new_database>`. Do not restore over production in a drill.

## Restart and recovery

On 2026-11-10, `docker compose restart backend` returned the API to healthy status and `/ready` returned HTTP 200 after reconnecting to PostgreSQL. The PostgreSQL named volume persisted through container recreation. The same readiness check passed through the self-signed local HTTPS proxy at `https://localhost:8443/ready`. Reproduce with `docker compose restart backend`, `docker compose ps`, and `curl -i http://localhost:8080/ready`.

## CI result

See [pipeline evidence](pipeline.md) for the initial workflow outcome and the current run history. Record the final run URL after the hardening changes are pushed.
