# 7.7 Testing and Quality Learning

Testing expanded from checking happy paths to verifying behavior, permissions, state transitions, historical preservation, and invalid operations.

## Testing levels

The project uses automated backend tests with xUnit and WebApplicationFactory, plus manual end-to-end verification against PostgreSQL. Automated tests use an EF Core InMemory environment, so their evidence must be interpreted according to the environment in which they run.

## Boundary-focused testing

Important scenarios include protected-resource access, role boundaries, invalid appointment operations, required validation, repeated visits remaining separate, and finalization changing the operational queue.

## CI learning

GitHub Actions adds repeatable verification outside the local development environment. This connects source control, builds, tests, and visible project evidence.

## Evidence

**Figure 7.13 — Automated test execution**

Capture the final dotnet test output from the actual repository. Include the exact command, actual counts, final status, and duration if displayed. Never type test counts into a screenshot.

**Figure 7.14 — CI verification**

Capture a GitHub Actions run showing the actual commit/ref and backend/frontend verification jobs.

**Figure 7.15 — Boundary test example**

Capture a genuine test source excerpt showing one meaningful authorization or workflow-boundary test, including file path and method name.

## Reflection

Testing became a way of expressing the system contract: what the system should allow, reject, preserve, and transition.