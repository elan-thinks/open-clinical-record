# Phase 2 — Application services (2026-09-19)

## Shape

```
Controller (HTTP, [Authorize], ActorContext)
  → IAppointmentWorkflowService / IClinicalChartService / IPatientService
    → AppDbContext
```

## New types

- `Services/Common/ServiceResult.cs` — `ServiceResult<T>`, `ActorContext`
- `Services/Appointments/AppointmentWorkflowService.cs`
- `Services/Clinical/ClinicalChartService.cs`
- `Services/Patients/PatientService.cs`

Registered by `AddApplicationServices()` in `Program.cs`.

Controllers map `ServiceResult` to HTTP (200 / 400 / 404 / 409).

Phase 1 rules preserved (Draft default, deceased path-only, Admin off appointment status).
