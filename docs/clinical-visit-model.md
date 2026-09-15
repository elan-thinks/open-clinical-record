# Clinical model: Patient → Visit → Encounter

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

## Visit fields

- VisitDate, VisitType, Status (`Draft` \| `Final` \| `Cancelled`)
- Location, Department, EpisodeLabel
- ChiefComplaint, Plan, Instructions
- Clinician, CheckInAt / CheckOutAt, FinalizedAt
- AppointmentId (from check-in)

## Workflow

```
Appointment (Scheduled)
  → Check-in
  → ClinicalVisit created (Draft, linked to appointment)
  → Nurse records vitals (new visit of type Vitals, or documentation on open visit)
  → Doctor documents consultation (new visit of type Consultation, or Final on draft)
  → Status Final
```

**Important:** Saving vitals or a consultation **inserts a new `ClinicalVisit` row**. Historical rows remain intact.

## Modules

| Module | Focus |
|--------|--------|
| **Medical Chart** | Longitudinal patient story: overview, allergies, history, **visit history**, vitals |
| **Medical Records** | Entry point into visit / consultation documentation |
| **Appointments** | Planned interaction → check-in → visit |

## Migration

`20260915110000_EnhanceVisitEncounterModel` adds AppointmentId, EpisodeLabel, Location, Department, CheckInAt, CheckOutAt.

## Module boundaries (MVP)

| Module | Meaning |
|--------|---------|
| **Patient Management** | Registration, search, demographics, status (including deceased) |
| **Medical Chart** | Longitudinal **patient-level** view: demographics, allergies, history/meds, alerts, visit history summary |
| **Medical Records** | **Visit/encounter-level** clinical details attached to each attendance (vitals, diagnoses, notes, plan for Visit N) |
| **Appointments** | Scheduling, status lifecycle, check-in / queue |

```text
PATIENT (registered once)
├── Medical Chart (longitudinal)
│   ├── Demographics, allergies, meds/history, alerts
│   └── Visit history (list of attendances)
├── Medical Records (per visit)
│   ├── Visit 001 → encounter content
│   ├── Visit 002 → encounter content
│   └── …
└── Appointments
    ├── Appointment 001 → (optional) check-in → Visit
    └── …
```

Rule: **never overwrite** a prior visit’s encounter when the patient returns.
