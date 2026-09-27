# Clinical model: Patient → Visit → Encounter

**Last updated:** 2026-09-27

When a visit is set to **Final**, the linked appointment (if any) is set to **Completed** so the patient leaves the active check-in queue.

Open Clinical Record follows an OpenMRS / FHIR-inspired longitudinal model.

## Rules

1. **A patient is registered once.** Returns never create a new patient record.
2. **Each attendance is a new Visit.** Prior visits are never overwritten.
3. **Encounter content hangs off the Visit** (vitals, diagnoses, notes, plan).

```
PATIENT (registered once)
 └── VISIT #1  (facility attendance / check-in)
 │     └── Encounter content
 │          ├── vitals
 │          ├── diagnoses
 │          ├── notes
 │          └── plan / instructions
 └── VISIT #2
 │     └── Encounter content …
 └── VISIT #N
```

## Entities

| Concept | Implementation |
|--------|----------------|
| Patient | `Patient` |
| Visit | `ClinicalVisit` |
| Encounter content | `VitalSigns`, `Diagnosis`, `ClinicalNote` on the same visit |
| Appointment → Visit | Optional `ClinicalVisit.AppointmentId`; created on **CheckedIn** |
| Episode of care (optional) | `ClinicalVisit.EpisodeLabel` string (full Episode entity deferred) |

## Visit statuses

| Status | Meaning |
|--------|---------|
| Draft | Editable |
| Final | Immutable; new content requires a new visit |
| Cancelled | Voided |

## Related

- Domain rules: `docs/03-requirements/clinical-domain-rules.md`
- Access matrix: `docs/05-engineering/access-control-report.md`
