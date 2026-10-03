# Phase 04 — System Engineering

This phase documents how the OCR requirements and domain model were translated into an implementable software architecture. It is intentionally evidence-driven: implemented decisions are separated from future or production-hardening concerns.

## Phase 04 document map

### Architecture foundation
1. [System Engineering Overview](01-system-engineering-overview.md)
2. [Architecture Overview](02-architecture-overview.md)
3. [Architecture Layers and Responsibility Boundaries](03-architecture-layers.md)

### Technology
4. [Technology Stack](04-technology-stack.md)
5. [Technology Selection Rationale](05-technology-selection-rationale.md)

### Backend
6. [Backend Architecture](06-backend-architecture.md)
7. [Service Layer Design](07-service-layer-design.md)
8. [API Design](08-api-design.md)

### Data engineering
9. [Database Architecture](09-database-architecture.md)
10. [Data Model and ERD Analysis](10-data-model-and-erd-analysis.md)

### Security and frontend
11. [Authentication and Authorization](11-authentication-and-authorization.md)
12. [Frontend Architecture](12-frontend-architecture.md)
13. UI/UX Engineering
14. Security Engineering

### Integrity, quality, and delivery
15. Audit and Record Integrity
16. Testing Architecture
17. Deployment and Environment
18. Architecture Decisions and Trade-offs
19. System Engineering Evidence

## Evidence base

The phase is grounded in the repository's technical documentation, architecture decision record, access-control audit, requirements, domain rules, test documentation, migrations, source structure, and finalization materials.

Key implementation facts include:

- React 19 + React Router 7 + TypeScript + Vite 8 frontend
- ASP.NET Core 8 REST API
- Entity Framework Core 8 + Npgsql
- PostgreSQL
- ASP.NET Core Identity + JWT Bearer authentication
- xUnit + WebApplicationFactory for backend automated testing
- GitHub Actions for CI
- application services including PatientService, AppointmentWorkflowService, ClinicalChartService, DashboardService, and AuditService
- layered architecture with backend authorization independent of frontend visibility

## Reporting rule

Each section should distinguish:

- **Implemented** — supported by repository/code/test evidence.
- **Designed/documented** — architecture or requirement that may not yet be fully implemented.
- **Limited** — known internship-scale limitation.
- **Future** — possible extension, not a current capability.

The purpose of this phase is not to make OCR appear more enterprise-ready than it is. Its purpose is to show how the implemented MVP was engineered and why the chosen structure was appropriate to its actual scope.
