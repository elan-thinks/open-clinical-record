# 4.1 System Engineering Overview

## 4.1.1 Purpose of the engineering phase

The system-engineering phase translates the requirements and domain analysis documented in Phase 03 into an implementable software structure. For OCR, this was not simply a matter of selecting frameworks and beginning to code. The project had already established several constraints that directly affected engineering decisions: the application had to remain small enough for a one-month internship, clinical records had to remain longitudinal rather than being overwritten, different staff roles required different capabilities, and appointment and clinical-visit states had to remain consistent.

The engineering approach therefore treated architecture as a way of protecting the requirements. The principal question was not “Which technology is most advanced?” but “Which structure allows the required workflow to be implemented clearly, tested, documented, and extended without unnecessary complexity?”

The resulting implementation is a layered web application consisting of a React/Vite/TypeScript frontend, an ASP.NET Core 8 REST API, and a PostgreSQL database accessed through Entity Framework Core and Npgsql. Authentication uses ASP.NET Core Identity with JWT Bearer authentication, while authorization is enforced through role-based policies. Business workflow is concentrated in application services rather than being distributed across controllers and user-interface code.

## 4.1.2 Engineering objectives

The engineering work pursued the following objectives:

| Objective | Engineering response |
|---|---|
| Preserve domain integrity | Explicit workflow/state rules and service-layer validation |
| Separate responsibilities | Frontend, API, service, persistence, and database boundaries |
| Protect clinical operations | Authentication, role authorization, validation, and audit events |
| Preserve longitudinal history | Patient-to-ClinicalVisit model rather than replacing previous records |
| Keep implementation understandable | Layered modular architecture instead of premature distributed services |
| Support testing | Service boundaries, API tests, WebApplicationFactory, and manual E2E testing |
| Enable future extension | Named domain/application services and explicit scope boundaries |
| Support deployment reproducibly | Project manifests, migrations, environment configuration, and CI |

## 4.1.3 From requirements to architecture

The architecture can be understood as a chain of engineering consequences.

A requirement such as “a patient may have multiple visits” leads to a longitudinal data model. The data model leads to separate Patient and ClinicalVisit entities. Those entities require operations that enforce lifecycle rules. Those rules belong in application services rather than in a React component. The service operations are exposed through API controllers. The frontend consumes those APIs and presents the resulting workflow to users.

The same reasoning applies to authorization. The requirement that a nurse cannot mark a patient deceased is not adequately implemented by merely hiding a button. The frontend can improve usability by hiding unavailable actions, but the API must independently reject unauthorized requests. This produces a defense-in-depth boundary between presentation and server-side authorization.

## 4.1.4 Overall architecture

The implemented high-level architecture is:

```text
┌─────────────────────────────────────────────┐
│ Browser / User Interface                    │
│ React 19 + TypeScript + Vite + Router      │
└──────────────────────┬──────────────────────┘
                       │ JSON / HTTP
                       ▼
┌─────────────────────────────────────────────┐
│ ASP.NET Core 8 REST API                     │
│ Controllers → Application Services          │
│ JWT Authentication + Authorization          │
└──────────────────────┬──────────────────────┘
                       │ EF Core / Npgsql
                       ▼
┌─────────────────────────────────────────────┐
│ PostgreSQL                                  │
│ Relational clinical/operational data       │
└─────────────────────────────────────────────┘
```

The architecture is intentionally a modular monolith. The project did not require independent deployment of separate services, and introducing microservices would have added infrastructure and operational overhead without providing a demonstrated benefit for the internship-scale scope.

## 4.1.5 Engineering boundaries

The most important boundaries are:

1. **UI boundary** — presents workflows and collects user input.
2. **HTTP/API boundary** — authenticates requests, validates transport-level input, and maps operations to application services.
3. **Application/service boundary** — executes business rules and coordinates domain operations.
4. **Persistence boundary** — Entity Framework Core manages relational persistence.
5. **Database boundary** — PostgreSQL provides durable relational storage and database constraints.

A useful consequence is that a workflow rule does not have to be rewritten separately for every screen. For example, the rule preventing appointment creation for a deceased patient belongs to the application/business layer and therefore applies regardless of whether the request originated from one frontend page or another API client.

## 4.1.6 Evidence and implementation status

This phase is based on the implemented technical documentation and repository architecture. The project documentation identifies the application services `PatientService`, `AppointmentWorkflowService`, `ClinicalChartService`, `DashboardService`, and `AuditService). Automated backend tests and manual end-to-end testing provide additional evidence that the architecture was used as an implementation structure rather than remaining a design diagram.

The architecture should nevertheless be interpreted within the limits of the internship. It is an MVP architecture, not a production hospital enterprise architecture. Concurrency hardening, formal amendment workflows, multi-facility support, advanced reporting, and interoperability are documented as limitations or future work rather than being presented as completed capabilities.

## 4.1.7 Engineering lesson

The most important lesson from this phase was that architecture became easier after the requirements and workflow had been made explicit. Before that point, technologies could appear to be independent choices. After the domain model was defined, each technical boundary had a reason to exist.

This reinforced a central internship learning outcome: detailed analysis and documentation before implementation reduced ambiguity during coding and made later explanations, testing, and presentation substantially easier.
