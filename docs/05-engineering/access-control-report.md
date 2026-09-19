# Access control audit report — Patients, Appointments, Deceased

**Date:** 2026-09-19  
**Scope:** Role-based access for register patient, book appointment, mark/clear deceased, clinical chart writes  
**Automated tests:** `tests/backend/OpenClinicalRecord.Api.Tests/AccessMatrixTests.cs`

---

## 1. Seed accounts (Development)

| Email | Role | Password (default) |
|-------|------|--------------------|
| `admin@clinic.local` | Admin | `Dev@12345` |
| `doctor@clinic.local` | Doctor | `Dev@12345` |
| `nurse@clinic.local` | Nurse | `Dev@12345` |
| `desk@clinic.local` | Receptionist | `Dev@12345` |

---

## 2. Authorization matrix (expected)

| Action | Endpoint | Admin | Doctor | Nurse | Receptionist | Anonymous |
|--------|----------|:-----:|:------:|:-----:|:------------:|:---------:|
| List patients | `GET /api/patients` | ✓ | ✓ | ✓ | ✓ | **401** |
| Create patient | `POST /api/patients` | ✓ | ✓ | ✓ | ✓ | **401** |
| Update patient | `PUT /api/patients/{id}` | ✓ | ✓ | ✓ | ✓ | **401** |
| **Mark deceased** | `POST .../deceased` | ✓ | ✓ | **403** | ✓ | **401** |
| **Clear deceased** | `POST .../deceased/clear` | ✓ | ✓ | **403** | **403** | **401** |
| List appointments | `GET /api/appointments` | ✓ | ✓ | ✓ | ✓ | **401** |
| **Create appointment** | `POST /api/appointments` | ✓ | ✓ | ✓ | ✓ | **401** |
| Update appt status | `PATCH .../status` | ✓ | ✓ | ✓ | ✓ | **401** |
| Chart read | `GET .../chart` | ✓ | ✓ | ✓ | ✓ | **401** |
| Chart write (visit/allergy) | `POST .../chart/...` | **403** | ✓ | ✓ | **403** | **401** |
| List users | `GET /api/users` | ✓ | **403** | **403** | **403** | **401** |

**Business rule:** cannot create an appointment for a **Deceased** patient → **400** (all roles).

---

## 3. Policies (after this audit)

| Policy | Who |
|--------|-----|
| `CanManagePatients` | Admin, Receptionist, Doctor, Nurse |
| `StaffCanBook` | Admin, Receptionist, Doctor, Nurse |
| `CanMarkDeceased` | Admin, Doctor, Receptionist (**not Nurse**) |
| `CanClearDeceased` | Admin, Doctor only |
| `ClinicalStaff` | Doctor, Nurse |
| `AdminOnly` | Admin |

Policies use **assertion helpers** that read both `"role"` and `ClaimTypes.Role` claims so JWT role mapping cannot silently 403 legitimate staff.

---

## 4. Issues found previously (root causes)

1. **JWT role claims not always visible** to `[Authorize(Roles=...)]` → intermittent **403** on appointments/patients for “most users”.  
   **Fix:** dual role claims in token + `OnTokenValidated` normalize + assertion-based policies.

2. **Mixed style** (`Roles = "A,B"` vs policies) → harder to reason about.  
   **Fix:** patients + clinical chart moved to named policies.

3. **Nurse can open “Mark deceased” in UI** but API returns **403** — by design in matrix above.  
   **Recommendation:** hide the button for Nurse in the frontend (roles from `/api/auth/me`).

4. **500 on appointment create** was **not** permission — DB/history table; hardened separately.

---

## 5. How to run the complete automated test

```bash
cd tests/backend/OpenClinicalRecord.Api.Tests
dotnet test --filter "FullyQualifiedName~AccessMatrixTests"
```

Or full suite:

```bash
dotnet test tests/backend/OpenClinicalRecord.Api.Tests
```

---

## 6. Manual smoke checklist (5 minutes)

1. Sign out → call any protected API without token → expect **401**.  
2. Login as **desk** → register patient → book appointment → expect **201**.  
3. Login as **nurse** → try Mark deceased → expect **403** (or button hidden).  
4. Login as **doctor** → Mark deceased → expect **200**; try book for that patient as desk → **400**.  
5. Login as **admin** → Clear deceased → expect **200**.  
6. Login as **desk** → try create visit/allergy → expect **403**.  
7. Login as **nurse** → create visit → expect **201**.

---

## 7. Summary

| Area | Status |
|------|--------|
| Authn (login / JWT) | OK when API restarted + fresh login |
| Role claims in token | Hardened |
| Patient register | All four staff roles |
| Appointment book | All four staff roles (`StaffCanBook`) |
| Mark deceased | Admin, Doctor, Receptionist |
| Clear deceased | Admin, Doctor |
| Clinical writes | Doctor, Nurse |
| Automated matrix tests | Added `AccessMatrixTests` |

If a **403** still appears for an allowed role, **sign out and sign in again** so the browser uses a token issued after the JWT/policy fixes.
