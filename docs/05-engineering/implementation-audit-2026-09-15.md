# Implementation audit — 15 Sep 2026

**Scope:** Steps 2–5 after four-role alignment  
**Method:** Docs (SRS / ERD / role guide) ↔ EF Core entities ↔ API Authorize attributes ↔ React routes

---

## 1. Summary verdict

| Area | Status | Notes |
|------|--------|--------|
| Four roles (Admin + clinical three) | 🟢 Aligned in code + primary docs | Claim names: `Admin`, `Doctor`, `Nurse`, `Receptionist` |
| Patient → Visit → Encounter | 🟢 Implemented | `ClinicalVisit` + vitals / diagnosis / notes; history not overwritten |
| Appointment → Check-in → Visit | 🟢 Implemented | `PATCH …/status` → `CheckedIn` creates Draft `ClinicalVisit` |
| Death record | 🟢 Implemented | `PatientDeathRecord` + mark/clear/get endpoints |
| ERD ↔ EF | 🟡 Gaps | See §2 |
| SRS ↔ implementation | 🟡 Gaps | Diagnosis/notes exist while SRS still defers full encounter docs |
| API authorization | 🟡 Mostly OK | Matrix in §4; a few tighten/clarify items |
| Frontend route guards | 🟢 Reasonable | Matches role intent; backend still authoritative |

**Do not invent new modules.** Finish alignment, authorization tests, and chart polish.

---

## 2. ERD ↔ EF Core mapping

| ERD concept | EF entity / table | Match |
|-------------|-------------------|--------|
| PATIENT | `Patient` / `Patients` | 🟢 |
| ALLERGY | `PatientAllergy` / `PatientAllergies` | 🟢 |
| MEDICATION_HISTORY | `MedicalHistoryItem` / `MedicalHistoryItems` | 🟡 Category-based (Medication + Condition + …) |
| PATIENT_ALERT | — | 🟡 **No separate entity.** Alerts derived from active history + allergies in chart UI |
| APPOINTMENT | `Appointment` / `Appointments` | 🟢 |
| APPOINTMENT_HISTORY_EVENT | `AppointmentEvent` / `AppointmentEvents` | 🟢 |
| VISIT | `ClinicalVisit` / `ClinicalVisits` | 🟢 |
| USER | Identity `ApplicationUser` + AspNet* | 🟢 |
| AUDIT_EVENT | — | 🔴 **Not implemented** |
| Diagnosis / ClinicalNote / VitalSigns | Present on visits | 🟡 Ahead of original “defer full encounter” wording |
| PatientDeathRecord | `PatientDeathRecord` | 🟢 |

### Recommended ERD/doc updates (documentation only)

1. Add ClinicalVisit children: VitalSigns, Diagnosis, ClinicalNote.
2. Map PATIENT_ALERT → logical (allergies + active history) until a dedicated table is justified.
3. Mark AUDIT_EVENT as future.
4. Add PatientDeathRecord.

---

## 3. Clinical flow check

```text
Patient registered (Receptionist/Admin)
    → Appointment created (Receptionist/Admin)
    → Status → CheckedIn
    → ClinicalVisit Draft created (backend)
    → Vitals / consultation POST visits (Doctor/Nurse) → new visit rows
    → Chart Visit history lists all visits
```

Do **not** redesign this path.

---

## 4. API authorization (high level)

- Login: anonymous; `/api/auth/me`: authenticated.
- Patients POST: Admin, Receptionist. PUT: Admin, Receptionist, Doctor, Nurse.
- Chart writes (allergies/history/visits): Doctor, Nurse.
- Appointments POST: Admin, Receptionist. Status PATCH: Admin, Receptionist, Doctor, Nurse.
- Users/Roles: AdminOnly policy.
- Unauthenticated protected GET → 401 (smoke tests added).

### Policy confirmations still needed

- May Receptionist mark deceased?
- May Receptionist GET full chart?

---

## 5. Priority fixes

| Pri | Item |
|-----|------|
| 🟠 P1 | Expand role 403 tests with seeded host |
| 🟠 P1 | Refresh ERD artifact to match §2 |
| 🟡 P2 | SRS wording: basic visit docs in MVP |
| 🔵 P3 | AUDIT_EVENT entity (future) |

---

## 6. Next work order

1. Authorization integration tests (403 by role).
2. ERD refresh.
3. Chart UI consistency.
4. Manual E2E: register → book → check-in → vitals → second visit → history shows two.
