# 4.6 Backend Architecture

## 4.6.1 Backend responsibilities

The OCR backend is an ASP.NET Core 8 Web API. It provides the authoritative server-side boundary for application behavior.

Its responsibilities include:

- exposing REST endpoints;
- authenticating requests;
- enforcing authorization policies;
- validating application operations;
- applying workflow/business rules;
- reading and writing persistent data;
- producing audit information where applicable;
- returning structured responses and appropriate errors.

The backend is therefore more than a transport layer between React and PostgreSQL.

## 4.6.2 Controller design

Controllers expose API operations and coordinate request handling. The project deliberately uses thin controllers.

A conceptual controller flow is:

```text
HTTP Request
    ↓
Authentication / Authorization
    ↓
Controller
    ↓
Application Service
    ↓
Persistence
    ↓
HTTP Response
```

This avoids placing complex appointment or clinical logic directly inside controller methods.

For example, an appointment-status endpoint should not need to independently reconstruct every allowed transition. The appointment workflow service provides a central place to evaluate the current state and requested transition.

## 4.6.3 Application services

The backend technical documentation identifies five major application services:

### PatientService

Handles patient-related operations and lifecycle-sensitive actions. It participates in rules around registration, updates, patient lookup, and deceased status.

### AppointmentWorkflowService

Coordinates appointment creation and state transitions, including check-in, cancellation, rescheduling, and workflow validation.

### ClinicalChartService

Coordinates patient chart and longitudinal clinical-visit operations, including clinical documentation and finalization.

### DashboardService

Provides dashboard-oriented aggregate information without forcing the frontend to reconstruct system-wide statistics from multiple raw API calls.

### AuditService

Provides access to and management of important audit activity.

## 4.6.4 Dependency flow

The intended dependency direction is:

```text
Controller
   ↓
Application Service
   ↓
Data / EF Core
   ↓
PostgreSQL
```

The frontend is outside this dependency chain and communicates through HTTP.

This arrangement has an important consequence: business rules are not tied to a particular page. If another client were added later, it could use the same server-side rules through the API.

## 4.6.5 Authentication pipeline

A protected request is conceptually processed as:

1. Request arrives at the API.
2. JWT Bearer authentication attempts to identify the caller.
3. If no valid identity is established, the protected endpoint returns an authentication failure.
4. If authenticated, role/policy authorization is evaluated.
5. If the role is not allowed, the request is rejected.
6. If authorized, the controller invokes the appropriate application service.

This distinction is visible in the project's access-control testing, where anonymous requests produce 401 responses and authenticated-but-disallowed role actions produce 403 responses.

## 4.6.6 Validation

Validation exists at multiple levels.

**Transport/input validation** checks whether submitted data has an acceptable structure.

**Business validation** checks whether the requested operation is valid for the current system state.

For example, an appointment request may be syntactically valid but still invalid because the patient is deceased or the requested transition is not permitted from the appointment's current status.

This separation prevents a common mistake in CRUD-oriented systems: assuming that valid input automatically means valid business behavior.

## 4.6.7 Error handling

The technical documentation specifies that persistence failures return a generic client-facing message and HTTP 500 while database exception details remain in server logs.

This is important because database exception details can expose implementation information that should not be sent directly to ordinary clients.

Error handling in an MVP does not mean every failure has a perfect domain-specific response. It means the application distinguishes client-facing information from internal diagnostic information and avoids leaking raw persistence failures.

## 4.6.8 Transactional integrity

Clinical and workflow operations can affect multiple records. For example, check-in can involve appointment state and clinical-visit creation. Finalization can affect the visit and linked appointment state.

The engineering goal is to maintain appropriate transactional integrity so that related changes do not leave the database in an unintended intermediate state.

This is also an area where the internship exposed a practical difficulty: understanding ACID behavior is not the same as simply knowing the acronym. The developer must reason about which operations belong together, what must be atomic, and what can safely occur independently.

## 4.6.9 Backend evidence

The repository contains automated access-matrix tests and workflow tests, as well as technical documentation describing the service architecture. These artifacts provide evidence that authorization and workflow concerns were implemented at the backend boundary.

The backend should nevertheless be considered an internship-scale implementation. The repository documents remaining concurrency limitations, including MRN generation and appointment conflict checks that are not fully concurrency-hardened.

## 4.6.10 Backend engineering lesson

The most important backend lesson was that the service layer became the natural place where domain understanding turned into executable behavior. Once the project had defined patient, appointment, and clinical-visit states, the backend could implement those concepts directly rather than scattering them across UI screens.

This made the system easier to reason about and made testing more meaningful because tests could target workflows rather than only individual database operations.
