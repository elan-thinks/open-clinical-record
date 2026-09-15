# OCR database audit (Week 4)

**SQL:** `docs/05-data/ocr-complete-database.sql`

## Tables (from EF Core)

AspNetUsers/Roles, Patients, PatientAllergies, MedicalHistoryItems, Appointments, AppointmentEvents, ClinicalVisits, VitalSigns, Diagnoses, ClinicalNotes, PatientDeathRecords.

No AuditEvents table yet. No PATIENT_ALERT table (UI-derived).

## Apply

```powershell
cd <repo-root>\open-clinical-record   # not C:\Users\...
psql -U postgres -d open_clinical_record -f docs/05-data/ocr-complete-database.sql
```

Or: `dotnet ef database update` from the API project.
