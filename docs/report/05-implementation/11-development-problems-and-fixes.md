# 5.11 Development Problems, Debugging, and Engineering Fixes

## 5.11.1 Purpose

Implementation rarely proceeds without defects or uncertainty. Recording the problems encountered is therefore part of the engineering evidence, not an admission of failure. The value of this section is to show how requirements and architecture were translated into working behavior when implementation details did not initially behave as expected.

The report should use repository history, issue records, test output, and dated notes to replace memory-based storytelling wherever possible.

## 5.11.2 Scope and Workflow Complexity

One major challenge was discovering that apparently simple EMR features interact through workflow. Patient registration, appointment scheduling, check-in, clinical documentation, and finalization cannot be implemented independently without creating contradictory states.

The response was to make the workflow explicit through domain rules and state models before completing the corresponding implementation.

### [SCREENSHOT INSERT — Figure 5.28: Workflow issue or state-model evidence]

**Capture:** The relevant GitHub issue, project board item, or requirements/state-model document showing a workflow problem or decision that affected implementation.

**What must be visible:** issue title/identifier, problem description, and resolution/decision if available.

**Purpose:** Demonstrates engineering reasoning rather than merely showing the final UI.

**Suggested caption:** *Figure 5.28. Development evidence showing a workflow issue and its engineering resolution.*

## 5.11.3 Transactional Integrity

Another important engineering concern was transactional integrity. Operations that modify clinically significant or workflow-related records may involve multiple related persistence changes. The implementation therefore required careful consideration of transaction boundaries and consistency.

The final report should distinguish between the integrity guarantees implemented in the MVP and the stronger concurrency controls that would be required for production deployment.

## 5.11.4 Authorization Boundaries

Access-control behavior also required explicit reasoning. A frontend can hide an action, but that does not make the API secure. Backend authorization was therefore treated as the actual enforcement boundary.

Automated tests were used to verify selected unauthorized and authorized operations.

### [SCREENSHOT INSERT — Figure 5.29: Failed-to-fixed authorization evidence]

**Capture:** If GitHub issues/commits contain an actual authorization bug and its fix, show the issue/commit or a before/after test result. If no suitable historical evidence exists, do not invent one; instead use Figure 5.10's successful authorization test evidence.

**Purpose:** Shows how a security boundary was verified or corrected.

**Suggested caption:** *Figure 5.29. Authorization verification during implementation.*

## 5.11.5 Database and Migration Issues

Database development also required keeping entity definitions, EF Core migrations, application configuration, and the running PostgreSQL database aligned.

A known documentation limitation is that reference SQL can lag the current migration state. The report should therefore identify migrations and the actual application database configuration as stronger implementation evidence than an outdated reference script.

## 5.11.6 Testing and Debugging

Testing exposed the difference between isolated backend behavior and complete application behavior. Automated tests provide repeatable verification of selected API and business rules, while manual end-to-end testing verifies the integrated browser/API/database workflow.

### [SCREENSHOT INSERT — Figure 5.30: Test run]

**Capture:** Terminal/IDE output from the actual test suite showing passing automated tests. Include the command used and the final pass summary.

**Purpose:** Demonstrates repeatable verification.

**Suggested caption:** *Figure 5.30. Automated backend test execution during OCR implementation.*

## 5.11.7 AI-Assisted Development

AI assistants were used as development aids for tasks such as UI design exploration, debugging, and technical problem solving. The important engineering practice was to treat generated suggestions as proposals that required inspection and validation rather than as authoritative source code.

The report should not claim that AI generated the complete system. The system remains the result of requirements decisions, architecture decisions, implementation work, testing, debugging, and documentation.

## 5.11.8 Evidence-Based Reflection

The strongest implementation problems to document are those that changed an engineering decision, required a debugging cycle, or revealed a misunderstanding about the domain. A long list of trivial syntax errors would add little value.

For the final report, each selected problem should follow:

**Problem → Impact → Investigation → Decision → Implementation/Fix → Verification → Lesson**

This structure turns debugging history into evidence of engineering growth.
