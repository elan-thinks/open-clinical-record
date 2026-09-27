# Open Clinical Record — Documentation index

**Last aligned with product:** 2026-09-27 (Week 8 finalization started)

Use this page to know which documents are **current**, which are **historical**, and which are **design-only**.

## Current (prefer these)

| Document | Purpose |
|----------|---------|
| [../README.md](../README.md) | Product overview, roles, modules, stack |
| [00-project/project-scope.md](00-project/project-scope.md) | MVP scope and modules |
| [00-project/technology-stack.md](00-project/technology-stack.md) | React, ASP.NET Core, PostgreSQL |
| [clinical-visit-model.md](clinical-visit-model.md) | Patient → Visit → content; no overwrite |
| [03-requirements/clinical-domain-rules.md](03-requirements/clinical-domain-rules.md) | Domain rules, statuses, roles |
| [03-requirements/role-based-system-guide.md](03-requirements/role-based-system-guide.md) | Role UX and responsibilities |
| [05-engineering/access-control-report.md](05-engineering/access-control-report.md) | Live RBAC matrix + seed users |
| [04-architecture/project-structure.md](04-architecture/project-structure.md) | Repo layout and what is implemented |
| [05-engineering/week7-testing-refactoring.md](05-engineering/week7-testing-refactoring.md) | Week 7 plan + close-out status |
| [08-finalization/week8-plan.md](08-finalization/week8-plan.md) | **Week 8** finalization plan |
| [08-finalization/user-guide.md](08-finalization/user-guide.md) | **User manual** |
| [08-finalization/technical-documentation.md](08-finalization/technical-documentation.md) | **Technical documentation** |
| [08-finalization/presentation-outline.md](08-finalization/presentation-outline.md) | Final presentation outline |
| [09-testing/e2e-clinical-flow-checklist.md](09-testing/e2e-clinical-flow-checklist.md) | Manual E2E checklist |

## Historical (point-in-time; do not treat as live architecture)

| Document | Notes |
|----------|-------|
| `05-engineering/implementation-audit-2026-09-15.md` | Phase A–C audit snapshot |
| `05-engineering/phase1-blockers-2026-09-19.md` | Phase 1 blockers log |
| `05-engineering/phase2-application-services-2026-09-19.md` | Services extraction note |
| `05-engineering/phase3-audit-trail-2026-09-19.md` | AuditEvents introduction |
| `05-engineering/phase4-appointment-workflows-2026-09-19.md` | Reschedule API note |
| `05-engineering/week4-*.md` | Week 4 clinical records |
| `README_PHASE_A.md` (repo root) | Early phase README |

## Research / discovery (pre-implementation intent)

`01-research/*`, `02-discovery/clinical-workflow.md` — still useful for rationale; status trees may lag the live transition table in `clinical-domain-rules.md`.

## Design mocks (not the React app)

`ocr-ui-mocks-v3/*` — static HTML/CSS prototypes. Runtime UI is `src/frontend/open-clinical-record-web`.

## Data artifacts

| Document | Notes |
|----------|-------|
| `05-data/ocr-database-audit.md` | FK and history safety notes |
| `05-data/ocr-complete-database.sql` | Reference SQL; **EF migrations are source of truth** |
| `03-requirements/ER/*` | ER diagrams (may lag migrations) |
| `03-requirements/srs/srs.pdf` | Formal SRS package |

## Live product facts (quick reference)

**Roles:** Admin, Doctor, Nurse, Receptionist  

**Appointment statuses:** Scheduled → Waiting → CheckedIn → InProgress → Completed; also Cancelled, NoShow  

**Visit statuses:** Draft (editable) → Final (immutable); Cancelled  

**Rule:** Finalizing a visit marks the linked appointment **Completed** and removes it from the active check-in queue.  

**Clinical writes:** Doctor + Nurse only. **Booking:** all four staff roles. **Mark deceased:** Admin, Doctor, Receptionist (not Nurse). **Clear deceased:** Admin, Doctor.
