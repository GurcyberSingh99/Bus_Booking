# Operations runbook

## Reproduce the stack

Install Docker Engine and the Compose plugin. Clone the repository, copy `.env.example` to `.env`, set local database credentials, then run:

```sh
docker compose up --build -d
docker compose ps
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8080/ready
```

The frontend and Nginx are available at `http://localhost:8080`. PostgreSQL data persists in the named `postgres_data` volume. Backend/API, frontend, and local reverse proxy run non-root. Backend startup applies migrations and idempotently seeds 15 sample routes and seats for the next 30 days. For Ubuntu HTTPS deployment and GitHub Actions setup, follow [DEPLOYMENT.md](DEPLOYMENT.md).

For a local HTTPS deployment exercise, generate an ignored self-signed certificate and launch the extra proxy:

```sh
bash scripts/create-local-https-cert.sh
docker compose -f docker-compose.yml -f docker-compose.https.yml --profile https-demo up --build -d
curl -kfsS https://localhost:8443/ready
```

The local certificate is self-signed, so browsers warn until it is trusted; `curl -k` is only for this disposable demo certificate. Production uses a Let's Encrypt certificate and HTTPS on ports 80/443. The production reverse proxy listens on unprivileged container ports 8080/8443, and a restricted supplementary group grants it read access to the TLS key.

## Health, logs and first checks

- `/health` is the process liveness check; `/ready` also checks PostgreSQL and returns `503` with a remediation hint if it cannot connect.
- Compose waits for healthy database/backend/frontend dependencies. Containers use `unless-stopped`; the API handles `SIGTERM` and closes database connections cleanly.
- Backend logs are one JSON object per line. Each request includes `requestId`, method, path, status and duration; errors include the request ID in the response. Use that ID to find its log entry.

```sh
docker compose ps
docker compose logs --since 15m backend database nginx
docker compose exec database sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
docker stats --no-stream
curl -i http://localhost:8080/ready
```

If PostgreSQL is unhealthy, inspect its logs and available disk space first; confirm the root `.env` values are present without printing them. If `/ready` fails while the database is healthy, check the backend logs for the request ID and confirm `DATABASE_URL` points to host `database`, port `5432`, and the same database/user configured for Compose. After correcting configuration, `docker compose up -d` retries unhealthy/stopped services. For a clean process restart, run `docker compose restart backend`.

## Backup and restore demonstration

Create a compressed, checksummed online PostgreSQL backup. The file and checksum are mode `600`; `/backups` and SQL dumps are ignored by Git.

```sh
bash scripts/backup-db.sh /var/backups/bus-trip
```

Restore always creates a **new, empty target database**. It checks the gzip stream and SHA-256, refuses the active database name, imports with SQL errors enabled, then reports trip/seat counts. The active application database is not overwritten:

```sh
bash scripts/restore-db.sh /var/backups/bus-trip/bus-trip-<timestamp>.sql.gz bus_trip_restore_20261110
```

The restore target must not already exist. Keep backups off the VM as well (encrypted object storage or another host) and periodically run a restore drill. The restore script intentionally leaves the verified target available for inspection.

To promote a verified restore, set the GitHub `production` environment variable `POSTGRES_DB` and secret `DATABASE_URL` to the restore database (URL-encode credentials), then manually run the `CI / CD` workflow on `main` with the rollback image input blank. It rewrites the deployment environment and restarts the same pinned application image against the restored database. Keep the previous database and backup until `/ready` and booking lookups are verified.

For a regular backup, install a deploy-user cron entry (change paths and frequency to match your retention policy):

```cron
15 2 * * * /opt/bus-trip/scripts/backup-db.sh /var/backups/bus-trip >> /var/log/bus-trip-backup.log 2>&1
```

Monitor cron logs and copy completed backup/checksum pairs off-host. Retain several daily and weekly generations; do not delete the last known-good copy.

## Application rollback

Every successful `main` deployment publishes an immutable `sha-<12-character-commit>` image. In GitHub Actions, manually run `CI / CD` on `main` and enter the previous successful SHA tag in `rollback_image_tag`. The workflow deploys that image and checks `/ready` over HTTPS. Take a database backup first. This rolls back the application image only: migrations are forward-only and are not automatically reversed. Keep schema changes backward-compatible; if the older app cannot read the current schema, restore a pre-deploy backup to a new database and promote it using the procedure above.

For a code fix instead, revert the faulty commit and push to `main`; CI rebuilds, scans, publishes and deploys the reverted code.
