# Open Clinical Record — Technical Documentation

**Version:** Week 8 (2026-09-27)  
**Repository:** `elan-thinks/open-clinical-record`  
**Branch:** `main`

---

## 1. Purpose and scope

OCR is an **outpatient EMR internship MVP** covering:

1. Patient management  
2. Patient chart (longitudinal visits)  
3. Appointment management (including check-in)

**Out of scope:** pharmacy, laboratory, radiology, billing, FHIR exchange, multi-facility enterprise scheduling.

---

## 2. Architecture

```text
Browser (React + Vite + TypeScript)
        │  HTTPS / HTTP JSON
        ▼
ASP.NET Core 8 Web API (JWT)
        │  EF Core 8 + Npgsql
        ▼
PostgreSQL
```

- **Thin controllers** → application services (`PatientService`, `AppointmentWorkflowService`, `ClinicalChartService`, `DashboardService`, `AuditService`).  
- **RBAC** via JWT role claims + authorization policies.  
- **Longitudinal model:** Patient → ClinicalVisit → VitalSigns / Diagnoses / ClinicalNotes (visits never overwritten).

Details: `docs/04-architecture/project-structure.md`, `docs/clinical-visit-model.md`.

---

## 3. Technology stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18, TypeScript, Vite |
| Backend | ASP.NET Core 8 |
| ORM | Entity Framework Core 8 |
| Database | PostgreSQL |
| Auth | JWT Bearer |
| Tests | xUnit + `WebApplicationFactory` |
| CI | GitHub Actions (dotnet test + frontend build) |

---

## 4. Repository layout

```text
src/backend/OpenClinicalRecord.Api/
src/frontend/open-clinical-record-web/
tests/backend/OpenClinicalRecord.Api.Tests/
docs/
.github/workflows/
```

---

## 5. Domain model (summary)

| Entity | Notes |
|--------|-------|
| Patient | Status Active / Inactive / Deceased |
| Appointment | Status machine + AppointmentEvent history |
| ClinicalVisit | Draft / Final / Cancelled; optional AppointmentId |
| VitalSigns | 0..1 per visit |
| Diagnosis | Primary/secondary |
| ClinicalNote | Progress notes |
| PatientDeathRecord | Provenance for deceased |
| AuditEvent | Important actions |

Appointment transitions and rules: `docs/03-requirements/clinical-domain-rules.md`.

---

## 6. Security

| Topic | Implementation |
|-------|----------------|
| Authentication | Login issues JWT |
| Authorization | Roles: Admin, Doctor, Nurse, Receptionist |
| Clinical writes | Doctor + Nurse only |
| Booking | All four staff roles |
| Mark deceased | Admin, Doctor, Receptionist |
| Clear deceased | Admin, Doctor |
| Secrets | Connection string / JWT key via configuration & environment |

Matrix: `docs/05-engineering/access-control-report.md`.

---

## 7. Key API surface (illustrative)

| Area | Examples |
|------|----------|
| Auth | `POST /api/auth/login` |
| Patients | `GET/POST /api/patients`, deceased endpoints |
| Appointments | `GET/POST /api/appointments`, `PATCH .../status`, `PATCH .../reschedule` |
| Chart | `GET/POST/PATCH .../patients/{id}/chart/...` |
| Dashboard | `GET /api/dashboard/stats` |
| Audit | `GET /api/audit` (Admin) |
| Health | `GET /api/health`, `/api/health/ready` |

---

## 8. Database

- **Authoritative schema:** EF Core migrations under  
  `src/backend/OpenClinicalRecord.Api/Migrations/`  
- **Reference SQL:** `docs/05-data/ocr-complete-database.sql` (may lag; do not prefer over migrations)  
- Apply migrations on deploy: `dotnet ef database update` (or migrate on startup if configured)

---

## 9. Local run

```bash
# API
cd src/backend/OpenClinicalRecord.Api
dotnet run --launch-profile http

# Web
cd src/frontend/open-clinical-record-web
npm install
npm run dev
```

Frontend: `http://localhost:5173` · API default: `http://localhost:5000`  
CORS allows the Vite origin in development.

---

## 10. Testing & CI

```bash
cd tests/backend/OpenClinicalRecord.Api.Tests
dotnet test
```

Coverage includes access matrix, appointment workflows, clinical documentation (including InMemory-safe finalize), longitudinal visits.

CI runs backend tests and frontend `tsc` + production build on push to `main`.

---

## 11. Known limitations

- Reference SQL dump is not guaranteed byte-identical to latest migrations.  
- Reports are basic aggregates, not a full BI suite.  
- No multi-tenant / multi-facility support.  
- Training passwords must not be used in production.

---

## 12. Related documents

| Doc | Role |
|-----|------|
| `docs/README.md` | Documentation index |
| `docs/03-requirements/srs/srs.pdf` | Formal SRS |
| `docs/08-finalization/user-guide.md` | End-user manual |
| `docs/09-testing/e2e-clinical-flow-checklist.md` | Manual E2E |
