# Week 7 — Testing, bug fixing & refactoring

**Plan date:** 2026-09-26  
**Close-out:** 2026-09-27  

## Goals

1. Thin controllers; move query/workflow logic into application services.  
2. Prefer SQL projections / `AsNoTracking` for list endpoints.  
3. Harden EF InMemory-safe clinical documentation paths.  
4. Fix production UI defects (white page, calendar week, cancel reason, queue terminal statuses).  
5. Keep CI green (backend tests + frontend `tsc` + build).

## Delivered

| Item | Status |
|------|--------|
| Dashboard → `IDashboardService` | Done |
| Appointment list/status/reschedule workflows in services | Done |
| `ClinicalChartService.DocumentVisit` partial (no Include dual-attach) | Done |
| Final visit → linked appointment **Completed** + event | Done |
| Check-in queue excludes Completed / Cancelled / NoShow | Done |
| Cancel requires reason (API + modal UI) | Done |
| Reschedule API + UI modals | Done |
| Calendar week **Mon–Sun**; overlapping blocks in lanes | Done |
| `ApiError` / `DashboardStats` TypeScript alignment | Done |
| Access, appointment, clinical, longitudinal tests | Done |
| AppShell / ErrorBoundary white-page hardening | Done |

## CI

Workflow: backend `dotnet test`, frontend `npm ci && npm run build` (`tsc -b && vite build`).

## Remaining / follow-ups (optional)

- Expand automated frontend tests beyond typecheck.  
- Keep `docs/05-data/ocr-complete-database.sql` in sync when migrations change (EF remains source of truth).  
- Reports module polish beyond dashboard stats aggregation.

## Related docs

- [access-control-report.md](access-control-report.md)  
- [clinical-domain-rules.md](../03-requirements/clinical-domain-rules.md)  
- [e2e-clinical-flow-checklist.md](../09-testing/e2e-clinical-flow-checklist.md)  
