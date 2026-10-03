# 4.18 Architecture Decisions and Trade-offs

## 4.18.1 Purpose

Architecture decisions record not only what was selected but why it was selected and what was consciously not selected.

The repository includes an Architecture Decision Record explaining why important decisions should be documented rather than left in chat or developer memory. The report extends that principle by examining the major engineering trade-offs of the implemented MVP.

## 4.18.2 Modular monolith instead of microservices

### Decision

Use a layered modular monolith.

### Reason

OCR has a bounded scope, one primary relational database, a short internship timeline, and no requirement for independent deployment of individual modules.

### Benefit

The architecture remains understandable while still separating major responsibilities.

### Trade-off

The application does not provide the independent scaling and deployment boundaries associated with microservices.

### Assessment

Appropriate for the internship scope.

## 4.18.3 PostgreSQL instead of a simpler file-based store

### Decision

Use PostgreSQL.

### Reason

The domain is relational and includes multiple related entities, lifecycle state, event history, and transactional operations.

### Benefit

Strong relational modeling, constraints, querying, and durable persistence.

### Trade-off

The developer must configure and manage a database server rather than relying on a simple embedded file.

### Assessment

The additional complexity is justified by the domain.

## 4.18.4 EF Core instead of handwritten persistence everywhere

### Decision

Use EF Core with Npgsql.

### Reason

The project is implemented in C# and requires structured entity relationships and schema migrations.

### Benefit

Productivity, typed persistence access, migrations, and consistent database integration.

### Trade-off

ORM behavior must be understood, especially around queries, transactions, provider differences, and testing.

### Assessment

Appropriate, with the important caveat that InMemory tests do not reproduce all PostgreSQL behavior.

## 4.18.5 Service layer instead of controller-heavy logic

### Decision

Place application workflow in named services.

### Reason

Appointment transitions, clinical finalization, deceased status, and longitudinal records require coordinated business rules.

### Benefit

Centralized workflow logic, clearer responsibilities, and stronger test targets.

### Trade-off

More classes and indirection than a simple CRUD controller.

### Assessment

The additional structure is justified because OCR is workflow-driven.

## 4.18.6 JWT and role-based authorization

### Decision

Use Identity plus JWT Bearer authentication and role/policy authorization.

### Reason

The frontend and API are separate layers and the server must independently enforce staff permissions.

### Benefit

Clear authentication boundary and testable role matrix.

### Trade-off

Token configuration, lifecycle, and production security require careful management.

### Assessment

Appropriate for the implemented API architecture.

## 4.18.7 Longitudinal visits instead of overwriting patient records

### Decision

Represent clinical attendance as separate ClinicalVisit records.

### Reason

Clinical history is chronological and previous visits must remain distinguishable.

### Benefit

Preserves historical continuity and makes visit-level state possible.

### Trade-off

Queries and UI must navigate multiple visits rather than reading one large patient record.

### Assessment

Essential to the EMR domain model.

## 4.18.8 Simplified finalization instead of formal amendment workflow

### Decision

Final visits are not reopened through the ordinary editing workflow; new clinical content is represented through a new visit.

### Reason

The internship did not have enough scope for a full amendment/versioning subsystem.

### Benefit

Simple lifecycle boundary and lower implementation complexity.

### Trade-off

The model is less expressive than mature clinical amendment workflows.

### Assessment

Acceptable MVP simplification, explicitly documented as a limitation.

## 4.18.9 InMemory automated tests plus PostgreSQL E2E

### Decision

Use EF Core InMemory for fast automated backend tests and PostgreSQL for manual E2E verification.

### Reason

Fast isolated tests were valuable during the internship, while final database behavior still needed verification against the intended provider.

### Benefit

Fast feedback plus real-database verification.

### Trade-off

Not all database-specific behaviors are covered automatically.

### Assessment

Useful internship compromise, but a production project should add automated PostgreSQL integration tests.

## 4.18.10 ADR practice

The repository's ADR approach records context, decision, alternatives, consequences, and evidence/references.

This is valuable because architecture changes over time. A future developer should be able to understand why a simpler choice was made rather than assuming the absence of a technology was accidental.

## 4.18.11 Overall trade-off assessment

The architecture consistently favors proportionate complexity.

The project does not claim that the selected choices are universally superior. They are appropriate because they fit the requirements, development period, team size, and demonstrated scope.

This is an important engineering distinction: good architecture is contextual.
