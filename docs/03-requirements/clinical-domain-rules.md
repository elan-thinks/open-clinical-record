# Clinical domain rules (MVP)

**Status:** Current as of 2026-09-27  
**Application roles:** Admin, Doctor, Nurse, Receptionist  

This document is the **live domain contract** for the internship MVP. Research and early discovery docs may lag; prefer this file and `docs/clinical-visit-model.md`.

---

## 1. Core model

```text
Patient (registered once)
  ├── Demographics / contact / status
  ├── Allergies, medical history items
  ├── Optional death record (when Status = Deceased)
  ├── Appointments (scheduled attendances)
  └── ClinicalVisits (one per attendance; never overwritten)
        ├── VitalSigns (0..1)
        ├── Diagnoses (0..n)
        └── ClinicalNotes (0..n)
```

Rules:

1. A patient is registered **once**. Returns do not create a new patient.  
2. Each facility attendance is a **new Visit**. Prior visits are never overwritten.  
3. Encounter content (vitals, diagnoses, notes, plan) hangs off the Visit.  

See also: [clinical-visit-model.md](../clinical-visit-model.md).

---

## 2. Patient status

| Status | Meaning |
|--------|---------|
| Active | May book and attend |
| Inactive | Soft-inactive; history retained |
| Deceased | Provenance via death record; **no new appointments**; clinical writes blocked |

- Deceased ≠ delete history.  
- Mark deceased: Admin, Doctor, Receptionist (not Nurse).  
- Clear deceased: Admin, Doctor only.  

---

## 3. Appointment statuses and transitions

Canonical statuses (API):

`Scheduled` · `Waiting` · `CheckedIn` · `InProgress` · `Completed` · `Cancelled` · `NoShow`

| From | Allowed to |
|------|------------|
| Scheduled | Waiting, CheckedIn, Cancelled, NoShow |
| Waiting | CheckedIn, Cancelled, NoShow, Scheduled |
| CheckedIn | InProgress, Waiting, Completed, Cancelled |
| InProgress | Completed, CheckedIn |
| Cancelled | Scheduled (re-open via reschedule path) |
| NoShow | Scheduled |
| Completed | *(terminal)* |

Additional rules:

- **Cancel** requires a non-empty **reason**.  
- **Check-in** (`CheckedIn`) creates a **Draft** `ClinicalVisit` when appropriate.  
- **Finalizing a visit** sets linked appointment to **Completed** (queue alignment).  
- Active queue UI excludes terminal statuses: Completed, Cancelled, NoShow.  
- Cannot book for a **Deceased** patient (400).  

Reschedule: allowed when status is Scheduled, Waiting, Cancelled, or NoShow; blocked for CheckedIn, InProgress, Completed.

---

## 4. Visit statuses

| Status | Meaning |
|--------|---------|
| Draft | Editable clinical documentation |
| Final | Closed; no further documentation edits |
| Cancelled | Visit voided |

- Default new visit: **Draft**.  
- Final is immutable; start a **new** consultation for new content.  

---

## 5. Appointment types (labels)

Consultation · Follow-up · New complaint · Procedure · Walk-in · Other  

Labels only — they do not change authorization.

---

## 6. Role boundaries (summary)

| Role | Typical duties |
|------|----------------|
| **Receptionist** | Register patients, book/reschedule/cancel, check-in, mark deceased |
| **Nurse** | Chart support, vitals, visits (write), queue support — not mark deceased |
| **Doctor** | Chart review and clinical writes, mark/clear deceased |
| **Admin** | Users/audit, full operational access per matrix, clear deceased |

Detailed matrix: [access-control-report.md](../05-engineering/access-control-report.md).

**Frontend** controls visibility; **backend** enforces permission.

---

## 7. History and audit

- Appointment changes write `AppointmentEvent` rows (and optional `AuditEvent`).  
- Clinical content is visit-scoped and retained longitudinally.  
- Audit identifies actor, event, time, entity without dumping full clinical payloads.

---

## 8. Things we must not treat as the same

- Patient registration ≠ appointment  
- Appointment ≠ visit  
- Check-in ≠ completed consultation  
- Cancellation ≠ no-show  
- Rescheduling ≠ deletion  
- Deceased status ≠ deletion of history  
- Medication/history items ≠ full prescription management (deferred)  

---

## 9. Out of MVP scope

Full hospital EMR, FHIR exchange, imaging/lab interfaces, pharmacy dispensing, multi-facility enterprise scheduling.
