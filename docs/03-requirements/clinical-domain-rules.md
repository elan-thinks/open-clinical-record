# Clinical Domain Rules & System Behavior

**Status:** Supporting technical reference for the MVP  
**Scope:** Open Clinical Record — Patient Management, Patient Chart, Appointment Management  
**Application roles:** Clinician / Doctor, Nurse / Clinical Staff, Receptionist / Front Desk

> This document explains domain rules that affect requirements, data modeling, UX, and testing. The approved SRS and mentor decisions take precedence over this reference.

## 1. Core Principle

The MVP treats patient registration, appointments, check-in, visits, and chart information as related but distinct concepts.

```text
Patient
  ├── Profile / status
  ├── Chart information
  │     ├── Allergies
  │     ├── Medication history
  │     └── Important alerts
  └── Appointments / visits
        ├── Scheduled appointment
        ├── Checked-in visit
        ├── Cancelled appointment
        ├── Rescheduled appointment
        └── Walk-in visit
```

Full clinical encounter documentation, diagnosis, treatment, prescriptions, and medical-report/document workflows are outside the committed MVP.

## 2. Patient Identity and History

### 2.1 Registration is not a visit

A patient can be registered without attending the clinic. Registration must not automatically create a visit or appointment.

### 2.2 Unique patient identity

Each patient must have one unique patient identifier within the system. The application should detect likely duplicate registrations and let the user review the result rather than silently creating duplicate records.

### 2.3 Patient status

Patient status is an explicit field, not an arbitrary note. If deceased status is included in the final MVP, existing history must remain preserved and new activity must follow the approved policy.

## 3. Patient Chart

The patient chart is the main patient-centered workspace. At minimum, the MVP may contain:

- Patient identity and demographics
- Patient status
- Allergies
- Relevant medication/history information
- Important patient alerts where required
- Appointment history
- Visit/check-in history

Chart access does not automatically grant permission to modify every item. Permissions are role-based and enforced by the backend.

## 4. Appointment Behavior

An appointment represents planned care for an existing patient.

```text
Scheduled
 ├── Checked-in / Arrived
 ├── Cancelled
 ├── No-show (if included in final MVP)
 └── Rescheduled
```

Rules:

1. An appointment must reference an existing patient.
2. Cancellation does not silently delete the appointment.
3. Rescheduling preserves enough information to understand the previous state.
4. No-show, if supported, remains distinct from cancellation.
5. Check-in indicates arrival and does not by itself mean that consultation was completed.

## 5. Walk-in Behavior

A walk-in may arrive without a scheduled appointment.

```text
Walk-in
  → Find or register patient
  → Check-in / Arrival
  → Visit
```

The data model must allow a visit/check-in record without an appointment reference. The MVP does not require complex triage or queue optimization.

## 6. Visit / Check-in

A visit represents an actual attendance/care episode associated with a patient. When it originates from an appointment, the appointment relationship should be preserved. When it is a walk-in, the appointment relationship is empty.

The MVP uses the visit/check-in concept only as needed to support appointment attendance, walk-ins, and patient history. It does not require a separate enterprise encounter subsystem.

## 7. Basic Chart Information

Where included in the final MVP, the chart may support:

- Allergies and reactions
- Relevant medication history
- Important patient alerts
- Basic observations/vitals if confirmed as required

The exact fields and role permissions must be finalized before implementation. Medication history must not be confused with prescription management.

## 8. Role Boundaries

### Receptionist / Front Desk

- Register and search patients
- Maintain permitted demographic/contact information
- Create, reschedule, and cancel appointments
- Check in patients
- Support basic walk-in intake

### Nurse / Clinical Staff

- View patient/chart information according to permission
- Support check-in and visit flow
- Maintain permitted chart information or observations

### Clinician / Doctor

- Review patient charts/history
- Perform authorized chart updates included in the MVP
- Perform other clinical actions only when explicitly included and approved

No Administrator role exists in the MVP.

## 9. History and Audit

Important changes should remain understandable over time. At minimum, appointment history should preserve meaningful cancellation and rescheduling information. Important patient/chart changes may be recorded in a minimal audit mechanism.

Audit records should identify the actor, event, time, and affected entity without unnecessarily copying sensitive clinical content.

## 10. Derived Information

Where possible, values should be derived from authoritative records instead of maintained as duplicate flags.

| Concept | Preferred source |
|---|---|
| Appointment attendance | Appointment/check-in state |
| No-show | Appointment status |
| Reschedule history | Appointment history/event records |
| Cancellation history | Appointment history/event records |
| Visit history | Visit records |
| Patient timeline | Chronological patient-linked events |

## 11. Things We Must Not Treat as the Same

- Patient registration ≠ appointment
- Appointment ≠ visit/check-in
- Check-in ≠ completed clinical consultation
- Cancellation ≠ no-show
- Rescheduling ≠ deletion
- Patient status = deceased ≠ deletion of patient history
- Medication history ≠ prescription management

## 12. Data-Model Implications

The final ERD should evaluate only the entities justified by the approved MVP. Expected core concepts are:

- Patient
- User
- Allergy
- Medication History
- Patient Alert
- Appointment
- Appointment History/Event where required to preserve changes
- Visit
- Audit Event

Vital signs/observations may be included only if they are confirmed as part of the final MVP.

The ERD must not introduce diagnosis, treatment/care-plan, prescription, clinical-document, report, laboratory, pharmacy, billing, insurance, radiology, portal, FHIR, or other deferred modules as implementation commitments.

## 13. Open Decisions Before Implementation

1. Which role may create/update allergies?
2. Which role may create/update medication history?
3. Which patient alerts are required?
4. Are basic vitals/observations part of the MVP?
5. Is No-show required in the first release?
6. What is the exact deceased-patient appointment policy?
7. What minimum fields are required for patient registration?
8. Which events must be audited?

## 14. Relationship to Other Documents

- The **SRS** defines the approved requirements and scope.
- The **clinical workflow** describes the approved operational flow.
- This document provides supporting domain rules.
- The **architecture** defines system boundaries and components.
- The **ERD/data model** defines persistent entities and relationships.

If this document conflicts with the SRS or a later mentor/clinical decision, the approved requirement or decision wins and this document must be updated.
