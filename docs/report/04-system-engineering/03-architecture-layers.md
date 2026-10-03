# 4.3 Architecture Layers and Responsibility Boundaries

## 4.3.1 Layering as a control mechanism

Layering in OCR is used to control responsibility. A layer is useful only when it answers a practical question: where should a particular decision or transformation live?

The implementation separates presentation, HTTP transport, application workflow, persistence, and database responsibilities. This reduces the tendency for controllers to become large blocks of business logic or for frontend components to contain rules that should be enforced by the server.

## 4.3.2 Presentation layer

The presentation layer is implemented with React, TypeScript, Vite, and React Router. Its responsibilities include:

- rendering pages and reusable components;
- presenting patient, appointment, chart, and dashboard information;
- collecting user input;
- providing navigation;
- displaying validation and operation results;
- adapting visible actions to the authenticated user's role.

The frontend should not be treated as the authoritative source of business rules. A hidden button improves the user experience, but it does not constitute authorization.

## 4.3.3 API/controller layer

ASP.NET Core controllers expose HTTP endpoints. Their responsibility is primarily transport-oriented:

- receive HTTP requests;
- bind request data;
- invoke application services;
- return appropriate HTTP responses;
- participate in authentication and authorization;
- avoid embedding large workflow algorithms.

This makes controller code easier to understand because a request can usually be traced to a named service operation.

## 4.3.4 Application/service layer

The service layer is the main application workflow boundary. The implemented documentation identifies:

| Service | Primary responsibility |
|---|---|
| PatientService | Patient-related operations and patient lifecycle actions |
| AppointmentWorkflowService | Appointment transitions, check-in, rescheduling and workflow rules |
| ClinicalChartService | Clinical visit/chart operations |
| DashboardService | Dashboard-level aggregate information |
| AuditService | Recording/retrieving important audit activity |

The service layer is especially important because OCR is not merely CRUD. Operations such as check-in, finalization, deceased-status changes, and appointment transitions involve conditions that depend on the current state of multiple records.

## 4.3.5 Persistence layer

Entity Framework Core provides the persistence abstraction. Npgsql connects EF Core to PostgreSQL.

The persistence layer handles:

- entity mapping;
- database queries;
- inserts and updates;
- relationships;
- migrations;
- transaction participation where required.

The project treats EF Core migrations as the authoritative database schema evolution mechanism. The repository also contains a reference SQL document, but the technical documentation explicitly notes that it may lag behind the latest migrations.

## 4.3.6 Database layer

PostgreSQL provides durable relational storage. This is appropriate for OCR because the domain contains clear relationships:

```text
Patient
  ├── Appointments
  └── ClinicalVisits
        ├── VitalSigns
        ├── Diagnoses
        └── ClinicalNotes
```

The relational model also supports constraints and transactional operations that are important for patient and appointment data.

## 4.3.7 Cross-cutting concerns

Some capabilities cross multiple layers:

- authentication;
- authorization;
- validation;
- audit logging;
- error handling;
- configuration;
- testing;
- logging.

For example, authorization begins with authentication of the user, is represented in the JWT, is evaluated by backend policies, and is also reflected in frontend visibility. Audit information may be generated as part of service operations and persisted through the data layer.

## 4.3.8 Why this boundary matters

Consider the rule “a deceased patient cannot receive a new appointment.” If that rule were implemented only in the React appointment form, a user could bypass it by calling the API directly. If it were implemented independently in several controllers, different endpoints could eventually disagree.

By placing the rule in the application workflow, the system obtains one central location for the business decision. The UI can mirror the rule, but the server remains authoritative.

## 4.3.9 Layer interaction table

| Operation | UI | Controller | Service | EF Core | PostgreSQL |
|---|---|---|---|---|---|
| Register patient | Input/form | Patient endpoint | PatientService | Insert | Store |
| Search patient | Search controls | Patient endpoint | PatientService | Query | Read |
| Book appointment | Booking form | Appointment endpoint | AppointmentWorkflowService | Insert/update | Store |
| Check in | Queue action | Appointment endpoint | AppointmentWorkflowService | Transactional changes | Store |
| Record vitals | Chart form | Chart endpoint | ClinicalChartService | Insert/update | Store |
| Finalize visit | Finalize action | Chart endpoint | ClinicalChartService | Update | Store |
| View dashboard | Dashboard page | Dashboard endpoint | DashboardService | Aggregate query | Read |
| View audit | Admin page | Audit endpoint | AuditService | Query | Read |

## 4.3.10 Consequences

The layered design increases the amount of explicit structure compared with placing all logic in controllers. That is a cost. For a very small prototype, it could appear unnecessary.

For OCR, however, the structure paid off because the project had stateful workflows, role boundaries, and longitudinal records. The architecture made those concepts visible in code and documentation and created clearer test targets.

The limitation is that the project is still an internship MVP. Not every class or module represents a fully mature enterprise architecture. The goal was appropriate separation and clarity, not architectural maximalism.
