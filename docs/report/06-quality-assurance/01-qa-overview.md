# 6.1 Quality Assurance Overview

## 6.1.1 Purpose of Quality Assurance

Quality assurance for Open Clinical Record (OCR) was concerned with more than proving that individual buttons worked. Because the system manages connected patient, appointment, and clinical-visit workflows, verification had to examine whether operations remained valid across role boundaries, state transitions, persistence, and repeated visits.

The QA phase therefore combines automated backend testing, manual end-to-end testing, access-control verification, workflow verification, build/CI checks, and documented limitations.

## 6.1.2 Quality Objectives

The principal QA objectives were:

- verify that protected API resources require authentication;
- verify role-specific authorization boundaries;
- verify patient and appointment business rules;
- verify appointment state transitions;
- verify check-in creates the appropriate clinical workflow;
- verify multiple visits are preserved rather than overwritten;
- verify finalization moves the appointment out of the active queue;
- verify cancellation requires a reason;
- verify rescheduling is restricted by state;
- verify the backend test suite can execute repeatably;
- verify frontend type checking/build through CI;
- identify limitations where automated tests do not reproduce PostgreSQL behavior exactly.

## 6.1.3 Verification Layers

OCR uses complementary QA layers:

| Layer | Purpose | Evidence |
|---|---|---|
| Unit/application tests | Fast repeatable business/API checks | xUnit |
| Integration-style API tests | Exercise application through WebApplicationFactory | Automated test project |
| Manual E2E | Verify complete browser/API/database workflow | Clinical flow checklist |
| Access-control audit | Verify role matrix | AccessMatrixTests + smoke checks |
| CI | Repeatable build/test verification | GitHub Actions |
| Source/configuration review | Inspect implementation structure | Repository |

### [SCREENSHOT INSERT — Figure 6.1: QA repository structure]

**Capture:** Repository tree showing the backend test project, testing documentation, and CI workflow.

**What must be visible:** tests/backend/OpenClinicalRecord.Api.Tests/, docs/09-testing/, and .github/workflows/.

**Purpose:** Establishes that QA artifacts exist as part of the engineering repository.

**Suggested caption:** *Figure 6.1. Repository structure supporting automated, manual, and CI-based quality assurance.*

## 6.1.4 QA Philosophy

The strongest QA evidence should be tied directly to a requirement or business rule. Instead of saying “appointments were tested,” the report should identify specific tested transitions such as Scheduled → CheckedIn or cancellation with a mandatory reason.

This requirement-oriented approach also makes the final report traceable to the requirements and state models documented in Phase 03.
