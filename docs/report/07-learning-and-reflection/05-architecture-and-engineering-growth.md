# 7.5 Architecture and Engineering Growth

## Architecture as responsibility

The internship improved understanding of architecture as a division of responsibility rather than merely a technology stack.

OCR separates React/Vite/TypeScript presentation, ASP.NET Core API, service-layer business logic, EF Core/Npgsql persistence, and PostgreSQL storage.

## Service-layer learning

A useful lesson was the role of a service layer in a workflow-heavy application. Controllers should not become the location for every business rule. Services provide clearer boundaries for patient, appointment workflow, clinical chart, dashboard, and audit responsibilities.

## Database engineering

The project reinforced relational modeling, foreign-key relationships, optional and one-to-many relationships, migration-based schema evolution, EF Core persistence, PostgreSQL integration, historical preservation, and state constraints.

Database correctness is not isolated from workflow. A schema supports the domain model, while application rules control valid transitions.

## Transactional integrity

The project raised practical questions about transactional integrity and ACID guarantees for clinically significant operations. It became clear that multi-step operations require careful consideration of what should succeed together, what should roll back on failure, and how concurrent operations can affect correctness.

The project did not fully harden concurrency-sensitive areas such as MRN generation and appointment conflict checking. Recognizing a problem is not the same as claiming it was completely solved.

## Security architecture

The internship strengthened the distinction between identity verification, role authorization, server-side enforcement, client-side experience, business-rule validation, and auditability.

## Architecture trade-offs

The project used a modular monolithic architecture rather than distributed services. For a one-month internship MVP, this reduced operational complexity and kept related workflow logic close together.

The lesson is not that one architecture is universally superior. Architecture should fit scope, operational context, team capacity, and expected evolution.

## Evidence

**Figure 7.8 — Final architecture**

Capture the architecture diagram at readable resolution. It must include browser/frontend, ASP.NET Core API, service/business logic, EF Core/Npgsql, PostgreSQL, and request/data-flow arrows.

**Figure 7.9 — Service-layer implementation**

Capture genuine code showing a representative service with meaningful business logic. Include repository path, class name, relevant method, and enough surrounding code. No secrets.

**Figure 7.10 — Migration/schema evidence**

Capture a real EF Core migration or schema configuration demonstrating a relationship or constraint discussed in the report.

## Reflection

Clean boundaries make reasoning easier. The goal is not architectural complexity; it is making responsibilities understandable and testable.