# Project Structure — Milestone 1 Foundation

**Status:** Implemented  
**Date:** September 2026

## Overview

Open Clinical Record uses a clear separation between the ASP.NET Core backend API and the React frontend. Milestone 1 establishes a runnable skeleton only: no authentication, no database, and no business modules.

## Top-level layout

```text
src/
├── backend/
│   └── OpenClinicalRecord.Api/     # ASP.NET Core Web API
└── frontend/
    └── open-clinical-record-web/   # React + TypeScript (Vite)

tests/
└── backend/
    └── OpenClinicalRecord.Api.Tests/

docs/                               # Existing documentation (unchanged)
```

## Backend (`src/backend/OpenClinicalRecord.Api`)

| Folder / file | Responsibility |
|---|---|
| `Controllers/` | HTTP endpoints (Milestone 1: `HealthController` only) |
| `Data/` | EF Core `DbContext` and data access |
| `Models/Entities/` | Domain entities (not used yet) |
| `Models/Enums/` | Shared enumerations (not used yet) |
| `DTOs/` | Request/response contracts (not used yet) |
| `Services/` | Application services (not used yet) |
| `Authorization/` | Authorization policies/handlers (not used yet) |
| `Middleware/` | Custom middleware (not used yet) |
| `Extensions/` | Service-collection and pipeline extension methods |
| `Configuration/` | Strongly-typed options classes |
| `Program.cs` | Application bootstrap, DI, middleware pipeline |
| `appsettings.json` | Base configuration |
| `appsettings.Development.json` | Development overrides |

### Local development port

- HTTP: `http://localhost:5000`

### Health endpoint

- `GET /api/health` → `{ "status": "ok" }` (HTTP 200)
- `GET /api/health/ready` → API + database connectivity

### CORS

Development policy allows explicit origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

Do not use a permanent wildcard origin.

## Frontend (`src/frontend/open-clinical-record-web`)

| Folder | Responsibility |
|---|---|
| `src/assets/` | Static assets (images, icons) |
| `src/components/` | Reusable UI components |
| `src/layouts/` | Page shells / application chrome |
| `src/pages/` | Route-level page components |
| `src/routes/` | Route definitions |
| `src/services/` | API client and external service calls |
| `src/context/` | React context providers |
| `src/hooks/` | Custom React hooks |
| `src/types/` | Shared TypeScript types |
| `src/utils/` | Pure helper functions |

### Local development port

- Vite default: `http://localhost:5173`

### Backend communication

- Base URL configured via `VITE_API_BASE_URL` (defaults to `http://localhost:5000`).
- Health check: `src/services/api.ts` calls `GET /api/health`.
- UI shows **Backend Online** or **Backend Unavailable** based on the response.

## Tests

- `tests/backend/OpenClinicalRecord.Api.Tests` — xUnit + `WebApplicationFactory` integration test for the health endpoint.

## Database (configured)

- PostgreSQL via **Npgsql + Entity Framework Core**
- `AppDbContext` registered in DI (`Data/AppDbContext.cs`)
- Connection string: `ConnectionStrings:DefaultConnection`
- Development default: `Host=localhost;Port=5432;Database=open_clinical_record;Username=postgres;Password=postgres`
- Override with environment variable `ConnectionStrings__DefaultConnection` (never commit real secrets)
- Health endpoints:
  - `GET /api/health` — API liveness
  - `GET /api/health/ready` — API + database connectivity

## Intentionally NOT implemented yet

- Authentication / authorization
- EF Core entities and migrations (context is empty until User/Role models)
- Patient, appointment, or medical-record controllers/services
- Login UI or role-based dashboards
- Production CORS or secret management beyond development defaults

## Running locally

```bash
# Backend
cd src/backend/OpenClinicalRecord.Api
dotnet run --launch-profile http

# Frontend (separate terminal)
cd src/frontend/open-clinical-record-web
npm install
npm run dev
```

Open `http://localhost:5173` and confirm the health status updates to **Backend Online**.
