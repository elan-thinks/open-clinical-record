# Access control audit report — Patients, Appointments, Deceased

**Date:** 2026-09-19 (reviewed 2026-09-27)  
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
| Reschedule appointment | `PATCH .../reschedule` | ✓ | ✓ | ✓ | ✓ | **401** |
| Chart read | `GET .../chart` | ✓ | ✓ | ✓ | ✓ | **401** |
| Chart write (visit/allergy) | `POST/PATCH .../chart/...` | **403** | ✓ | ✓ | **403** | **401** |
| List users / audit | Admin APIs | ✓ | **403** | **403** | **403** | **401** |

**Business rule:** cannot create an appointment for a **Deceased** patient → **400** (all roles).

Cancel appointment requires a **non-empty reason**.

---

## 3. Policies

| Policy | Who |
|--------|-----|
| `CanManagePatients` | Admin, Receptionist, Doctor, Nurse |
| `StaffCanBook` | Admin, Receptionist, Doctor, Nurse |
| `CanMarkDeceased` | Admin, Doctor, Receptionist (**not Nurse**) |
| `CanClearDeceased` | Admin, Doctor only |
| `ClinicalStaff` | Doctor, Nurse |
| `AdminOnly` | Admin |

---

## 4. Manual smoke

1. Anonymous → **401**.  
2. Desk → register + book → **201**.  
3. Nurse → mark deceased → **403**.  
4. Doctor → mark deceased → **200**; book for that patient → **400**.  
5. Admin → clear deceased → **200**.  
6. Desk → create visit → **403**.  
7. Nurse → create visit → **201**.

If a **403** appears for an allowed role, sign out and sign in again for a fresh JWT.
