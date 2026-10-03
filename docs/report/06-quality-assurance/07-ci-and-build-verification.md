# 6.7 Continuous Integration and Build Verification

## 6.7.1 CI Purpose

Continuous integration provides a repeatable automated checkpoint for changes entering the repository. In OCR, the CI workflow includes backend build/test verification and frontend TypeScript/Vite build verification.

## 6.7.2 Backend CI

The repository's CI workflow runs a Release backend build and the automated test project. The test job executes the backend test suite using dotnet test.

## 6.7.3 Frontend CI

Frontend verification includes TypeScript checking and the Vite build process. This provides a basic compile/build quality gate even though it is not equivalent to full browser-level UI testing.

### [SCREENSHOT INSERT — Figure 6.18: CI job details]

**Capture:** Expanded GitHub Actions job view showing the frontend TypeScript/build step and backend build/test step.

**What must be visible:** job names, commands/step names, and successful status.

**Purpose:** Demonstrates that CI verifies both major application layers.

**Suggested caption:** *Figure 6.18. GitHub Actions jobs verifying backend and frontend implementation integrity.*

## 6.7.4 Local vs CI Verification

Local test execution provides rapid developer feedback. CI provides an independent repository-level checkpoint. Both are useful because local success alone does not establish that the repository remains buildable under the configured CI environment.

## 6.7.5 CI Limitations

CI does not currently represent a full production delivery pipeline. It should not be described as continuous deployment, hospital-grade release automation, or production infrastructure validation.
