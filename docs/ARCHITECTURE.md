# Architecture Overview

## Runtime and delivery flow

```mermaid
flowchart LR
    browser[Browser]
    proxy[Nginx reverse proxy\nHTTP local / HTTPS production]
    web[React + Vite static client\nnon-root :8080]
    api[Express API\nnon-root :5000]
    db[(PostgreSQL\npersistent volume)]
    cert[Let's Encrypt certificate\nUbuntu deployment]
    backup[Compressed pg_dump\nSHA-256 verified]
    gha[GitHub Actions\nformat · lint · tests · Trivy]
    registry[GHCR\nsha-<12> and v* tags]
    vm[Ubuntu VM\nDocker Compose]

    browser -->|HTTP :8080 / HTTPS :8443 demo| proxy
    proxy -->|SPA /| web
    proxy -->|/api, /health, /ready| api
    api -->|Prisma| db
    db --- backup
    cert --> proxy
    gha -->|build and scan| registry
    registry -->|pinned image tag| vm
    vm --> proxy
```

The local HTTPS profile uses a self-signed certificate generated on demand; it is ignored by Git and should be used only for the local demo. Production TLS uses Certbot on the Ubuntu VM. The production Nginx reverse proxy runs unprivileged on container ports 8080/8443; only the host maps public 80/443. Its supplementary group can read the restricted TLS private key.

## Monorepo Layout

- `frontend/`: React + Vite + Tailwind CSS SPA
- `backend/`: Node.js + Express REST API (modular architecture)
- `nginx/`: Reverse proxy configuration for local and production deployment
- `scripts/`: Development and deployment automation scripts
- `docs/`: Technical specifications and runbooks
- `.github/workflows/`: CI/CD pipelines (testing, linting, container builds)

## Backend Layers

1. **Config**: Environment and database client initialization (`src/config/`)
2. **Routes**: Express routing definitions (`src/routes/`)
3. **Controllers**: HTTP request parsing and response handling (`src/controllers/`)
4. **Services**: Business logic and database interactions (`src/services/`)
5. **Middleware**: Error handling, logging, validation (`src/middleware/`)

