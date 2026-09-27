# Role-Based System Guide

**Product:** Open Clinical Record (OCR)  
**Document:** Role-Based System Guide  
**Status:** Current product/UX guide (aligned 2026-09-27)  
**Scope:** Patient Management, Patient Chart, Appointment Management  
**Roles covered:** Clinician / Doctor, Nurse / Clinical Staff, Receptionist / Front Desk, System Administrator

> This guide defines how the product should behave and what each role should see and do after login. **Four application roles** are implemented (including System Administrator). API enforcement matrix: `docs/05-engineering/access-control-report.md`. Domain statuses: `docs/03-requirements/clinical-domain-rules.md`.

---

## 1. Product Principle

Open Clinical Record is a role-aware clinical application. Users should not receive the same workspace with a few buttons hidden. After authentication, the system should load a workspace designed around the user's responsibilities.

The four roles have different goals:

| Role | Primary goal |
|---|---|
| **Clinician / Doctor** | Review patient information and perform authorized clinical/chart work |
| **Nurse / Clinical Staff** | Support patient care, observations, and visit workflow |
| **Receptionist / Front Desk** | Register patients, manage appointments, and handle arrival/check-in |
| **System Administrator** | Manage users, permissions, configuration, security, and system operations |

### Core authorization rule

**The frontend controls what the user can see; the backend controls what the user is allowed to do.**

Hiding a button is not security. Every protected API operation must independently enforce authorization.

---

## 2. Shared Application Shell

All authenticated users should use a consistent application shell so the product feels like one system rather than four unrelated applications.

### Shared shell elements

- Application logo/name: **Open Clinical Record**
- Role-aware sidebar navigation
- Global patient search where permitted
- Current user name and role
- Logout
- Responsive content area

### Shared UX behavior

- Clearly show the current role in the user profile/menu.
- Preserve patient context when moving between related patient screens.
- Do not expose navigation items for functions the role cannot access.
- If a user reaches a protected route directly, the backend must still reject unauthorized requests.
- Destructive or sensitive actions require clear confirmation.

---

## 3. Clinician / Doctor

**Purpose:** Review patient clinical context and perform authorized chart activities.

**Typical nav:** Dashboard, Patients, Medical Chart, Medical Records, Appointments.

**Can:** search/open patients, view chart, clinical writes (visits, allergies, history per API), mark/clear deceased.

**Normally not:** user/role administration as primary work (Admin owns that).

---

## 4. Nurse / Clinical Staff

**Purpose:** Patient preparation, vitals, visit support.

**Typical nav:** Dashboard, Patients, Chart, Appointments, Check-in support.

**Can:** chart writes (ClinicalStaff policy), vitals, visits.

**Cannot:** mark deceased (403).

---

## 5. Receptionist / Front Desk

**Purpose:** Registration, scheduling, arrival.

**Typical nav:** Dashboard, Patients, Register, Appointments, Check-in / Queue.

**Can:** register, book, reschedule, cancel (with reason), check-in, mark deceased.

**Cannot:** clinical visit/allergy writes (403).

---

## 6. System Administrator

**Purpose:** Application security and configuration, not clinical care.

**Typical nav:** Dashboard, Users, Audit, operational Patients/Appointments as needed.

**Can:** user management, audit list, booking and deceased clear per matrix.

Admin is **not** automatically a clinician author for chart content (clinical writes remain Doctor/Nurse).

---

## 7. Permission matrix (product baseline)

Live API enforcement: **`docs/05-engineering/access-control-report.md`**.

| Capability | Doctor | Nurse | Receptionist | Admin |
|---|:---:|:---:|:---:|:---:|
| Login | ✓ | ✓ | ✓ | ✓ |
| Register patient | ✓ | ✓ | ✓ | ✓ |
| Book appointment | ✓ | ✓ | ✓ | ✓ |
| Reschedule / cancel | ✓ | ✓ | ✓ | ✓ |
| Check-in | ✓ | ✓ | ✓ | ✓ |
| Clinical chart write | ✓ | ✓ | ✗ | ✗ |
| Mark deceased | ✓ | ✗ | ✓ | ✓ |
| Clear deceased | ✓ | ✗ | ✗ | ✓ |
| Audit / users | ✗ | ✗ | ✗ | ✓ |

---

## 8. Login flow

```text
Login → JWT with role claims → role-aware dashboard → backend enforces every API
```

Seed accounts and passwords: access-control report.
