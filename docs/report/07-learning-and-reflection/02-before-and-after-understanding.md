# 7.2 Before-and-After Engineering Understanding

## Starting point

At the beginning, the project was understood primarily as an opportunity to build a simplified EMR application and practice the software-development lifecycle. The original task list was broad. The mentor subsequently reduced the scope to Patient Management, Patient Chart, and Appointment Management so the work could fit the one-month period.

This scope change demonstrated that professional projects are constrained by time and capacity and that reducing scope can protect deliverable coherence.

## Requirements thinking

The initial mental model was approximately:

Feature → Screen → Database operation

The project developed toward:

Problem → Domain concept → Workflow → Business rule → Requirement → Design → Implementation → Test → Evidence

The second model provided a stronger basis for decisions. Checking in a patient, for example, affects more than the visible interface.

## Architecture thinking

Architecture became a way of assigning responsibility. Controllers should remain relatively thin, business rules belong in services, persistence belongs behind the data-access boundary, and authorization must be enforced by the API rather than relying only on the interface.

The resulting architecture is:

React/Vite/TypeScript → ASP.NET Core REST API → service/business logic → EF Core/Npgsql → PostgreSQL

## Data-model thinking

A patient is not equivalent to a visit. The patient represents the longitudinal subject, while each attendance creates a separate clinical visit. This prevents a later encounter from overwriting historical information.

Likewise, an appointment represents scheduling and operational progress, while a clinical visit represents the record of attendance and clinical documentation.

## Security thinking

Security became broader than authentication. The project required authentication, role-based authorization, backend enforcement, frontend visibility, business-rule validation, auditability, configuration discipline, and generic error handling.

## Evidence

**Figure 7.2 — Before-and-after engineering model**

Create a two-column figure:
Before: Feature → Screen → CRUD
After: Problem → Domain → Workflow → Rule → Requirement → Design → Code → Test → Evidence

**Figure 7.3 — Scope evolution**

Capture the original broad internship scope beside the final focused MVP scope. Clearly label reduced, deferred, and excluded items.

## Remaining gap

Further development is still required in production deployment, concurrency hardening, advanced frontend automated testing, interoperability, formal security assessment, and larger-scale operations.