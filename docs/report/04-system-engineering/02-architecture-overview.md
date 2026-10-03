# 4.2 Architecture Overview

## 4.2.1 Architectural style

Open Clinical Record uses a layered, modular monolithic architecture. The system is deployed and developed as one application composed of a browser frontend and an ASP.NET Core backend, with PostgreSQL providing persistent storage. Internally, the backend separates HTTP controllers from application services and persistence concerns.

The choice was driven by the actual problem size. OCR needed clear boundaries between presentation, business logic, authentication, and data access, but it did not need independent service deployment, message brokers, service discovery, distributed tracing, or multiple independently scaled databases. A modular monolith therefore provided architectural separation without introducing infrastructure that the project could not justify.

## 4.2.2 Logical architecture

```text
User
 │
 ▼
React UI
 │
 │ HTTP/JSON + JWT
 ▼
ASP.NET Core API
 │
 ├── Authentication / Authorization
 │
 ├── Controllers
 │
 ├── Application Services
 │     ├── PatientService
 │     ├── AppointmentWorkflowService
 │     ├── ClinicalChartService
 │     ├── DashboardService
 │     └── AuditService
 │
 └── Entity Framework Core / Npgsql
       │
       ▼
   PostgreSQL
```

The controller layer is deliberately thin. Controllers represent HTTP endpoints and delegate substantial work to application services. This reduces the risk of business rules becoming duplicated across endpoints.

## 4.2.3 Request lifecycle

A typical request follows the sequence below:

1. A staff member performs an action in the React interface.
2. The frontend sends an HTTP request to the API.
3. JWT authentication identifies the caller.
4. Authorization policies determine whether the role may perform the operation.
5. The controller receives the request and maps it to an application operation.
6. The relevant service validates business conditions and coordinates changes.
7. Entity Framework Core translates persistence operations to PostgreSQL through Npgsql.
8. The result is returned through the API.
9. The frontend updates the relevant view and communicates success or failure to the user.

For a clinical workflow, the important part is that steps 4–7 do not depend on the frontend being trustworthy. A client can hide an action for usability, but the server remains the final enforcement point.

## 4.2.4 Data flow example: appointment check-in

The check-in workflow illustrates why the architecture is more than a set of technology names.

```text
Receptionist selects patient
        ↓
Frontend sends check-in request
        ↓
JWT authentication
        ↓
Appointment controller
        ↓
AppointmentWorkflowService
        ↓
Validate appointment state / patient state
        ↓
Create or associate Draft ClinicalVisit
        ↓
Persist changes through EF Core
        ↓
PostgreSQL
        ↓
API response
        ↓
Queue / appointment UI refresh
```

This flow keeps the workflow decision in the backend service instead of making the React page responsible for deciding whether a clinical visit should exist.

## 4.2.5 Data flow example: clinical finalization

Clinical documentation follows another important path:

```text
Doctor opens active visit
        ↓
Chart data requested
        ↓
ClinicalChartService
        ↓
Patient + visit + clinical data loaded
        ↓
Doctor records / reviews documentation
        ↓
Validation
        ↓
Finalize visit
        ↓
Final visit becomes immutable by normal editing flow
        ↓
Appointment can be completed
        ↓
Audit / event information recorded where applicable
```

The exact workflow is governed by the domain rules documented in Phase 03. The architecture exists to make those rules enforceable.

## 4.2.6 Why not microservices?

Microservices were not necessary for the internship scope. The system had one bounded application, a small development period, one primary relational database, and no requirement for independent deployment or scaling of individual clinical modules.

A microservice decomposition could theoretically separate patients, appointments, clinical visits, and audit into different services. However, that would introduce distributed transactions and network failure modes precisely where OCR benefits from straightforward transactional consistency. It would also require additional operational tooling and documentation.

The selected architecture therefore represents a deliberate trade-off: strong internal separation with relatively low operational complexity.

## 4.2.7 Architecture qualities

| Quality | How the architecture addresses it | Remaining limitation |
|---|---|---|
| Maintainability | Named services and layered responsibilities | Some areas remain MVP-sized |
| Testability | Backend service/API boundaries | Frontend UI automation is limited |
| Security | JWT + server-side authorization | Production hardening would require more controls |
| Integrity | Relational model and workflow services | Some concurrency cases remain |
| Extensibility | Modular services and explicit domain entities | No multi-facility architecture |
| Simplicity | Single backend deployment model | Less independently scalable than microservices |
| Traceability | Requirements and technical documentation | More automated traceability could be added |

## 4.2.8 Architectural boundary and future growth

The architecture leaves room for future development without claiming that future capabilities already exist. A laboratory module, for example, could become another bounded application area while continuing to use shared identity and carefully defined interfaces. Interoperability could later be added at the API/integration boundary. More sophisticated reporting could be introduced without changing the fundamental Patient → Visit longitudinal model.

The important design principle is that future growth should follow explicit requirements rather than adding technology simply because it is available.
