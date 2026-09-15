# Manual E2E checklist — clinical flow

**Goal:** Prove Patient → Appointment → Check-in → Visit → second visit without overwriting history.

Seed users (default password `Dev@12345` unless `OCR_SEED_PASSWORD` is set):

| Email | Role |
|-------|------|
| `admin@clinic.local` | Admin |
| `doctor@clinic.local` | Doctor |
| `nurse@clinic.local` | Nurse |
| `desk@clinic.local` | Receptionist |

## Revisit (must not overwrite)

1. Register patient (desk).
2. Book + check-in → record vitals (nurse).
3. Second appointment / check-in → different vitals.
4. Chart Visit history must show **two** visits.

## Automated

```bash
cd tests/backend/OpenClinicalRecord.Api.Tests
dotnet test
```
