# Open Clinical Record — Technology Stack

**Status:** Approved project direction (versions aligned to live manifests, 2026-09-29)

**Date:** September 2026

## Selected Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **React 19** + **React Router 7** + **TypeScript ~6** + **Vite 8** | From `src/frontend/open-clinical-record-web/package.json` |
| Backend | **ASP.NET Core 8** / .NET | API and application services |
| API | RESTful HTTP API | Frontend/backend communication |
| Database | **PostgreSQL** | Primary relational data store |
| ORM / Data Access | **Entity Framework Core 8** + **Npgsql** | PostgreSQL persistence |
| Auth | JWT Bearer + ASP.NET Core Identity | Role claims |
| Tests | xUnit + WebApplicationFactory | Backend API tests (EF InMemory) |
| CI | GitHub Actions | `dotnet test` + frontend build |
| Source Control | Git + GitHub | Version control and collaboration |

## Database Standard

**PostgreSQL is the single database target for the internship MVP.**

All database-related project work should target PostgreSQL, including:

- ERD and logical/physical data design
- Database schema
- PostgreSQL constraints and indexes
- Entity Framework Core migrations
- Local development
- Integration testing
- Seed/test data
- Deployment configuration
- Backup and recovery planning

Do not introduce SQL Server, MySQL, SQLite, or another database as an MVP alternative without an explicit architecture decision superseding ADR-0002.

## Persistence Flow

```text
React
  ↓
ASP.NET Core REST API
  ↓
Application / Business Logic
  ↓
Entity Framework Core
  ↓
Npgsql
  ↓
PostgreSQL
```

## Consistency Rule

When another project document refers to the technology stack or database, it should identify PostgreSQL consistently. Frontend library versions must match `package.json`, not older handbooks that said React 18.

## MVP Boundary

The technology stack supports the three approved business modules:

1. Patient Management
2. Patient Chart
3. Appointment Management

Authentication, authorization, validation, audit logging, and error handling remain cross-cutting concerns.

FHIR and other international healthcare interoperability standards are deferred from the internship MVP.
