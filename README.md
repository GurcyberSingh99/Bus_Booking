# Bus Trip & Seat Reservation System

JavaScript monorepo for bus trip discovery and seat reservations, with a PostgreSQL-backed booking API.

## Requirements

- Node.js 24+
- PostgreSQL 16 (for database readiness)

## Run independently

```sh
# Terminal 1
cd backend
copy ..\.env.example .env   # Windows; use `cp ../.env.example .env` on macOS/Linux
npm install
npm run dev

# Terminal 2
cd frontend
npm install
npm run dev
```

The API listens on `http://localhost:5000`; `/health` reports process health and `/ready` checks database connectivity. The frontend is at `http://localhost:5173`. Set `DATABASE_URL` in `backend/.env` to your local PostgreSQL database. Replace the example `USER` and `PASSWORD` values with local credentials; the example contains no real secrets. Starting the backend applies migrations and loads sample trips and seats.

## API

- `GET /api/routes` and `GET /api/trips?from=Delhi&to=Jaipur&travelDate=YYYY-MM-DD`
- `GET /api/trips/:tripId/seats?travelDate=YYYY-MM-DD`
- `POST /api/bookings` creates a confirmed reservation and PNR; `GET /api/bookings/:pnr` returns its ticket.
- `POST /api/bookings/:pnr/cancel` cancels the ticket and releases its seats.

Booking JSON requires `tripId`, `travelDate`, `boardingStopId`, `dropStopId`, `seatNumbers`, `passengers` (`name`, `age` per seat), `contactEmail`, and `contactPhone`. An occupied seat returns `409 Conflict`. See `backend/tests` for request examples.

## Containers

Copy `.env.example` to the repository root `.env`, set local PostgreSQL credentials there, then run `docker compose up --build -d`. Open `http://localhost:8080`; `/health` and `/ready` are also exposed. Use `docker compose logs -f` to inspect containers and `docker compose down` to stop them (the database volume is kept).

For health checks, backup/restore, recovery and rollback steps, see [docs/RUNBOOK.md](docs/RUNBOOK.md).

## CI/CD

`.github/workflows/ci-cd.yml` runs formatting, lint, static checks, tests, Trivy scans and Docker image builds on pull requests and pushes. Pushes to `main` publish `latest` and commit-SHA tags; pushing a `v*` tag publishes that release tag and its commit-SHA tags to GHCR. Deployment to an Ubuntu VM is optional; setup is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Prisma

From `backend`, run `npm run db:generate` after install. Apply schema changes with `npm run db:migrate` when PostgreSQL is available.
