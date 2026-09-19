# Phase 1 blockers — applied 2026-09-19

| Issue | Change | File |
|-------|--------|------|
| Visit defaulted to Final | Blank status → **Draft** | ClinicalChartController.NormalizeVisitStatus |
| PUT could mark Deceased | Reject; use POST /deceased | PatientsController |
| Create as Deceased | Rejected | PatientsController |
| Admin on appointment status | Roles = Receptionist,Doctor,Nurse only | AppointmentsController |

Tests: `Phase1BlockerTests.cs`

```bash
dotnet test tests/backend/OpenClinicalRecord.Api.Tests --filter Phase1BlockerTests
```
