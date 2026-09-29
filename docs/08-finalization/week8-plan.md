# Week 8 — Finalization & presentation

**Start:** 2026-09-27  
**Updated:** 2026-09-29  
**Goal:** Package a complete, demonstrable internship MVP and submit required deliverables.

## Status snapshot

| Item | Status |
|------|--------|
| Source code on GitHub `main` | Done |
| Working EMR (patients, chart, appointments) | Done |
| SRS (PDF + Markdown) | Done — `deliverables/OCR-SRS-v2.pdf` + `SRS.md` |
| Database script / migrations | Done (EF migrations authoritative) |
| Technical documentation | Done (Markdown + PDF) |
| User guide / manual | Done (Markdown + PDF) |
| Docs path / stack consistency | Done (2026-09-29 pass) |
| P1 clinical error hardening | Done (DocumentVisit) |
| Final presentation | Outline ready — build slides next |
| Manual E2E on Postgres | Open — run checklist |

## Activities (recommended order)

### 1. Feature freeze (do not expand scope)

Only **polish and verification**, not new modules:

- [ ] Smoke E2E from `docs/09-testing/e2e-clinical-flow-checklist.md` against PostgreSQL
- [ ] Confirm CI green on latest `main`
- [x] Known limitations recorded in technical docs

**Do not start:** pharmacy, lab, FHIR, multi-facility, AI.

### 2. Technical documentation

- [x] `docs/08-finalization/technical-documentation.md`
- [x] PDF: `docs/08-finalization/deliverables/OCR-Technical-Documentation.pdf`
- [x] Linked from `docs/README.md`

### 3. User guide

- [x] `docs/08-finalization/user-guide.md`
- [x] PDF: `docs/08-finalization/deliverables/OCR-User-Manual.pdf`
- [ ] Optional: screenshots from live app for mentors

### 4. SRS & database package

- [x] Submission SRS: `docs/08-finalization/deliverables/OCR-SRS-v2.pdf`
- [x] Editable: `docs/03-requirements/srs/SRS.md`
- [x] Package `docs/05-data/ocr-complete-database.sql` **plus** note that **EF migrations are authoritative**
- [x] Migrations path: `src/backend/OpenClinicalRecord.Api/Data/Migrations/`

### 5. Final presentation

- [x] Outline in `docs/08-finalization/presentation-outline.md`
- [ ] Build slides (10–15 min) from outline
- [ ] Rehearse live demo script (below)

### 6. Demo script (10 minutes)

1. Login as **desk** → register patient → book appointment  
2. Check-in → show queue  
3. Login as **nurse** → open chart → vitals on Draft visit  
4. Login as **doctor** → document + **Final** → queue shows Completed  
5. Second visit → history shows **two** visits (no overwrite)  
6. Cancel with reason / reschedule (optional 1 min)  
7. Login as **admin** → audit list (optional)

### 7. Internship evaluation prep

- Repo URL + branch `main`  
- Commit history shows weekly progress  
- Known issues list (½ page max)  
- What you learned (architecture, RBAC, longitudinal records, testing)

## Submission checklist (expected deliverables)

| Deliverable | Location |
|-------------|----------|
| Source code | https://github.com/elan-thinks/open-clinical-record |
| Working application | Run API + Vite frontend locally (or hosted URL) |
| SRS | `docs/08-finalization/deliverables/OCR-SRS-v2.pdf` (+ `SRS.md`, domain rules) |
| Database script | `docs/05-data/ocr-complete-database.sql` + `Data/Migrations/` |
| Technical documentation | `docs/08-finalization/technical-documentation.md` + PDF |
| User manual | `docs/08-finalization/user-guide.md` + PDF |
| Final presentation | Outline + your slide deck |

## Success criteria

- Mentor can follow the user guide without you present  
- Demo completes without white-page / CI failures  
- Docs state **four roles** and **Patient → Visit** consistently  
- Scope honesty: what is in MVP vs deferred  
