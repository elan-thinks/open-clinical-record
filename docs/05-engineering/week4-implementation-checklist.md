# Week 4 — Repository audit & implementation checklist

**Baseline:** 4 application roles · 3 business modules · Patient → Visit → Encounter

## Already working

- Four roles, patients, appointments, check-in → Draft visit
- Chart GET, create visit (always new row), clinical writes Doctor/Nurse
- VisitHistoryPanel, Medical Records → chart visits, RecordVitalsPage
- Auth smoke + role 403 tests

## Gaps closed in Week 4

- GET `/chart/visits/{visitId}` with patient ownership
- PATCH document open Draft visit
- AppointmentId must belong to patient on create
- Longitudinal multi-visit tests + wrong-patient 404 + receptionist 403 on visit create
- Traceability Admin wording fixed
