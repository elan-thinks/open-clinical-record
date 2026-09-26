# Week 7 — Testing, Bug Fixing & Refactoring

**Goal:** Harden OCR for mentor demo: functional coverage, fix known defects, tighten architecture, and make hot-path queries cheaper.

**Date started:** 2026-09-26

---

## Scope (mentor week plan)

| Activity | OCR focus |
|----------|-----------|
| Functional testing | Expand automated suite + formalize manual matrix |
| Fix identified bugs | Consultation save, closed-draft edge cases, dashboard queries |
| Refactor code | Keep controllers thin; project DTOs in queries; consistent ServiceResult |
| Improve architecture | Document transaction boundaries; no shared DbContext across threads |
| Optimize database queries | AsNoTracking, Select projections, split queries, Take limits |

---

## Current baseline (before Week 7 work)

### Already in place

- Application services: `PatientService`, `AppointmentWorkflowService`, `ClinicalChartService`, `DashboardService`, `AuditService`
- xUnit integration tests: health, roles, appointment workflow, longitudinal visits, phase-1 blockers
- Chart uses `AsSplitQuery()` + `Take(50)` on visits
- Dashboard avoids non-translatable `ClinicTime.ToClinicDate` in LINQ (precomputed UTC bound)
- Explicit transaction on appointment create (appointment + event)

### Known gaps / risks

1. **DbContext is not thread-safe** — do not `Task.WhenAll` multiple queries on one scoped context.
2. **Appointment slot conflict** is check-then-insert (race possible under concurrent book).
3. **Clinical entities** lack `RowVersion` / optimistic concurrency.
4. **Manual E2E matrix** still needs a full pass on real PostgreSQL.

---

## Week 7 workstreams

### A. Functional testing

- [x] Document functional matrix (this file)
- [x] CI backend suite green on main (includes ClinicalDocumentationTests)
- [x] Add `ClinicalDocumentationTests` (create visit, document draft, reject finalized overwrite)
- [ ] Manual E2E: register → book → check-in → vitals → consult → second visit
- [ ] Manual role matrix (desk / nurse / doctor / admin)

### B. Bug fixes

- [x] DocumentVisit hardening (InMemory-safe; no dual-attach)
- [x] **API error hardening:** never append `InnerException` / provider messages to client responses
- [x] **HTTP mapping:** infrastructure failures use `ServiceErrorKind.Internal` → HTTP 500 (not 400 Validation)
- [ ] Empty Draft visit cleanup policy (defer UX if time-boxed)

### C. Refactor / architecture

- [x] Dashboard: project `AppointmentDto` in query (no full entity materialization)
- [x] Appointment list: Select projection where practical
- [x] DashboardController → IDashboardService (already on main)
- [x] PatientsController + ClinicalChartController map `Internal` → 500

### D. Query optimization

| Endpoint / method | Optimization |
|-------------------|--------------|
| `DashboardService.GetStatsAsync` | `Select` into DTO; counts sequential on one context |
| `ClinicalChartService.GetChartAsync` | Already split query + Take(50) |
| `AppointmentWorkflowService.ListAsync` | Project to DTO in SQL |

---

## Functional test matrix (manual)

| ID | Flow | Roles | Pass criteria |
|----|------|-------|----------------|
| F1 | Login all 4 seed users | all | Dashboard loads |
| F2 | Register patient | desk | MRN assigned |
| F3 | Book appointment | desk | Status Scheduled |
| F4 | Check-in | desk | CheckedIn + Draft visit |
| F5 | Record vitals | nurse | Vitals on visit |
| F6 | Document consultation | doctor | Final/draft with diagnosis |
| F7 | Second visit | desk+clinical | Two history rows; first intact |
| F8 | Deceased blocks booking | doctor/admin | Validation error |
| F9 | Admin audit list | admin | Events visible |
| F10 | Change password | any | Re-login with new password |

---

## Definition of done (Week 7)

1. Automated tests pass (`dotnet test tests/backend/...`).
2. Hot-path list/dashboard queries use projections + AsNoTracking.
3. DocumentVisit / longitudinal tests cover the consultation path.
4. Client-facing errors are sanitized; infrastructure failures return 500.
5. Manual matrix F1–F7 executed at least once on real Postgres.
6. Short notes in this file of what changed.

---

## Changes log

| Date | Change |
|------|--------|
| 2026-09-26 | Week 7 plan created |
| 2026-09-26 | **Queries:** dashboard schedule projected to `AppointmentDto` in SQL; clinic-local week bound |
| 2026-09-26 | **Queries:** appointment list uses `Select` projection (no full graph load) |
| 2026-09-26 | **Tests:** `ClinicalDocumentationTests` — document draft, reject Final edit, dashboard stats |
| 2026-09-26 | **API safety:** Patient / Appointment / DocumentVisit catch blocks no longer leak SQL; `ServiceErrorKind.Internal` → HTTP 500 |
