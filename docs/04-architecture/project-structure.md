# Project structure

**Status:** Current as of 2026-09-27  
**Milestone:** Week 7 (testing, refactoring, bug-fix) complete on `main`

## Repository layout

```text
open-clinical-record/
├── src/
│   ├── backend/
│   │   └── OpenClinicalRecord.Api/     # ASP.NET Core 8 API
│   └── frontend/
│       └── open-clinical-record-web/   # React + Vite + TypeScript
├── tests/
│   └── backend/
│       └── OpenClinicalRecord.Api.Tests/  # xUnit + WebApplicationFactory
├── docs/                               # Specs, audits, mocks (see docs/README.md)
└── .github/workflows/                  # CI (backend tests + frontend typecheck/build)
```

## Backend (`src/backend/OpenClinicalRecord.Api`)

| Area | Location |
|------|----------|
| Controllers | `Controllers/` — Auth, Patients, Appointments, Clinical chart, Dashboard, Audit, Users, Health |
| Application services | `Services/` — Patients, Appointments (`AppointmentWorkflowService`), Clinical (`ClinicalChartService` partials), Dashboard, Audit |
| EF Core | `Data/AppDbContext.cs` + `Migrations/` |
| Entities | `Models/Entities/` — Patient, ClinicalVisit, VitalSigns, Diagnosis, ClinicalNote, Appointment, AppointmentEvent, PatientDeathRecord, AuditEvent, … |
| DTOs | `DTOs/` |
| Auth | JWT bearer; roles Admin, Doctor, Nurse, Receptionist; policies in `Program.cs` |

### Health

- `GET /api/health` — API liveness  
- `GET /api/health/ready` — API + database  

### CORS (development)

- `http://localhost:5173`, `http://127.0.0.1:5173`

## Frontend (`src/frontend/open-clinical-record-web`)

| Folder | Responsibility |
|--------|----------------|
| `src/pages/` | Route pages (dashboard, patients, chart, appointments, check-in, reports, profile, admin) |
| `src/services/` | API clients (`appointmentsApi`, `patientsApi`, auth storage, …) |
| `src/components/`, `src/layouts/` | Shared UI and app shell |
| `src/context/` | Auth and session |
| `src/routes/` | Route definitions + role guards |

- Vite: `http://localhost:5173`  
- API base: `VITE_API_BASE_URL` (default `http://localhost:5000`)

## Tests

- `tests/backend/OpenClinicalRecord.Api.Tests` — integration tests including:
  - Health / smoke  
  - `AccessMatrixTests` (roles)  
  - `AppointmentWorkflowTests` (transitions, cancel reason, reschedule, check-in Draft visit)  
  - `ClinicalDocumentationTests` (document + finalize)  
  - `LongitudinalVisitTests` (history not overwritten)  

## Database

- PostgreSQL via **Npgsql + EF Core 8**  
- Connection: `ConnectionStrings:DefaultConnection`  
- Prefer env for secrets (`NOVATECH_PG_PASSWORD` or full connection override)  
- **Migrations are the source of truth** (not hand-maintained SQL alone)

## Implemented (MVP)

- Authentication / JWT authorization and role policies  
- Patient register, search, profile, status, deceased mark/clear  
- Appointments: book, list, status transitions, reschedule, cancel (reason required)  
- Check-in / queue; check-in creates **Draft** visit  
- Clinical chart: allergies, history, visits, vitals, diagnoses, notes; **Final** is immutable  
- Dashboard stats + reports page (staff)  
- Admin audit list (`GET /api/audit`)  
- CI on push to `main`

## Intentionally deferred

- Full FHIR interoperability  
- Prescription / pharmacy module  
- Imaging / lab result interfaces  
- Production secret management beyond environment configuration  
- Multi-facility enterprise scheduling  

## Running locally

```bash
# Backend
cd src/backend/OpenClinicalRecord.Api
dotnet run --launch-profile http

# Frontend
cd src/frontend/open-clinical-record-web
npm install
npm run dev
```

Open `http://localhost:5173`, sign in with a seed user (see `docs/05-engineering/access-control-report.md`).
