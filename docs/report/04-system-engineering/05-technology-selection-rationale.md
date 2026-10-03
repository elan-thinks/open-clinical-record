# 4.5 Technology Selection Rationale

## 4.5.1 Selection principle

Technology selection for OCR was constrained by time, scope, maintainability, learning value, and fit with the domain. The objective was to choose a stack capable of supporting the complete software-development lifecycle within the internship rather than selecting the largest possible collection of enterprise technologies.

A technology was considered useful when it solved a concrete project problem. This prevented the system from expanding merely because additional technologies were available.

## 4.5.2 Frontend decisions

### React

React was selected because OCR contains repeated workflow elements: patient lists, forms, appointment queues, chart sections, dashboard cards, and role-dependent actions. A component model supports reuse and consistent interaction patterns.

### TypeScript

TypeScript adds static type information to the frontend. OCR exchanges structured patient, appointment, visit, and status data with the API, so explicit types make those structures easier to understand and reduce some classes of client-side mismatch.

### Vite

Vite provides the development and production build workflow. Its role remains focused on tooling rather than application business logic, which keeps the frontend architecture easier to reason about.

## 4.5.3 Backend decisions

### ASP.NET Core

ASP.NET Core was selected for the API because it provides routing, dependency injection, authentication, authorization, configuration, and testing support within one backend framework. This was a practical fit for an internship project implemented with C#.

### Application services

The backend uses named application services rather than placing substantial workflow logic directly inside controllers. This decision follows from the domain: appointment transitions, clinical finalization, deceased status, and role-sensitive operations require coordinated business decisions.

## 4.5.4 Database decisions

### PostgreSQL

PostgreSQL fits the strongly relational nature of the system. Patients, appointments, clinical visits, vital signs, diagnoses, notes, events, and audit records have meaningful relationships and require durable storage.

Relational storage also supports foreign keys, constraints, transactions, and structured querying.

### Entity Framework Core and Npgsql

EF Core provides the object-relational mapping layer, while Npgsql provides PostgreSQL connectivity. Together they allow the C# application model to work with relational persistence without making every application operation dependent on handwritten SQL.

EF Core migrations are treated as the authoritative mechanism for schema evolution in the project.

## 4.5.5 Authentication decisions

ASP.NET Core Identity was used for user and role management, while JWT Bearer authentication provides the API authentication mechanism.

This combination fits the separated React/API architecture. The API can validate a caller's token and apply role policies independently of what the browser chooses to display.

## 4.5.6 Testing decisions

xUnit was selected for automated backend tests, with WebApplicationFactory supporting application-level testing.

The automated test environment uses EF Core InMemory. This provides fast, isolated tests, but it is not identical to PostgreSQL. The project therefore treats manual end-to-end verification against PostgreSQL as a complementary testing activity.

## 4.5.7 Decision and trade-off table

| Decision | Selected technology/approach | Reason | Trade-off |
|---|---|---|---|
| UI framework | React | Reusable workflow components | Requires disciplined component structure |
| UI language | TypeScript | Explicit data structures | Adds typing overhead |
| Build tool | Vite | Fast development/build cycle | Adds another frontend tool to maintain |
| API | ASP.NET Core 8 | Integrated web/security/testing facilities | Requires .NET-specific knowledge |
| ORM | EF Core 8 | Productivity and migrations | ORM behavior must still be understood |
| Database | PostgreSQL | Strong relational fit | Requires database administration |
| Authentication | Identity + JWT | Role-aware API security | Token configuration requires care |
| Testing | xUnit + WebApplicationFactory | Application-level backend tests | Frontend automation remains limited |
| Architecture | Layered modular monolith | Appropriate scope | Less independently deployable than microservices |

## 4.5.8 Technologies deliberately excluded

The project did not introduce microservices, a FHIR server, an AI clinical decision-support subsystem, a dedicated analytics platform, or an enterprise integration engine.

These technologies may be appropriate in larger healthcare systems, but they were outside the internship's justified scope. Adding them would have increased implementation and operational complexity without directly improving the three agreed core capabilities.

## 4.5.9 Engineering reflection

The strongest lesson from technology selection was that a responsible engineering choice is not necessarily the most sophisticated choice. The selected stack was sufficient to demonstrate requirements analysis, architecture, implementation, security, testing, documentation, and presentation while keeping the application understandable.

The selection also reinforced the importance of matching technology to domain needs. PostgreSQL was useful because the data was relational; service-layer architecture was useful because the workflow was stateful; JWT and role policies were useful because access differed by staff role. Each decision can therefore be traced back to a project requirement or engineering constraint.
