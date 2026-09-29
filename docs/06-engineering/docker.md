# Docker Desktop — local stack

Run the full Open Clinical Record stack (PostgreSQL + API + web UI) with Docker Desktop.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Ports free on the host: **5432** (Postgres), **5000** (API), **8080** (web)

If you already run Postgres or the API locally, stop them first or change the published ports in `docker-compose.yml`.

## Start

From the **repository root**:

```bash
docker compose up --build
```

First build downloads base images and may take several minutes.

| Service | URL |
|---------|-----|
| **Web UI** | http://localhost:8080 |
| **API** | http://localhost:5000 |
| **Swagger** (Development) | http://localhost:5000/swagger |
| **Health** | http://localhost:5000/api/health |
| **Postgres** | `localhost:5432` user `ocr` / password `ocr_dev_password` / db `open_clinical_record` |

## Seed users

With `ASPNETCORE_ENVIRONMENT=Development` and `OCR_SEED_DEMO_DATA=true`, the API seeds roles, users, and demo patients on startup.

| Email | Role | Password |
|-------|------|----------|
| `admin@clinic.local` | Admin | `Dev@12345` |
| `doctor@clinic.local` | Doctor | `Dev@12345` |
| `nurse@clinic.local` | Nurse | `Dev@12345` |
| `desk@clinic.local` | Receptionist | `Dev@12345` |

## Useful commands

```bash
# Rebuild after code changes
docker compose up --build

# Logs
docker compose logs -f api
docker compose logs -f web

# Stop (keep database volume)
docker compose down

# Stop and delete database volume (full reset)
docker compose down -v
```

## How it is wired

```text
Browser  →  http://localhost:8080  (nginx serves React SPA)
         →  http://localhost:5000  (API; VITE_API_BASE_URL at image build)
API      →  postgres:5432          (Docker network hostname)
```

- EF migrations run via the existing identity/schema seeder on Development startup.
- JWT and DB passwords are **development-only** values in `docker-compose.yml` — do not use them in production.

## Troubleshooting

| Symptom | Check |
|---------|--------|
| `ERR_CONNECTION_REFUSED` on :5000 | `docker compose ps` — is `ocr-api` running? `docker compose logs api` |
| API fails on start | Postgres health; connection string host must be `postgres` inside Compose |
| CORS errors from :8080 | Ensure `CORS_ORIGINS` includes `http://localhost:8080` (default in compose) |
| Port already in use | Change host ports in `docker-compose.yml` (e.g. `"5433:5432"`) |
| Empty UI after rebuild | Hard-refresh the browser; confirm `VITE_API_BASE_URL` build arg |
