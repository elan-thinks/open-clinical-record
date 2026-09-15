# Week 4 completion status

**Product:** Open Clinical Record  
**Date:** 2026-09-15

## Definition of done

```text
Patient → Appointment/Walk-in → Check-in → Visit → Clinical record → Save
  → Patient Chart → Visit History → Historical visit detail
AND same patient can return without overwriting prior visits.
```

## Checklist

| Item | Status |
|------|--------|
| Visit model (`ClinicalVisit`) | ✅ |
| Encounter content (vitals, dx, notes) | ✅ |
| Multiple visits (always insert) | ✅ |
| Check-in → Draft visit | ✅ |
| GET single visit (patient-scoped) | ✅ |
| PATCH document open Draft | ✅ |
| Medical Records → real data / chart | ✅ |
| Clinical writes Doctor/Nurse only | ✅ |
| Admin not automatic clinical author | ✅ |
| LongitudinalVisitTests | ✅ |
| No Rx/lab/FHIR scope creep | ✅ |

## Remaining limitations

- AUDIT_EVENT deferred
- PATIENT_ALERT logical only
- Walk-in = visit without AppointmentId
- Run `dotnet test` locally / CI
