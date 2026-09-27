# Data documentation

**Last updated:** 2026-09-27

| Artifact | Role |
|----------|------|
| `ocr-database-audit.md` | FK policy, history safety, alignment notes |
| `ocr-complete-database.sql` | Reference schema dump for reading — **not** applied in preference to EF migrations |

## Source of truth

Runtime schema is defined by:

`src/backend/OpenClinicalRecord.Api/Data/AppDbContext.cs`  
`src/backend/OpenClinicalRecord.Api/Migrations/`

When migrations change, update or regenerate the reference SQL if it is still needed for reviewers who prefer `.sql` files.

## Core tables (MVP)

Patients, PatientAllergies, MedicalHistoryItems, ClinicalVisits, VitalSigns, Diagnoses, ClinicalNotes, Appointments, AppointmentEvents, PatientDeathRecords, AuditEvents (plus Identity tables for users/roles).
