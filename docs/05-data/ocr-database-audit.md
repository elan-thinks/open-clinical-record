# OCR database audit & inventory (Week 4)

**Authoritative SQL:** `docs/05-data/ocr-complete-database.sql`

## Table inventory (actual EF)

| Table | Existing | Notes |
|-------|----------|-------|
| AspNetUsers/Roles/UserRoles/... | Yes | Identity + FullName/IsActive/CreatedAt |
| Patients | Yes | MRN unique |
| PatientAllergies | Yes | Restrict on patient |
| MedicalHistoryItems | Yes | Category includes Medication |
| Appointments | Yes | Status lifecycle |
| AppointmentEvents | Yes | Cascade with appointment |
| ClinicalVisits | Yes | 1 patient → many visits; AppointmentId optional |
| VitalSigns | Yes | 1:1 visit (unique VisitId) |
| Diagnoses | Yes | On visit |
| ClinicalNotes | Yes | On visit |
| PatientDeathRecords | Yes | One active per patient (partial unique) |
| AuditEvents | **No** | Deferred |
| PATIENT_ALERT | **No** | UI-derived |

## Critical rules

- New visit = INSERT (never overwrite prior visit rows).
- Check-in creates Draft ClinicalVisit.
- Walk-in: AppointmentId NULL.
- Roles: Doctor, Nurse, Receptionist, Admin (claims).

## Revisit acceptance

Seed Visit 1: temp 38.1, pulse 90. Visit 2: 36.8, 74. Query Visit 1 after Visit 2 — must still be 38.1/90.
