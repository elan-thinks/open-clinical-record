# OCR database audit (Week 4)

**Reference SQL:** `docs/05-data/ocr-complete-database.sql`

## Current EF model

The application data model includes:

- ASP.NET Core Identity: users, roles, claims, logins, tokens
- `Patients`
- `PatientAllergies`
- `MedicalHistoryItems`
- `Appointments`
- `AppointmentEvents`
- `ClinicalVisits`
- `VitalSigns`
- `Diagnoses`
- `ClinicalNotes`
- `PatientDeathRecords`

The model now explicitly configures the two previously unregistered entity classes (`AppointmentEvent` and `PatientDeathRecord`) in `AppDbContext`.

## Clinical history safety

Patient-owned historical records use **RESTRICT** foreign keys. A patient is not hard-deleted as a way of changing lifecycle state; the application uses Active/Inactive/Deceased status and retains the longitudinal record.

Appointment events are subordinate to an appointment and therefore use **CASCADE** from Appointment → AppointmentEvents.

Clinical content is subordinate to a visit and uses **CASCADE** from Visit → VitalSigns/Diagnoses/ClinicalNotes.

A visit's optional Appointment relationship uses **SET NULL**, so removing an appointment relationship does not erase the clinical visit.

The death record is provenance for deceased status and uses **RESTRICT** from Patient → PatientDeathRecords.

## Important alignment fixes applied

- `Patient.Notes`: EF and reference SQL are both `varchar(500)`.
- `ClinicalVisit`: EpisodeLabel, Location, Department, finalized-user fields, and Appointment relationship are explicitly configured.
- `VitalSigns`: EF precision is explicit for temperature, weight, and height.
- `Patient.Status`: `Active | Inactive | Deceased` check constraint is represented in EF and SQL.
- `ClinicalVisit.Status`: `Draft | Final | Cancelled` check constraint is represented in EF and SQL.
- `AppointmentEvents` and `PatientDeathRecords` are included in the EF model and reference SQL.
- No `AuditEvents` table is claimed as implemented yet.
- No `PATIENT_ALERT` table is claimed as implemented; alerts remain a UI/application concern for the MVP.

## Migrations

A follow-up migration is committed at:

`src/backend/OpenClinicalRecord.Api/Data/Migrations/20260915143000_AlignClinicalHistoryModel.cs`

It adds `AppointmentEvents` and `PatientDeathRecords`, changes patient-owned clinical relationships to `RESTRICT`, and adds the status constraints represented by the EF model.

Apply the committed migrations from the repository root:

```powershell
dotnet ef database update --project src/backend/OpenClinicalRecord.Api --startup-project src/backend/OpenClinicalRecord.Api
```

For a fresh reference database, the complete SQL script can be applied directly:

```powershell
psql -U postgres -d open_clinical_record -f docs/05-data/ocr-complete-database.sql
```

**Rule:** use EF migrations as the live application's migration source; use the SQL file as the complete PostgreSQL reference/bootstrap script. Do not treat the reference SQL as a replacement for EF migrations on an existing database.
