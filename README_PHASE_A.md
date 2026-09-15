# Phase A applied (local commit eadf102)

## Done
1. Migration `20260915045932_AddClinicalAndAppointments` — PatientAllergies, MedicalHistoryItems, ClinicalVisits, VitalSigns, Diagnoses, ClinicalNotes, Appointments.
2. Patient FK delete behavior: **Restrict** (no cascade wipe of clinical history).
3. Visit-owned vitals/diagnoses/notes still cascade with the visit aggregate.
4. JWT: startup fails if key missing or < 32 chars; prefer env `OCR_JWT_KEY`; Development key only in appsettings.Development.json.

## Apply on your machine
```bash
cd src/backend/OpenClinicalRecord.Api
export NOVATECH_PG_PASSWORD=...
export OCR_JWT_KEY=...   # or use Development appsettings
dotnet ef database update
```

Local git is **2 commits ahead** of origin; full MVP push needs GitHub credentials (`git push`).
