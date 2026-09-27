# Week 8 — Finalization & presentation

**Start:** 2026-09-27  
**Goal:** Package a complete, demonstrable internship MVP and submit required deliverables.

## Status snapshot

| Item | Status |
|------|--------|
| Source code on GitHub `main` | Done — CI green |
| Working EMR (patients, chart, appointments) | Done |
| SRS (PDF + supporting reqs) | Exists — refresh recommended |
| Database script / migrations | Exists (EF migrations + reference SQL) |
| Technical documentation | This week — see `technical-documentation.md` |
| User guide / manual | This week — see `user-guide.md` |
| Final presentation | Outline ready — build slides next |

## Activities (recommended order)

### 1. Feature freeze (do not expand scope)

Only finish **polish and bugs**, not new modules:

- [ ] Smoke E2E from `docs/09-testing/e2e-clinical-flow-checklist.md`
- [ ] Confirm CI green on latest `main`
- [ ] Note any known limitations in technical docs (honest scope)

**Do not start:** pharmacy, lab, FHIR, multi-facility, AI.

### 2. Technical documentation

- [x] `docs/08-finalization/technical-documentation.md`
- [x] Linked from `docs/README.md`
- [ ] Optional: export PDF for submission packet

### 3. User guide

- [x] `docs/08-finalization/user-guide.md`
- [ ] Optional: screenshots from live app for mentors

### 4. SRS & database package

- [ ] Confirm `docs/03-requirements/srs/srs.pdf` matches four roles + visit model (or add addendum)
- [ ] Package `docs/05-data/ocr-complete-database.sql` **plus** note that **EF migrations are authoritative**
- [ ] List migrations folder path in submission notes

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
| SRS | `docs/03-requirements/srs/srs.pdf` (+ domain rules) |
| Database script | `docs/05-data/ocr-complete-database.sql` + `Migrations/` |
| Technical documentation | `docs/08-finalization/technical-documentation.md` |
| User manual | `docs/08-finalization/user-guide.md` |
| Final presentation | Outline + your slide deck |

## Success criteria

- Mentor can follow the user guide without you present  
- Demo completes without white-page / CI failures  
- Docs state **four roles** and **Patient → Visit** consistently  
- Scope honesty: what is in MVP vs deferred  
