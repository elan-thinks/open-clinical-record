# 7. Testing and Quality Assurance

## 7.1 Purpose and quality perspective

Quality assurance for Open Clinical Record (OCR) was treated as verification of the system's actual workflow and constraints rather than as a count of successful button clicks. Because the application manages connected patient, appointment, and clinical-visit information, a feature can appear to work while still violating an important relationship between records. The testing approach therefore examined authentication, authorization, state transitions, longitudinal history, validation, persistence, and the relationship between appointment and clinical visit.

The testing evidence is synthesized from the project's automated backend tests, manual end-to-end checklist, CI configuration, requirements traceability matrix, and documented limitations. Claims in this chapter should be read together with the detailed QA material in Phase 06 of this report.

## 7.2 Test strategy

OCR used multiple complementary verification levels:

| Level | Purpose | Evidence |
|---|---|---|
| Backend automated tests | Verify service/API behavior and boundary conditions | xUnit, WebApplicationFactory |
| Access-control tests | Verify authentication and role restrictions | AccessMatrix tests |
| Workflow tests | Verify appointment and clinical state transitions | AppointmentWorkflow/clinical tests |
| Longitudinal tests | Verify repeat visits do not overwrite history | LongitudinalVisit tests |
| Manual end-to-end testing | Verify integrated browser/API/database workflow | E2E checklist |
| CI verification | Repeat build/test checks in GitHub Actions | Workflow runs |
| Source/configuration review | Check architecture and environment assumptions | Repository inspection |

No single level proves the entire system. Automated backend tests provide repeatability, while manual end-to-end testing verifies integrated behavior against the PostgreSQL-backed development environment.

## 7.3 Automated backend testing

The backend test suite uses xUnit and WebApplicationFactory. This provides a repeatable way to exercise application behavior through the ASP.NET Core application boundary.

A significant qualification is that automated tests use EF Core InMemory for database isolation. This improves speed and repeatability, but it is not equivalent to testing against PostgreSQL. Successful automated tests therefore demonstrate application behavior under the test database provider; they do not by themselves prove PostgreSQL-specific behavior, migration correctness, query-plan behavior, or concurrency behavior.

> **Figure 8.17 — Final automated test execution**
>
> **SCREENSHOT TO ADD HERE:** Run the project's documented automated test command from `tests/backend/OpenClinicalRecord.Api.Tests`: `dotnet test`. Capture the complete terminal result showing the command/path context, actual discovered/executed test summary, passed/failed/skipped counts exactly as produced, execution time if displayed, and the final successful result. Do not manually type test counts into the report.

## 7.4 Authentication and authorization testing

Access control was tested as a behavioral requirement. Representative scenarios include anonymous access to protected resources, role restrictions on sensitive operations, and separation between clinical writing and administrative operations.

| Scenario | Expected result |
|---|---|
| Anonymous request to protected patient data | HTTP 401 |
| Nurse attempts to mark a patient deceased | HTTP 403 |
| Doctor marks a patient deceased | Allowed |
| Doctor attempts to book for a deceased patient | Business-rule rejection |
| Receptionist attempts to create a clinical visit | HTTP 403 |
| Nurse creates a clinical visit | Allowed |

The distinction between 401, 403, and business-rule rejection is significant: authentication establishes identity, authorization establishes permission, and domain validation determines whether an otherwise authorized action is valid for the current record state.

> **Figure 8.18 — Access-control verification evidence**
>
> **SCREENSHOT TO ADD HERE:** Capture the final access-control test evidence. Prefer a readable access matrix or test output identifying operation, role, and result. If using a code screenshot, include the file path and named scenarios such as anonymous access, receptionist clinical-write denial, and nurse deceased-status denial. Never expose tokens or credentials.

This is functional authorization testing, not a penetration test or security certification.

## 7.5 Patient, appointment, and workflow testing

Patient testing covered registration, retrieval, update, search, patient status, and historical preservation. Appointment testing covered status transitions, cancellation requirements, rescheduling, check-in, queue behavior, and appointment-event history.

The manual E2E path is:

**Patient → Appointment → Check-in → Clinical Visit → second appointment → second visit**

This path is important because longitudinal behavior cannot be established by testing a single record in isolation.

> **Figure 8.19 — Longitudinal workflow verification**
>
> **SCREENSHOT TO ADD HERE:** Open a synthetic patient chart after the second recorded visit. Show two distinct visits belonging to the same patient, clearly different visit information, and chronological separation. Include enough chart context to identify the synthetic patient, but use no real patient information. The visual purpose is to prove that the second attendance created a new visit rather than replacing the first.

Appointment validation also included cancellation requiring a reason and rescheduling with event history. These tests connect UI behavior to explicit business rules rather than treating appointments as unrestricted CRUD rows.

## 7.6 Clinical documentation and finalization

Clinical visits have a lifecycle distinguishing Draft, Final, and Cancelled states. Finalization is treated as a historical clinical-documentation boundary rather than an ordinary editable draft.

The strategy therefore checks that check-in creates or associates the appropriate draft visit, permitted roles can document, finalization changes the visit to its terminal documented state, the linked appointment becomes Completed where required, the completed appointment leaves the active queue, and historical visits remain visible.

> **Figure 8.20 — Finalization and queue behavior**
>
> **SCREENSHOT TO ADD HERE:** Capture the application immediately before and after finalization, ideally as two labeled sub-images in one figure. Before: show the active workflow state and Draft visit. After: show Final visit, Completed appointment, and removal from the active queue. Use synthetic data and do not display tokens or sensitive configuration.

## 7.7 Continuous integration and build verification

GitHub Actions provides repeatable verification beyond a developer's local machine. The project's CI process includes backend Release build/test verification and frontend TypeScript/Vite build verification. A successful CI run supports the claim that the repository passed its configured automated checks in that CI environment at that commit.

> **Figure 8.21 — CI verification**
>
> **SCREENSHOT TO ADD HERE:** Open the final GitHub Actions workflow run used as evidence. Capture workflow name, commit/ref, run status, and expanded backend/frontend jobs showing successful build/test or build steps. The screenshot should connect the result to the repository version used for the report.

## 7.8 Quality limitations

The QA results should not be overstated. Automated database tests use EF Core InMemory rather than PostgreSQL. Frontend automated UI coverage is limited. Concurrency behavior around MRN generation and appointment conflicts has not been comprehensively hardened or tested. The project did not constitute a penetration test, formal clinical usability study, regulatory validation, or interoperability certification. FHIR exchange was outside the MVP scope.

These limitations define the evidence boundary. The tests demonstrate meaningful application behavior for an internship-scale MVP; they do not establish production readiness for clinical deployment.

## 7.9 QA conclusion

Testing strengthened the implementation by forcing requirements to become observable behavior: role restrictions became scenarios, appointment states became transition checks, and longitudinal integrity became a repeat-visit test. The main quality lesson was that workflow correctness requires testing sequences and boundaries, not only individual functions.
