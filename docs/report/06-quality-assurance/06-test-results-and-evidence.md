# 6.6 Test Results and Evidence

## 6.6.1 Results Reporting Principle

The final report should report actual observed test results, not estimated coverage. If a test run was executed multiple times, the report should state the relevant date/version and summarize the observed outcome.

The repository provides the command used for backend automated verification:

dotnet test

from:

tests/backend/OpenClinicalRecord.Api.Tests

## 6.6.2 Automated Test Evidence

The automated suite provides repeatable verification of backend behavior. The report should record the actual number of tests passed, failed, skipped, and total from the final baseline run.

**Do not invent a test count.** Capture the final terminal output and transfer the exact figures into the final report.

### [SCREENSHOT INSERT — Figure 6.15: Final automated test result]

**Capture:** The final baseline dotnet test output.

**What must be visible:** total tests, passed/failed/skipped counts if the runner provides them, execution time if available, and the project/command context.

**Purpose:** Provides the primary quantitative automated-testing evidence.

**Suggested caption:** *Figure 6.15. Final automated backend test results for the OCR implementation.*

## 6.6.3 Manual E2E Results

Manual E2E results should be recorded as a checklist table in the final report:

| Scenario | Result | Evidence |
|---|---|---|
| Patient registration | To be recorded from final run | Figure 6.7 |
| Appointment creation | To be recorded | Figure 6.8 |
| Check-in | To be recorded | Figure 6.12 |
| Two-visit history | To be recorded | Figure 6.11 |
| Finalization/queue completion | To be recorded | Figure 6.13 |
| Cancellation | To be recorded | Figure 6.9 |
| Rescheduling | To be recorded | Figure 6.10 |
| Access smoke tests | To be recorded | Figure 6.6 |

Replace “To be recorded” after the final test session.

## 6.6.4 CI Results

CI should be reported using the actual GitHub Actions run associated with the final report baseline. Record the workflow date, commit/ref, and whether the backend and frontend checks completed successfully.

### [SCREENSHOT INSERT — Figure 6.16: Final CI result]

**Capture:** The GitHub Actions run corresponding to the final report baseline.

**What must be visible:** commit/ref, workflow name, job status, and individual backend/frontend verification jobs.

**Suggested caption:** *Figure 6.16. Final continuous-integration verification associated with the report baseline.*

## 6.6.5 Test Environment Limitation

Automated backend tests use EF Core InMemory, whereas the application itself uses PostgreSQL. This means passing automated tests does not prove identical behavior under every PostgreSQL-specific constraint or transaction behavior.

Manual E2E testing against PostgreSQL is therefore an essential complementary layer.

## 6.6.6 Defect Evidence

If the development history contains identifiable defects that were fixed, each should be recorded using:

**Defect → Reproduction → Root cause → Fix → Verification**

### [SCREENSHOT INSERT — Figure 6.17: Defect/fix evidence]

**Capture:** A genuine GitHub issue, commit diff, or test result showing a real defect and its resolution.

**Important:** Do not manufacture a defect solely to make the report look richer. If no suitable historical evidence exists, omit this figure and discuss the actual debugging evidence available.

**Suggested caption:** *Figure 6.17. Evidence of an implementation defect and its verified resolution.*
