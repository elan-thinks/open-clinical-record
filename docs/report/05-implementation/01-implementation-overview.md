# 5.1 Implementation Overview

## 5.1.1 Purpose of the Implementation Phase

The implementation phase translated the requirements, domain rules, architecture, and workflow decisions documented in the earlier phases into a working Open Clinical Record (OCR) application. The important characteristic of this phase is that implementation was not treated as a sequence of isolated screens. The application had to connect patient identity, appointments, check-in, clinical visits, clinical documentation, authorization, and historical record preservation into one coherent workflow.

The implementation therefore followed the engineering decisions established in the requirements and system-engineering phases. The final MVP was intentionally bounded around three primary capabilities: Patient Management, Patient Chart, and Appointment Management. Supporting capabilities included authentication, role-based authorization, user management, audit/event recording, dashboard information, validation, and automated testing.

> **Implementation status rule:** this chapter describes implemented behavior only when supported by repository evidence. Features documented as future work, planned enhancements, or out-of-scope functionality are not presented as completed implementation.

## 5.1.2 Implementation Approach

Development followed a layered approach:

1. establish the repository and development environment;
2. initialize the ASP.NET Core backend and React frontend;
3. configure PostgreSQL persistence through Entity Framework Core and Npgsql;
4. establish authentication and authorization;
5. implement patient management;
6. implement appointment workflow and check-in;
7. implement clinical visits and chart documentation;
8. connect the frontend to the REST API;
9. implement validation, audit/event recording, and dashboard behavior;
10. verify behavior using automated backend tests and manual end-to-end testing.

This sequence reduced the risk of building UI screens before the underlying domain model and workflow rules were stable.

## 5.1.3 Implementation Architecture

The implemented runtime follows the general chain:

`React + TypeScript + Vite → ASP.NET Core REST API → Application Services → EF Core/Npgsql → PostgreSQL`

The backend uses application services such as `PatientService`, `AppointmentWorkflowService`, `ClinicalChartService`, and `AuditService`. Controllers are kept comparatively thin so that business rules remain in application/service components rather than being duplicated across HTTP endpoints.

The frontend is responsible for presenting workflow state, collecting user input, providing immediate validation and role-aware interaction, and communicating with the API. The backend remains authoritative for authorization and business rules.

## 5.1.4 Implementation Evidence

The repository provides several forms of evidence for this phase:

| Evidence | What it demonstrates |
|---|---|
| Source code | Actual implementation structure and behavior |
| EF Core migrations | Evolution of the persistence model |
| Application services | Business logic and workflow implementation |
| Automated tests | Repeatable verification of selected backend behavior |
| Git history | Development progression and implementation changes |
| Technical documentation | Consolidated implementation and runtime decisions |
| Manual end-to-end testing | Verification against the PostgreSQL-backed application |

### [SCREENSHOT INSERT — Figure 5.1: Repository implementation structure]

**Capture:** GitHub repository tree showing the `src`, `tests`, `docs`, and configuration areas of the OCR repository.

**What must be visible:** repository name, major source directories, backend/frontend separation, tests directory, and documentation directory.

**Purpose in report:** Use this figure immediately after the implementation architecture discussion to demonstrate that the report is describing a real repository structure rather than a theoretical architecture.

**Suggested caption:** *Figure 5.1. Repository structure used to organize the OCR implementation.*

## 5.1.5 Engineering Significance

The main implementation lesson was that domain understanding had to precede feature completion. For example, implementing an appointment as a simple CRUD record would not have been sufficient because check-in, queue state, cancellation, rescheduling, and completion interact with the clinical visit lifecycle. Similarly, implementing a patient profile without preserving separate clinical visits would have weakened longitudinal history.

The implementation phase therefore represents the point at which earlier analysis became executable engineering constraints.

## 5.1.6 Implementation Limitations

The implementation remains an internship-scale MVP. It does not claim production hospital readiness. Known boundaries include limited concurrency hardening for MRN generation and appointment conflict checks, no formal post-final amendment workflow, basic rather than enterprise BI reporting, no multi-facility tenancy model, and limited automated frontend UI testing.

These limitations are important because a professional implementation report should distinguish between a functioning prototype/MVP and a production-grade healthcare information system.
