# Project Structure

**Aligned:** 2026-09-29

## Repository layout

```text
open-clinical-record/
├── src/
│   ├── backend/OpenClinicalRecord.Api/
│   └── frontend/open-clinical-record-web/
├── tests/backend/OpenClinicalRecord.Api.Tests/
├── docs/
└── .github/workflows/
```

## Backend (`OpenClinicalRecord.Api`)

| Area | Responsibility |
|------|----------------|
| Controllers | Thin HTTP endpoints |
| Services | Application workflows (patients, appointments, clinical, dashboard, audit) |
| Data | `AppDbContext`, EF Core migrations |
| Models / Entities | Domain persistence model |
| DTOs | Request/response contracts |
| Extensions | DI and pipeline helpers |

## Frontend (`open-clinical-record-web`)

| Area | Responsibility |
|------|----------------|
| pages | Route-level screens |
| services | Typed API clients (`getApiBaseUrl`) |
| routes | Route table + role guards |
| layouts | Application shell |
| context | Auth session, theme |
| components | Shared UI |

Stack versions: see `package.json` (React 19, React Router 7, TypeScript 6, Vite 8).

## Docs

| Path | Content |
|------|--------|
| `00-project` | Scope, stack |
| `03-requirements` | SRS, domain rules, NFRs, traceability |
| `04-architecture` | Structure, ADRs, overview PDF |
| `05-data` | Reference SQL (migrations are authoritative) |
| `06-engineering` | Access control, coding standards, week notes |
| `08-finalization` | User guide, technical docs, deliverable PDFs |
| `09-testing` | Manual E2E checklist |

## Local run

```bash
# Backend
cd src/backend/OpenClinicalRecord.Api
dotnet run --launch-profile http

# Frontend
cd src/frontend/open-clinical-record-web
npm install
npm run dev
```

Open `http://localhost:5173`, sign in with a seed user (see `docs/06-engineering/access-control-report.md`).
