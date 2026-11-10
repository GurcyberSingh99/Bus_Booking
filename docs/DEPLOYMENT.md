# CI/CD deployment

The `CI / CD` workflow runs formatting, lint, static checks, tests, Trivy scans and Docker image builds on pull requests and pushes. A successful `main` push publishes backend/frontend images with `latest` and `sha-<12-character-commit>` tags. Push a version tag such as `v1.2.3` to publish that tag and the SHA tags. Deployment runs from `main` when the repository variable `DEPLOY_ENABLED` is set to `true`.

The Trivy gate currently blocks critical findings. `npm audit` reports three high-severity advisories in the Prisma dependency chain; upgrade that chain before tightening the gate to `HIGH,CRITICAL`.

## GitHub configuration

Create a `production` environment. Add these repository variables:

- `DEPLOY_ENABLED=true`, `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `APP_DOMAIN`, `CERTBOT_EMAIL` (optional `DEPLOY_PORT`, default `22`; optional `POSTGRES_DB`, default `bus_reservation_db`)

Add these `production` environment secrets:

- `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`
- `GHCR_PULL_USERNAME`, `GHCR_PULL_TOKEN` (token needs `read:packages`)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`

`DATABASE_URL` must connect to the Compose database service and use URL-encoded credentials, for example `postgresql://USER:PASSWORD@database:5432/bus_reservation_db?schema=public`. Keep the username/password consistent with the matching secrets.

GitHub Actions deployment is enabled only when `DEPLOY_ENABLED=true`. Pushes to `main` deploy the immutable SHA image; manually dispatching `CI / CD` from `main` can deploy the current SHA or a previous `sha-<12 hex>` tag using `rollback_image_tag`. Keep production secrets in the `production` environment and never in repository files.

## Ubuntu VM

Install Docker Engine with the Compose plugin. Give the deploy user Docker access and SSH access. Point the domain to the VM and allow inbound ports 80 and 443. The first deploy obtains a Let's Encrypt certificate; it expects the domain and email above and ports 80/443 to be reachable.

The workflow copies the production Compose file and scripts to `DEPLOY_PATH`, pulls the SHA-tagged GHCR images, then checks `/ready` over HTTPS. Schedule monthly certificate renewal with the deploy user's crontab, replacing `/opt/bus-trip` with `DEPLOY_PATH`:

```cron
17 3 1 * * /opt/bus-trip/scripts/renew-certificate.sh /opt/bus-trip >> /opt/bus-trip/cert-renew.log 2>&1
```

For the reproducible first run, operational checks, database backup/restore drill, and application rollback, see [RUNBOOK.md](RUNBOOK.md).
