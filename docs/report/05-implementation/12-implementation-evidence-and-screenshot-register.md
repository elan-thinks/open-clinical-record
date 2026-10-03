# 5.12 Implementation Evidence and Screenshot Register

## 5.12.1 Purpose

Screenshots in an industrial internship report should prove something. They should not be decorative images inserted merely to increase page count. Each figure should answer a specific question: What implementation fact does this image demonstrate?

The following register provides the exact evidence targets for the screenshots referenced throughout Phase 05.

## 5.12.2 Screenshot Register

| Figure | Screen/evidence to capture | Main claim supported |
|---|---|---|
| 5.1 | GitHub repository tree | Real implementation repository structure |
| 5.2 | Local development environment | Backend/frontend development setup |
| 5.3 | Git commit history | Iterative implementation progression |
| 5.4 | ServiceCollectionExtensions.cs | Service-layer dependency injection |
| 5.5 | Backend project tree | Layered backend organization |
| 5.6 | ERD/database model | Longitudinal persistence design |
| 5.7 | EF migration directory | Versioned schema evolution |
| 5.8 | Login page | User authentication entry point |
| 5.9 | Role-aware UI | Frontend role-aware presentation |
| 5.10 | Authorization tests | Backend access-control verification |
| 5.11 | Patient registration | Patient creation workflow |
| 5.12 | Patient list/search | Existing patient discovery |
| 5.13 | Patient status | Lifecycle-state handling |
| 5.14 | Appointment form | Appointment creation |
| 5.15 | Queue/dashboard | Appointment workflow states |
| 5.16 | Check-in transition | Appointment-to-clinical workflow bridge |
| 5.17 | Cancellation dialog | Required cancellation reason |
| 5.18 | Patient chart | Longitudinal visits |
| 5.19 | Vital signs | Visit-specific observations |
| 5.20 | Diagnosis/notes | Clinical documentation |
| 5.21 | Finalization | Draft-to-final lifecycle boundary |
| 5.22 | Dashboard | Operational aggregates |
| 5.23 | Audit log | Accountability/event recording |
| 5.24 | User management | Administrative role management |
| 5.25 | Main navigation | Frontend application structure |
| 5.26 | Validation error | User-facing validation |
| 5.27 | Chart detail | Longitudinal clinical interaction |
| 5.28 | Issue/state evidence | Problem-solving process |
| 5.29 | Authorization fix/evidence | Security debugging/verification |
| 5.30 | Test run | Automated verification |

## 5.12.3 Screenshot Quality Rules

Every application screenshot should use synthetic or non-sensitive demonstration data. Never include real patient names, phone numbers, addresses, medical information, passwords, JWTs, database connection strings, secret keys, or private organizational information unless explicit authorization exists and the information is genuinely necessary.

Screenshots should be captured at a readable resolution. Browser chrome may be cropped if the application context remains clear, but do not crop away the page title or navigation context.

For code screenshots, zoom enough that filenames, class names, and the relevant lines are readable. A tiny screenshot of an entire source file is weaker evidence than a focused image of the exact implementation fragment.

For test screenshots, include the command or test-run context and the final pass/fail result.

## 5.12.4 Figure Placement Rule

Each screenshot should be placed immediately after the paragraph that makes the claim it supports. Do not collect all screenshots at the end of the chapter unless the university template requires that arrangement.

Use a consistent figure numbering and caption format throughout the report.

## 5.12.5 Evidence Strength

The preferred evidence hierarchy is:

1. running application behavior;
2. automated test result;
3. executable source-code evidence;
4. migration/configuration evidence;
5. Git history;
6. architecture/documentation diagram.

A diagram can explain the design, but a running screen or test is usually stronger evidence that the corresponding feature was implemented.

## 5.12.6 Final Cross-Check

Before submitting the report, verify every screenshot against the implementation version used as the report baseline. If the UI has changed after the screenshot was captured, either recapture it or clearly identify the version/date represented.

This prevents a common report problem: describing one version of the system while showing screenshots from another.
