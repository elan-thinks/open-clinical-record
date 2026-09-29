# Project Scope

**Last updated:** 2026-09-27 — roles and implemented modules aligned with product.

> Keep the first version small enough to finish within the remaining internship period.

## Product Intent

Open Clinical Record (OCR) is an internship MVP for a **focused outpatient electronic medical record**. It supports day-to-day clinic work around patients, their charts, and appointments—not a full hospital information system.

## In Scope (MVP)

Exactly three business modules:

1. **Patient Management** — registration, unique MRN, search, demographics, status (Active / Inactive / Deceased).
2. **Patient Chart** — longitudinal allergies and history; **per-visit** documentation (vitals, diagnoses, notes) with Draft → Final lifecycle.
3. **Appointment Management** — booking, calendar/list views, status transitions, check-in/queue, cancel with reason, reschedule, event history.

Cross-cutting: authentication (JWT), role-based authorization, validation, audit logging, dashboard stats, health endpoints.

## Out of Scope

- Pharmacy / dispensing
- Laboratory and imaging order management
- Billing and insurance
- Patient portal and native mobile apps
- FHIR / HL7 external exchange
- Multi-facility enterprise scheduling
- AI clinical decision support

## Application Roles (exactly four)

| Role | Claim | Primary responsibilities |
|------|-------|--------------------------|
| **Receptionist / Front Desk** | `Receptionist` | Registration, booking, check-in, cancel/reschedule, mark deceased |
| **Nurse / Clinical Staff** | `Nurse` | Chart support, vitals, visit documentation (write) |
| **Clinician / Doctor** | `Doctor` | Chart review and authorized clinical updates |
| **System Administrator** | `Admin` | Users, audit, system configuration |

Detailed permissions: `docs/06-engineering/access-control-report.md`.

## Cross-Cutting Concerns

Authentication, authorization, validation, error handling, and basic audit logging support the three modules. The **API** is the security boundary; UI route guards are not security.

## Success Criteria

A working application on GitHub `main` with coherent domain rules, automated backend tests, user guide, technical documentation, and SRS—demonstrable end-to-end without expanding into deferred modules.
