# 8.5 System Design and Architecture

Synthesize Phase 04 into one coherent engineering chapter.

## Architecture overview

Present the React/Vite/TypeScript → ASP.NET Core → service layer → EF Core/Npgsql → PostgreSQL architecture.

## Technology selection

Explain why the selected technologies fit the internship scope, maintainability goals, and relational workflow requirements.

## Backend and data design

Discuss controllers, services, business rules, persistence, validation, authorization, and the conceptual entities Patient, Appointment, AppointmentEvent, ClinicalVisit, VitalSigns, Diagnosis, ClinicalNote, PatientDeathRecord, and AuditEvent. State that migrations/schema are authoritative for implementation details.

## Authentication and frontend architecture

Explain Identity/JWT, role boundaries, backend enforcement, frontend role-aware behavior, routes, application areas, API integration, auth state, forms, patient chart, appointment workflow, and dashboard.

## Security and record integrity

Cover authentication, authorization, validation, CORS, configuration/secrets, error handling, auditability, longitudinal preservation, finalization, appointment history, deceased status, and transactional-integrity considerations.

## Architecture trade-offs

Discuss modular monolith, service layer, PostgreSQL, JWT, simplified finalization, and test-environment trade-offs.

**Figure 8.6 — System architecture**

Use a high-resolution final architecture diagram.

**Figure 8.7 — Conceptual ERD**

Use the report ERD with a note that implementation migrations remain authoritative.

**Figure 8.8 — Authorization boundary**

Show frontend role-aware controls and backend authorization as separate enforcement layers.

**Table 8.4 — Technology stack**

Technology, version, purpose, and evidence.

**Table 8.5 — Architecture decisions**

Decision, alternative, rationale, consequence, and status.