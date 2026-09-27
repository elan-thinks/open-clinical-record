# Project Scope

**Last updated:** 2026-09-27 — roles and implemented modules aligned with product.

> Keep the first version small enough to finish within the remaining internship period.

## Project Purpose

Open Clinical Record (OCR) is a focused outpatient EMR internship project. The MVP is deliberately limited to three core business areas:

1. **Patient Management**
2. **Patient Chart**
3. **Appointment Management**

The goal is to deliver a usable, coherent patient-to-appointment workflow within the remaining one-month implementation period rather than attempting to build a full EMR platform.

## MVP Modules

### 1. Patient Management

The system shall support the basic lifecycle of a patient record:

- Register a new patient
- Assign a unique patient identifier
- Search for patients
- View patient profile and basic demographic/contact information
- Update permitted patient information
- Maintain basic patient status (Active / Inactive / Deceased)
- Handle duplicate/invalid patient information appropriately

### 2. Patient Chart

The patient chart shall provide a simple longitudinal view of relevant patient information:

- View patient demographics and status
- Record and view allergies
- Record and view medical history items
- Per-visit documentation: vitals, diagnoses, notes, plan (Draft → Final)
- View appointment and visit history (visits never overwritten)

### 3. Appointment Management

The appointment workflow shall support:

- Create an appointment for a patient
- View appointments (list and calendar)
- Reschedule appointments
- Cancel appointments (reason required)
- Maintain appointment status/history and events
- Check in a patient (creates Draft visit)
- Support walk-in type appointments
- Prevent booking for deceased patients

## Core Workflow

```text
Patient Registration
       ↓
Patient Search / Profile
       ↓
Patient Chart
       ↓
Create Appointment
       ↓
Check-in (Draft Visit)
       ↓
Document / Finalize Visit
       ↓
Appointment Completed · history retained
```

## Users and Roles

The MVP uses **four application roles**:

| Role | Identity claim | Primary responsibility |
|------|----------------|------------------------|
| **Receptionist / Front Desk** | `Receptionist` | Registration, appointments, check-in |
| **Nurse / Clinical Staff** | `Nurse` | Chart support, vitals, visit documentation |
| **Clinician / Doctor** | `Doctor` | Chart review and authorized clinical updates |
| **System Administrator** | `Admin` | Users, audit, system configuration |

Detailed permissions: `docs/05-engineering/access-control-report.md`.

## Cross-Cutting Concerns

- Authentication (JWT)
- Role-based authorization
- Input validation
- Error handling
- Audit logging for important actions

## Explicitly Deferred

- Full hospital EMR breadth (pharmacy, lab, radiology, billing)
- FHIR / external hospital exchange
- Patient portal / mobile apps
- Advanced analytics and AI decision support
- Multi-facility enterprise scheduling
- Complex terminology services

## Scope Rule

1. Patient Management → Chart → Appointments  
2. Cross-cutting security needed by the above  
3. Testing and bug fixing  
4. Optional expansion only after core MVP is solid  

Documentation index: `docs/README.md`.
