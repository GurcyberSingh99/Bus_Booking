# Architecture Overview

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

