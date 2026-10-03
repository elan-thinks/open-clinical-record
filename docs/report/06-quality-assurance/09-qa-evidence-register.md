# 6.9 QA Evidence and Screenshot Register

## 6.9.1 Evidence Register

| Figure | Evidence | What it proves |
|---|---|---|
| 6.1 | QA repository structure | Testing artifacts exist |
| 6.2 | dotnet test run | Automated backend execution |
| 6.3 | E2E checklist | Structured manual testing |
| 6.4 | CI run | Repository-level verification |
| 6.5 | Access matrix | Expected RBAC behavior |
| 6.6 | Access tests | Executable RBAC verification |
| 6.7 | Patient registration | Patient workflow result |
| 6.8 | Appointment transition | Stateful appointment workflow |
| 6.9 | Cancellation validation | Mandatory cancellation reason |
| 6.10 | Rescheduling/event history | Scheduling change + traceability |
| 6.11 | Two visits | Longitudinal non-overwrite behavior |
| 6.12 | Check-in/draft visit | Appointment → visit bridge |
| 6.13 | Finalization/queue | Cross-module completion |
| 6.14 | Final visit | Draft/final lifecycle |
| 6.15 | Final test result | Quantitative automated result |
| 6.16 | Final CI | Final repository verification |
| 6.17 | Defect/fix | Engineering debugging evidence |
| 6.18 | CI job details | Backend/frontend verification |

## 6.9.2 Screenshot Capture Rules

Use synthetic data for all patient/clinical screenshots.

For every screenshot:

- capture the exact application state described by the preceding paragraph;
- keep the title/navigation context visible;
- use readable resolution;
- avoid personal or confidential data;
- never expose passwords, tokens, connection strings, or secrets;
- for code screenshots, show the relevant file path and enough code to establish context;
- for test output, show the command and final result;
- for CI, show the commit/ref and successful job status.

## 6.9.3 Exact Placement Rule

Place each figure directly after the claim it supports. Do not put a patient registration screenshot several pages away from the registration discussion. The reader should be able to look from the claim to the evidence immediately.

## 6.9.4 Evidence That Must Be Captured Before Final Submission

The following items should be captured from the final report baseline:

1. final automated test output;
2. final CI run;
3. complete patient registration workflow;
4. appointment/check-in workflow;
5. two-visit longitudinal chart;
6. finalization/queue behavior;
7. cancellation validation;
8. rescheduling/event history;
9. role/access verification;
10. any genuine defect/fix evidence selected for the report.

These ten evidence groups are more valuable than adding dozens of decorative screenshots.
