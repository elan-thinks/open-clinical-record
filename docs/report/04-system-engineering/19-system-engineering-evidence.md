# 4.19 System Engineering Evidence

## 4.19.1 Purpose

A serious internship report must demonstrate that the architecture described in previous sections corresponds to actual engineering work. This section defines the evidence that should be attached or referenced rather than relying only on prose.

## 4.19.2 Evidence categories

| Evidence category | Examples |
|---|---|
| Architecture | Architecture diagram, project structure, ADR |
| Requirements | SRS, functional/non-functional requirements |
| Data | ERD, migrations, data model documentation |
| Backend | Controllers, services, API documentation |
| Frontend | Screenshots, route/page evidence, UI implementation |
| Security | Access-control matrix and test results |
| Testing | xUnit results, CI runs, E2E checklist |
| Workflow | Appointment/visit state diagrams |
| Deployment | Run instructions, configuration, health endpoints |
| Source history | Git commits and repository history |

## 4.19.3 Recommended report figures

The final report should include figures such as:

1. high-level OCR architecture;
2. layered backend architecture;
3. request lifecycle;
4. Patient–Appointment–ClinicalVisit relationship;
5. ERD;
6. appointment state machine;
7. clinical visit state machine;
8. authentication/authorization flow;
9. frontend navigation structure;
10. CI/testing flow.

Each figure should have a number, descriptive caption, source/evidence reference, and discussion in the surrounding text.

## 4.19.4 Recommended screenshots

Screenshots should be selected as evidence rather than decoration.

Recommended screenshots include:

- login screen;
- dashboard;
- patient list;
- patient registration;
- patient detail/chart;
- appointment scheduling;
- appointment queue;
- clinical visit documentation;
- role-specific UI;
- user management;
- audit view;
- successful and rejected workflow examples where appropriate.

Sensitive or unnecessary personal information should not appear in report screenshots. Development/test data should be used.

## 4.19.5 Test evidence

Testing evidence should include:

- automated test execution result;
- access-control test result;
- appointment workflow test result;
- longitudinal visit test;
- finalization test;
- CI success evidence;
- manual E2E checklist.

The report should state the test environment for every result, especially whether the test used EF Core InMemory or PostgreSQL.

## 4.19.6 Requirements traceability

System-engineering evidence should connect back to requirements.

A useful chain is:

Requirement → Architecture decision → Implementation → Test → Evidence.

For example:

Patient lifecycle rule → service-layer validation → deceased-status endpoint → authorization/workflow test → test report/screenshot.

This makes the report auditable rather than descriptive only.

## 4.19.7 Evidence register

| Evidence ID | Evidence | Supports |
|---|---|---|
| SE-01 | Architecture diagram | Overall architecture |
| SE-02 | Technical documentation | Stack and runtime structure |
| SE-03 | ADR 0001 | Architectural decision process |
| SE-04 | ERD/migrations | Data model |
| SE-05 | Access-control report | Authentication/authorization |
| SE-06 | Automated test project | Backend quality |
| SE-07 | E2E checklist | Full workflow verification |
| SE-08 | GitHub Actions workflow | CI |
| SE-09 | Final UI screenshots | Frontend implementation |
| SE-10 | Git history | Development progression |

## 4.19.8 Evidence quality rules

Evidence should be:

- dated where possible;
- tied to a repository path or artifact;
- clearly labeled as implemented, planned, or future;
- reproducible where practical;
- interpreted rather than pasted without explanation.

Screenshots alone are weak evidence. A screenshot becomes useful when the report explains which requirement it demonstrates and what behavior should be visible.

## 4.19.9 What should not be claimed

The report should not claim:

- production deployment if only local/CI infrastructure exists;
- FHIR interoperability;
- enterprise multi-facility support;
- formal healthcare compliance certification;
- complete production security;
- complete frontend automated testing;
- full concurrency hardening.

The project's limitations are part of the engineering evidence because they demonstrate accurate understanding of the implemented boundary.

## 4.19.10 Phase 04 completion standard

Phase 04 should be considered complete only when the final report contains enough evidence to answer:

1. What architecture was implemented?
2. Why was it chosen?
3. Where does business logic live?
4. How is data modeled?
5. How are users authenticated and authorized?
6. How does the frontend interact with the backend?
7. How was integrity protected?
8. How was the system tested?
9. How is the application configured and run?
10. What remains limited or future?

The answers should be supported by repository artifacts rather than relying on the author's memory.

## 4.19.11 Engineering reflection

The evidence-first approach also changes how the internship work is understood. Architecture is not merely a diagram created for presentation. It is visible in source structure, service boundaries, database migrations, tests, CI, and documented decisions.

That is the level of evidence the final Industrial Practice Report should aim to demonstrate.
