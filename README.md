# Open Clinical Record

**Open Clinical Record (OCR)** is a focused outpatient EMR internship project built around three core workflows:

1. **Patient Management**
2. **Patient Chart**
3. **Appointment Management**

The MVP is intentionally limited to functionality that can realistically be implemented, tested, and demonstrated within the internship period.

```text
Patient Management → Patient Chart → Appointment Management → Check-in / Visit History
```

| Role | Claim | Primary responsibility |
|------|--------|------------------------|
| Receptionist / Front Desk | `Receptionist` | Registration, appointments, check-in |
| Nurse / Clinical Staff | `Nurse` | Chart support, vitals, visit workflow |
| Clinician / Doctor | `Doctor` | Chart review and clinical documentation |
| System Administrator | `Admin` | Users, roles, audit |

**Stack:** React 19 + Vite 8 + TypeScript · ASP.NET Core 8 · PostgreSQL (EF Core + Npgsql) · JWT RBAC

---

## Quick start (local)

### 1. What to install after `git clone`

| Tool | Version | Purpose |
|------|---------|---------|
| **Git** | any recent | Clone the repo |
| **.NET 8 SDK** | 8.x | Backend API (`net8.0`) |
| **Node.js** | 20 or 22 LTS | Frontend (`npm`) |
| **PostgreSQL** | 14+ (16 recommended) | Database |
| **Docker Desktop** | optional | Full stack in containers |

Check tools:

```bash
dotnet --list-sdks    # need an 8.x entry
node -v
npm -v
psql --version        # or use a GUI client
```

Install the [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) even if you also have a newer SDK (e.g. 9/10).

### 2. Clone

```bash
git clone https://github.com/elan-thinks/open-clinical-record.git
cd open-clinical-record
```

Use a simple path without special characters when possible.

### 3. Database

Create an empty database (example):

```text
Host:     localhost
Port:     5432
Database: open_clinical_record
Username: postgres
Password: <your local postgres password>
```

Connection string is read from `ConnectionStrings:DefaultConnection`.

- Development defaults live in `src/backend/OpenClinicalRecord.Api/appsettings.Development.json`.
- If the connection string has no password, set env var **`NOVATECH_PG_PASSWORD`** to your Postgres password.
- Optional: override fully with  
  `ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=open_clinical_record;Username=postgres;Password=...`

On first Development startup the API runs schema migration/seed (roles, users, optional demo patients).

### 4. Run the backend (API)

```bash
cd src/backend/OpenClinicalRecord.Api
dotnet restore
dotnet run --launch-profile http
```

| Endpoint | URL |
|----------|-----|
| API | http://localhost:5000 |
| Health | http://localhost:5000/api/health |
| Swagger (Development) | http://localhost:5000/swagger |

NuGet packages are restored automatically (`JwtBearer`, Identity, EF Core, Npgsql, Swashbuckle, etc.).

### 5. Run the frontend (web)

In a **second** terminal:

```bash
cd src/frontend/open-clinical-record-web
npm install
npm run dev
```

| App | URL |
|-----|-----|
| Web UI | http://localhost:5173 |

The frontend calls the API via `VITE_API_BASE_URL` (default **`http://localhost:5000`** in `src/services/api.ts`).

Optional local override — create `.env.development`:

```text
VITE_API_BASE_URL=http://localhost:5000
```

### 6. Sign in (seed users)

Default password for all seed accounts: **`Dev@12345`**

| Email | Role |
|-------|------|
| `desk@clinic.local` | Receptionist |
| `doctor@clinic.local` | Doctor |
| `nurse@clinic.local` | Nurse |
| `admin@clinic.local` | Admin |

Override seed password with env var `OCR_SEED_PASSWORD` if needed.  
**Development only — never use these credentials in production.**

---

## Run tests

Backend automated tests (xUnit + `WebApplicationFactory`, EF InMemory):

```bash
cd tests/backend/OpenClinicalRecord.Api.Tests
dotnet test
```

From repo root (if solution includes the test project):

```bash
dotnet test
```

Frontend quality check (typecheck + production build):

```bash
cd src/frontend/open-clinical-record-web
npm run build
```

CI on GitHub Actions runs backend tests and the frontend build on `main`.

Manual clinical walkthrough: [docs/09-testing/e2e-clinical-flow-checklist.md](docs/09-testing/e2e-clinical-flow-checklist.md).

---

## Docker Desktop (optional)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) running. Stop local Postgres/API if they already use ports **5432** / **5000**.

From the **repository root**:

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Web UI | http://localhost:8080 |
| API | http://localhost:5000 |
| Health | http://localhost:5000/api/health |

Same seed users as above. Guide: [docs/06-engineering/docker.md](docs/06-engineering/docker.md).

```bash
docker compose down          # stop, keep DB volume
docker compose down -v       # stop and wipe DB
```

If Docker build hangs or reports disk errors, prefer the **local** backend + frontend steps above for day-to-day work.

---

## Repository layout

```text
open-clinical-record/
├── src/backend/OpenClinicalRecord.Api/     # ASP.NET Core API
├── src/frontend/open-clinical-record-web/  # React + Vite SPA
├── tests/backend/OpenClinicalRecord.Api.Tests/
├── docs/                                   # Requirements, architecture, guides, PDFs
├── docker-compose.yml
└── .github/workflows/
```

---

## Documentation

| Doc | Path |
|-----|------|
| Documentation index | [docs/README.md](docs/README.md) |
| SRS (PDF) | [docs/08-finalization/deliverables/OCR-SRS-v2.pdf](docs/08-finalization/deliverables/OCR-SRS-v2.pdf) |
| User manual (PDF) | [docs/08-finalization/deliverables/OCR-User-Manual.pdf](docs/08-finalization/deliverables/OCR-User-Manual.pdf) |
| Technical documentation (PDF) | [docs/08-finalization/deliverables/OCR-Technical-Documentation.pdf](docs/08-finalization/deliverables/OCR-Technical-Documentation.pdf) |
| Access control / seed matrix | [docs/06-engineering/access-control-report.md](docs/06-engineering/access-control-report.md) |
| Domain rules | [docs/03-requirements/clinical-domain-rules.md](docs/03-requirements/clinical-domain-rules.md) |

---

## MVP scope (honest)

**In scope:** patients, longitudinal chart/visits, appointments (book / cancel with reason / reschedule / check-in), RBAC, audit, dashboard stats.

**Out of scope:** pharmacy, laboratory, radiology, billing, FHIR exchange, patient portal, multi-facility enterprise scheduling, AI decision support.

---

## Status

Internship MVP on `main`: four roles, visit Draft→Final model, appointment workflows, automated backend tests, CI, and finalization docs. Prefer local run for development; use Docker when the desktop engine is healthy.
