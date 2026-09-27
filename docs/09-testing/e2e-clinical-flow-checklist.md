# Manual E2E checklist — clinical flow

**Last updated:** 2026-09-27  

**Goal:** Prove Patient → Appointment → Check-in → Visit → second visit without overwriting history; cancel/reschedule; finalize clears queue.

Seed users (default password `Dev@12345` unless `OCR_SEED_PASSWORD` is set):

| Email | Role |
|-------|------|
| `admin@clinic.local` | Admin |
| `doctor@clinic.local` | Doctor |
| `nurse@clinic.local` | Nurse |
| `desk@clinic.local` | Receptionist |

## Revisit (must not overwrite)

1. Register patient (desk).  
2. Book appointment + check-in → record vitals / note (nurse or doctor).  
3. Second appointment / check-in → different vitals.  
4. Chart visit history must show **two** visits.

## Finalize and queue

1. Check in a patient (status **CheckedIn**, Draft visit).  
2. Doctor/nurse documents and sets visit **Final**.  
3. Appointment becomes **Completed** and disappears from active check-in queue.

## Cancel and reschedule

1. Cancel a **Scheduled** appointment with a **reason** (modal) → status Cancelled.  
2. Reschedule a Scheduled/Waiting/Cancelled/NoShow appointment to a new slot → event recorded.

## Access smoke

1. Anonymous API call → 401.  
2. Desk cannot create clinical visit → 403.  
3. Nurse cannot mark deceased → 403.  

## Automated

```bash
cd tests/backend/OpenClinicalRecord.Api.Tests
dotnet test
```
