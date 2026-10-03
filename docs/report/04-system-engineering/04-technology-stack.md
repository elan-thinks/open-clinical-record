# 4.4 Technology Stack

## 4.4.1 Stack overview

The implemented OCR stack combines a typed modern web frontend with a .NET backend and relational PostgreSQL persistence.

| Area | Technology | Role in OCR |
|---|---|---|
| Frontend framework | React 19 | Component-based user interface |
| Frontend language | TypeScript | Typed client-side implementation |
| Frontend tooling | Vite 8 | Development server and production build |
| Routing | React Router 7 | Client-side navigation |
| Backend | ASP.NET Core 8 | REST API and server application |
| ORM | Entity Framework Core 8 | Object-relational persistence |
| PostgreSQL provider | Npgsql | EF Core connectivity to PostgreSQL |
| Database | PostgreSQL | Durable relational storage |
| Identity | ASP.NET Core Identity | User/account management |
| Authentication | JWT Bearer | Stateless API authentication |
| Testing | xUnit | Automated backend tests |
| Test host | WebApplicationFactory | Application-level API testing |
| Test database provider | EF Core InMemory | Isolated automated test persistence |
| Source control | Git/GitHub | Version history and collaboration |
| CI | GitHub Actions | Automated backend/frontend checks |

The versions above are taken from the project's final technical documentation and manifests rather than from generic technology descriptions.

## 4.4.2 Frontend stack

React provides the component model used to construct the browser application. TypeScript adds compile-time type checking and makes data structures and API interactions more explicit.

Vite provides the development/build environment. React Router handles navigation between application areas such as patient management, appointments, chart views, and dashboard screens.

The combination is suitable for a workflow-oriented application because the interface can be decomposed into reusable components while maintaining route-level separation between major tasks.

## 4.4.3 Backend stack

ASP.NET Core 8 provides the HTTP API and server runtime. The framework supplies middleware, routing, dependency injection, authentication, authorization, configuration, and hosting facilities needed by the application.

The backend is not used only as a thin database wrapper. Its important responsibility is enforcing workflow rules. This distinction is critical in an EMR because a request may be syntactically valid while being invalid in the current clinical or operational state.

## 4.4.4 Persistence stack

Entity Framework Core 8 is used as the ORM. Npgsql provides PostgreSQL integration.

The choice gives the project a typed application-level representation of entities while retaining the relational capabilities of PostgreSQL. It also allows schema changes to be represented through migrations.

The database is not treated as an incidental storage bucket. Patient, appointment, visit, diagnosis, notes, vital signs, event history, and audit information have relationships that need to remain coherent.

## 4.4.5 Authentication and authorization stack

ASP.NET Core Identity manages application users and roles. JWT Bearer authentication provides a token-based mechanism for API requests.

The implemented role set is:

- Admin
- Doctor
- Nurse
- Receptionist

Authentication answers “Who is making the request?” Authorization answers “Is this role permitted to perform this action?” Keeping those concepts separate was important during the access-control implementation and testing.

## 4.4.6 Testing stack

The backend uses xUnit and WebApplicationFactory for automated tests. The test environment uses EF Core InMemory rather than a live PostgreSQL server.

This distinction is documented deliberately. InMemory testing provides useful isolation and fast execution, but it does not reproduce every PostgreSQL behavior. Consequently, automated tests and manual end-to-end verification against PostgreSQL serve different purposes.

## 4.4.7 CI and source control

Git provides source history and GitHub provides repository hosting and project-management capabilities. GitHub Actions runs backend tests and frontend type-check/build checks on pushes to the main branch.

This introduces a basic continuous-integration discipline: changes are not evaluated only on the developer's machine. The repository has an automated mechanism for detecting certain classes of build and test failure.

## 4.4.8 Stack as an engineering system

The technologies are most useful when considered together. React handles interaction; ASP.NET Core handles server-side workflow and authorization; EF Core and Npgsql connect application operations to PostgreSQL; Identity and JWT provide identity boundaries; xUnit and WebApplicationFactory provide automated verification; GitHub Actions provides repeatability.

No individual technology solves the project's clinical workflow problem. The engineering result comes from how the technologies are combined around the requirements.

## 4.4.9 Version-awareness

Technology versions are important in a report because “React” or “ASP.NET Core” alone is not enough to reproduce an implementation. The project documentation therefore records versions from the live manifests.

This also prevents a common documentation error: describing what a framework generally supports rather than what the project actually used.

## 4.4.10 Limitations

The stack remains intentionally modest. It does not include a dedicated message broker, distributed cache, search platform, enterprise integration engine, BI platform, or FHIR server. Those omissions are consistent with the project's scope.

The absence of such technologies should not be interpreted as a missing requirement. The internship focused on patient management, longitudinal charting, and appointment workflow, with supporting security and testing capabilities.
