# 4.8 API Design

## 4.8.1 Purpose of the API

The OCR API is the boundary between the React client and the server-side application. It exposes resources and workflow operations through HTTP/JSON while keeping business rules on the backend.

The API is therefore designed around the application's domain rather than simply exposing database tables.

## 4.8.2 Main API areas

The implemented technical documentation identifies the following API areas:

| Area | Representative operations |
|---|---|
| Authentication | Login |
| Patients | List, create, update, deceased-state operations |
| Appointments | List, create, status transition, reschedule |
| Chart | Patient chart and clinical-visit operations |
| Dashboard | Operational statistics |
| Audit | Administrative audit retrieval |
| Health | Health/readiness checks |

Representative routes documented by the project include `POST /api/auth/login`, `GET/POST /api/patients`, appointment status/reschedule operations, patient-chart routes, `GET /api/dashboard/stats`, and administrative audit access.

These paths are presented here as representative API surface rather than as an exhaustive endpoint catalogue.

## 4.8.3 Resource-oriented design

The API distinguishes major resources:

- patients;
- appointments;
- clinical chart/visits;
- dashboard information;
- audit information.

This mirrors the conceptual model established during requirements analysis.

A patient is not an appointment. An appointment is not a clinical visit. Keeping those resources conceptually distinct prevents the API from collapsing the workflow into one large record.

## 4.8.4 Workflow endpoints

Some operations are naturally represented as workflow actions rather than generic updates. Examples include:

- changing appointment status;
- rescheduling;
- marking a patient deceased;
- clearing deceased status;
- finalizing clinical documentation.

These operations represent business decisions, so the API surface makes the workflow explicit instead of exposing an unrestricted “set every field” endpoint.

## 4.8.5 Authentication and authorization at the API

Protected API requests require authentication. Role-based authorization is then applied to determine whether the authenticated role may perform the requested operation.

The access-control report provides concrete verification examples:

- anonymous access to protected patient operations returns 401;
- a nurse attempting to mark a patient deceased returns 403;
- a doctor can mark a patient deceased;
- a desk user attempting a clinical visit creation is denied;
- a nurse can create a clinical visit.

This distinction demonstrates that authorization is enforced server-side rather than being only a frontend presentation rule.

## 4.8.6 Request validation

API validation must distinguish between malformed input and invalid workflow state.

For example:

- an empty cancellation reason is invalid;
- creating an appointment for a deceased patient is rejected;
- an invalid appointment transition is rejected;
- unauthorized roles are rejected independently of the request's data validity.

This makes validation part of the application contract rather than merely a frontend convenience.

## 4.8.7 Response semantics

The project uses HTTP status codes to communicate broad outcome categories. The documented access-control tests demonstrate 401 and 403 behavior, while normal creation and successful operations use successful response codes such as 201 and 200 where appropriate.

A useful API contract should allow the frontend to distinguish:

1. unauthenticated request;
2. authenticated but unauthorized request;
3. invalid business request;
4. successful operation;
5. unexpected server/persistence failure.

This distinction improves both debugging and user feedback.

## 4.8.8 Error information

The API avoids returning raw database exception details to ordinary clients. The technical documentation states that persistence failures produce a generic client message while diagnostic details remain in server-side logs.

This is an important security and maintainability boundary. Clients need actionable information, but they generally do not need database schema, SQL, or internal exception details.

## 4.8.9 API configuration

The frontend obtains the backend base address through `VITE_API_BASE_URL`, with a documented development default of `http://localhost:5000`.

CORS configuration permits the frontend development origin in the local environment.

Configuration through environment/application settings keeps deployment-specific information out of the application logic.

## 4.8.10 Health endpoints

The API includes health/readiness endpoints. These provide a basic operational mechanism for determining whether the backend is responding and whether the application is ready.

For an internship MVP, this is a useful operational feature because it separates “the process is reachable” from application-level functionality.

## 4.8.11 API design and frontend independence

The React application is one client of the API, not the authority over the domain. This makes the architecture more resilient to future clients.

For example, an administrative script or another frontend could call the API, and the backend would still evaluate authentication, authorization, validation, and workflow rules.

This is particularly important for an EMR because direct API access cannot be assumed to come only from the intended user interface.

## 4.8.12 API limitations

The API is intentionally scoped to the internship MVP. It does not provide a FHIR exchange layer, laboratory/radiology/pharmacy APIs, multi-facility enterprise scheduling, or patient-portal services.

The API therefore represents the boundary of the implemented product, not a claim of complete healthcare interoperability.

## 4.8.13 Engineering lesson

API design became clearer once the domain model was separated into Patient, Appointment, and ClinicalVisit. Instead of asking “What CRUD endpoints should the application have?”, the design could ask “What operations does the workflow require, and which state changes should the server own?”

That change in thinking reduced ambiguity and made the API better aligned with the actual system behavior.
