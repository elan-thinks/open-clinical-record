# Open Clinical Record — Documentation

**Aligned:** 2026-09-27 (Week 8 finalization)

## Start here (submission)

| Document | Path |
|----------|------|
| **SRS (PDF)** | [08-finalization/deliverables/OCR-SRS-v2.pdf](08-finalization/deliverables/OCR-SRS-v2.pdf) |
| **User Manual (PDF)** | [08-finalization/deliverables/OCR-User-Manual.pdf](08-finalization/deliverables/OCR-User-Manual.pdf) |
| **Technical Documentation (PDF)** | [08-finalization/deliverables/OCR-Technical-Documentation.pdf](08-finalization/deliverables/OCR-Technical-Documentation.pdf) |
| SRS (Markdown) | [03-requirements/srs/SRS.md](03-requirements/srs/SRS.md) |
| User guide (Markdown) | [08-finalization/user-guide.md](08-finalization/user-guide.md) |
| Technical docs (Markdown) | [08-finalization/technical-documentation.md](08-finalization/technical-documentation.md) |

## Product & requirements

| Document | Purpose |
|----------|---------|
| [00-project/project-scope.md](00-project/project-scope.md) | MVP scope |
| [00-project/technology-stack.md](00-project/technology-stack.md) | Stack |
| [03-requirements/clinical-domain-rules.md](03-requirements/clinical-domain-rules.md) | Statuses & domain rules |
| [03-requirements/traceability-matrix.md](03-requirements/traceability-matrix.md) | Requirements → tests |
| [03-requirements/non-functional-requirements.md](03-requirements/non-functional-requirements.md) | Quality attributes |
| [03-requirements/role-based-system-guide.md](03-requirements/role-based-system-guide.md) | Role UX |
| [clinical-visit-model.md](clinical-visit-model.md) | Patient → Visit model |

## Architecture & engineering

| Document | Purpose |
|----------|---------|
| [04-architecture/project-structure.md](04-architecture/project-structure.md) | Repo layout |
| [04-architecture/architecture-overview.pdf](04-architecture/architecture-overview.pdf) | Architecture overview |
| [04-architecture/adr/](04-architecture/adr/) | Architecture decisions |
| [05-engineering/access-control-report.md](05-engineering/access-control-report.md) | RBAC matrix + seed users |
| [05-engineering/coding-standards.md](05-engineering/coding-standards.md) | Coding standards |
| [05-engineering/week7-testing-refactoring.md](05-engineering/week7-testing-refactoring.md) | Week 7 close-out |
| [05-data/](05-data/) | DB notes + reference SQL |

## Finalization & testing

| Document | Purpose |
|----------|---------|
| [08-finalization/week8-plan.md](08-finalization/week8-plan.md) | Week 8 plan |
| [08-finalization/presentation-outline.md](08-finalization/presentation-outline.md) | Presentation outline |
| [09-testing/e2e-clinical-flow-checklist.md](09-testing/e2e-clinical-flow-checklist.md) | Manual E2E |

## Background (optional)

| Folder | Notes |
|--------|-------|
| `01-research/` | Early research notes |
| `02-discovery/` | Workflow discovery |
| `03-requirements/ER/` | ER diagram (HTML) |
| `ocr-ui-mocks-v3/` | Static UI prototypes (not the React app) |

## Live product facts

**Roles:** Admin, Doctor, Nurse, Receptionist  
**Appointments:** Scheduled → Waiting → CheckedIn → InProgress → Completed (also Cancelled, NoShow)  
**Visits:** Draft → Final (immutable); finalizing completes the linked appointment  
**Clinical writes:** Doctor + Nurse only  
