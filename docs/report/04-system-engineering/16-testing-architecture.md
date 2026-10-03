# 4.16 Testing Architecture

## 4.16.1 Testing strategy

OCR uses multiple testing levels because no single technique can establish that the complete EMR workflow is correct.

The strategy combines automated backend tests, application-level API tests, manual end-to-end testing, frontend type/build verification, and CI checks.

The project deliberately distinguishes fast isolated automated tests from final workflow verification against PostgreSQL.

## 4.16.2 Automated backend testing

The backend test project uses xUnit and WebApplicationFactory. This allows tests to exercise the application through realistic HTTP/application boundaries rather than only isolated helper functions.

The test suite covers areas including access-control behavior, appointment workflows, clinical documentation, longitudinal visits, and finalization.

## 4.16.3 Access-control testing

Security behavior is verified with explicit role scenarios:

| Scenario | Expected |
|---|---|
| Anonymous reads protected patient data | 401 |
| Nurse marks patient deceased | 403 |
| Doctor marks patient deceased | Allowed |
| Doctor books for deceased patient | 400 |
| Receptionist creates clinical visit | 403 |
| Nurse creates clinical visit | 201 |

These tests turn the permission matrix into executable evidence.

## 4.16.4 Appointment workflow testing

Appointment behavior is state-dependent, so testing must verify transitions rather than only creation.

Relevant scenarios include creation, status changes, cancellation with a required reason, rescheduling from allowed states, rejection of invalid transitions, completion after clinical workflow, and restrictions for deceased patients.

## 4.16.5 Longitudinal chart testing

Clinical chart tests verify that visits remain separate over time.

The key invariant is:

New visit ≠ overwrite previous visit.

Testing should demonstrate that creating a second visit does not destroy information associated with the first.

## 4.16.6 Finalization testing

Finalization is a lifecycle boundary. Tests should verify that valid draft documentation can be finalized, expected linked workflow changes occur, ordinary editing does not simply reopen a final record, and invalid finalization attempts are rejected.

The project documents finalization-related automated coverage, including InMemory-safe finalization tests.

## 4.16.7 Test persistence limitation

Automated tests use EF Core InMemory rather than a live PostgreSQL database. This is useful for fast isolated tests but does not reproduce every PostgreSQL behavior.

Therefore, automated tests establish application behavior under the test provider, while manual PostgreSQL E2E testing provides additional evidence against the intended database technology.

## 4.16.8 Manual end-to-end testing

Manual E2E testing verifies the complete browser-to-database journey:

Login → register/locate patient → create appointment → check in → open draft visit → record clinical information → doctor reviews/finalizes → appointment completes → verify historical record.

This tests integration between frontend, API, authorization, services, and database.

## 4.16.9 Frontend verification

CI performs frontend type checking and production build verification. This catches classes of problems such as TypeScript errors and production-build failures.

The project has fewer automated browser/UI tests than backend tests, so manual UI verification remains important.

## 4.16.10 Continuous integration

GitHub Actions runs backend tests and frontend typecheck/build checks on pushes to the main branch. This creates a repeatable baseline verification process.

## 4.16.11 Boundary-focused testing

Testing was not limited to happy paths. The project considered unauthorized roles, deceased patients, invalid appointment transitions, missing cancellation reasons, finalized visits, persistence failures, and longitudinal history.

These cases are especially valuable because workflow defects often occur at state boundaries.

## 4.16.12 Testing limitations

Current limitations include incomplete frontend browser automation, lack of live-PostgreSQL automated coverage for every test, absence of performance/load testing, no formal penetration test, and limited accessibility automation.

These are future improvements rather than completed internship deliverables.

## 4.16.13 Engineering lesson

Testing evolved from asking “Does this endpoint work?” to asking “Does this workflow preserve the required invariant?”

That was a major shift in engineering thinking. In a stateful EMR, the second question is more useful because it tests the meaning of the operation rather than only its immediate response.
