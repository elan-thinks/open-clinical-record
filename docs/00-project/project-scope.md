# Open Clinical Record — Project Scope

**Status:** MVP baseline (Week 8)

## Product

Open Clinical Record (OCR) is an **outpatient** electronic medical record internship MVP with three modules only:

1. **Patient Management** — registration, unique MRN, search, demographics, status (including deceased policy)
2. **Patient Chart** — longitudinal allergies/history and **per-visit** documentation (vitals, diagnoses, notes)
3. **Appointment Management** — booking, status transitions, check-in/queue, cancel with reason, reschedule

## Explicitly out of scope

Pharmacy, laboratory, radiology, billing/insurance, patient portal, FHIR/HL7 exchange, multi-facility enterprise scheduling, AI clinical decision support.

## Application roles (exactly four)

| Role | Claim | Primary responsibilities |
|------|-------|--------------------------|
| **Receptionist / Front Desk** | `Receptionist` | Registration, booking, check-in, cancel/reschedule, mark deceased |
| **Nurse / Clinical Staff** | `Nurse` | Chart support, vitals, visit documentation (write) |
| **Clinician / Doctor** | `Doctor` | Chart review and authorized clinical updates |
| **System Administrator** | `Admin` | Users, audit, system configuration |

Detailed permissions: `docs/06-engineering/access-control-report.md`.

## Cross-Cutting Concerns

Authentication (JWT), role-based authorization, validation, audit logging, and clear error handling support the three modules. The API is the security boundary; the UI only shapes experience.

## Success for the internship

A demonstrable system on GitHub `main` with coherent domain rules, automated backend tests, user guide, technical documentation, and SRS — not a hospital-wide information system.
