# 6.2 Test Strategy and Test Levels

## 6.2.1 Test Strategy

The testing strategy was designed around the system's risk boundaries. The most important boundaries are authentication, authorization, workflow transitions, longitudinal record preservation, and persistence.

Testing therefore concentrated on operations where an invalid result could create a misleading or inconsistent clinical record.

## 6.2.2 Automated Backend Testing

The backend test project uses xUnit and WebApplicationFactory. This allows tests to exercise the application through its configured HTTP/application pipeline rather than testing isolated methods only.

The automated test environment uses EF Core InMemory. This provides fast and isolated tests, but it does not reproduce every behavior of PostgreSQL.

### [SCREENSHOT INSERT — Figure 6.2: Automated test command]

**Capture:** Terminal showing the actual command:

cd tests/backend/OpenClinicalRecord.Api.Tests

followed by:

dotnet test

and the resulting successful test summary.

**What must be visible:** command, project/test execution, and final pass result.

**Purpose:** Provides direct evidence that the automated backend suite was executed.

**Suggested caption:** *Figure 6.2. Execution of the OCR automated backend test suite.*

## 6.2.3 Manual End-to-End Testing

Manual E2E testing verifies the integrated workflow using the running application and PostgreSQL-backed environment. The project contains a dedicated clinical-flow checklist.

The core flow is:

**Patient → Appointment → Check-in → Visit → second visit → Finalization**

Additional scenarios cover cancellation, rescheduling, and access-control smoke tests.

### [SCREENSHOT INSERT — Figure 6.3: Manual E2E checklist]

**Capture:** GitHub/VS Code view of docs/09-testing/e2e-clinical-flow-checklist.md.

**What must be visible:** the checklist heading and the sections for revisit/history, finalize/queue, cancel/reschedule, access smoke, and automated testing.

**Purpose:** Demonstrates that manual testing was structured rather than improvised.

**Suggested caption:** *Figure 6.3. Manual end-to-end clinical workflow verification checklist.*

## 6.2.4 CI Verification

GitHub Actions runs backend build/test verification and frontend TypeScript/build checks. CI provides repeatability beyond a developer's local machine.

### [SCREENSHOT INSERT — Figure 6.4: GitHub Actions CI run]

**Capture:** GitHub Actions run for the OCR repository showing the workflow completed successfully.

**What must be visible:** workflow name, commit/ref, backend build/test steps, frontend verification steps, and overall successful status.

**Purpose:** Demonstrates repeatable repository-level verification.

**Suggested caption:** *Figure 6.4. Continuous-integration verification of the OCR build and test pipeline.*

## 6.2.5 Test-Level Boundary

The project should not claim complete automated browser testing. Manual E2E testing remains important because it verifies the integrated UI/API/database workflow that backend tests alone cannot demonstrate.
