# ADR-0002: Select PostgreSQL as the MVP Database

**Status:** Accepted

**Date:** September 2026

## Context

Open Clinical Record requires a relational database for the internship MVP. The system has structured relationships between patients, appointments, visits/check-ins, chart information, users, and audit events.

The database choice must be consistent across the ER diagram, architecture, development environment, backend persistence layer, testing, and deployment planning.

## Decision

**PostgreSQL is the selected database engine for the Open Clinical Record internship MVP.**

The planned backend persistence stack is:

```text
ASP.NET Core
    ↓
Entity Framework Core
    ↓
Npgsql PostgreSQL provider
    ↓
PostgreSQL
```

PostgreSQL is therefore the authoritative database target for development and implementation. The project should not introduce SQL Server, MySQL, SQLite, or another relational database as an alternative MVP target unless this ADR is formally superseded.

## Consequences

### Positive

- One consistent database target across design and implementation.
- Strong relational integrity for patient and appointment relationships.
- Good fit for the normalized relational ERD.
- PostgreSQL-compatible migrations and constraints can be tested locally before deployment.
- The backend can use Entity Framework Core with Npgsql while keeping persistence concerns separated from business logic.

### Trade-offs

- Developers must install/configure PostgreSQL for local development.
- PostgreSQL-specific behavior and types must be considered when writing migrations or raw SQL.
- Deployment documentation must include PostgreSQL configuration, credentials/secrets handling, backup, and recovery considerations.

## Scope

This decision applies to the **internship MVP**. It does not prevent a future architecture review if deployment requirements or project constraints change.

## Related Documents

- `docs/03-requirements/srs/srs.tex`
- `docs/03-requirements/non-functional-requirements.md`
- `docs/03-requirements/clinical-domain-rules.md`
- `docs/04-architecture/architecture-overview.tex`
- `docs/05-data/`
- `README.md`
