# Open Clinical Record — Technology Stack

**Status:** Approved project direction

**Date:** September 2026

## Selected Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Web user interface |
| Backend | .NET / ASP.NET Core | API and application services |
| API | RESTful HTTP API | Frontend/backend communication |
| Database | PostgreSQL | Primary relational data store |
| ORM / Data Access | Entity Framework Core + Npgsql | PostgreSQL persistence from ASP.NET Core |
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

When another project document refers to the technology stack or database, it should identify PostgreSQL consistently. If an older document says the database is “to be selected,” that statement is obsolete and should be updated when that document is next revised.

## MVP Boundary

The technology stack supports the three approved business modules:

1. Patient Management
2. Patient Chart
3. Appointment Management

Authentication, authorization, validation, audit logging, and error handling remain cross-cutting concerns.

FHIR and other international healthcare interoperability standards are deferred from the internship MVP.
