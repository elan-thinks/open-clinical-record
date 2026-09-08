# Clinical Workflow Specification

**Project:** Open Clinical Record  
**Status:** Current MVP workflow baseline  
**Purpose:** Define the practical outpatient workflow for the three core internship modules.

## 1. Scope

The MVP covers exactly three business areas:

1. Patient Management
2. Patient Chart
3. Appointment Management

The workflow is intentionally smaller than a complete hospital EMR. Full diagnosis, treatment, prescription, medical-report/document lifecycle, laboratory, pharmacy, billing, radiology, patient portal, external EMR exchange, and FHIR integration are outside the committed MVP.

## 2. Application Roles

| Role | MVP responsibilities |
|---|---|
| Receptionist / Front Desk | Register/search patients, maintain permitted demographics, create/reschedule/cancel appointments, check in patients, and support basic walk-ins |
| Nurse / Clinical Staff | View patient/chart information, support check-in and visit flow, and maintain permitted chart information or observations |
| Clinician / Doctor | Review patient chart/history and perform authorized clinical/chart updates included in the MVP |

There are exactly three application roles. Authentication and authorization are cross-cutting mechanisms, not additional roles.

## 3. Core Patient Flow

```text
Patient
  ↓
Registration / Search
  ↓
Patient Profile / Chart
  ├──────────────→ Appointment
  │                   ↓
  │              Check-in / Arrival
  │                   ↓
  │                  Visit
  │
  └──────────────→ Walk-in
                      ↓
                  Check-in / Arrival
                      ↓
                     Visit
```

A walk-in does not require a fabricated appointment. The visit may exist without an appointment.

## 4. Patient Management Workflow

```text
Register Patient
      ↓
Generate / assign unique patient identifier
      ↓
Search / view profile
      ↓
Update permitted demographics/contact information
      ↓
Maintain basic patient status
```

The system should detect likely duplicate registrations using the available identifying information. Duplicate detection is a safeguard, not a replacement for user review.

## 5. Patient Chart Workflow

The patient chart is the main patient-centered workspace. It should provide a clear view of:

- Patient identity and demographics
- Current patient status
- Allergies
- Relevant medication/history information
- Important patient alerts where required
- Appointment history
- Visit/check-in history

Chart access does not automatically grant permission to modify every chart element. Modification permissions follow the approved role policy.

The MVP does not require a full clinical documentation subsystem.

## 6. Appointment Workflow

```text
Create Appointment
      ↓
Scheduled
  ├── Reschedule → updated date/time + preserved history
  ├── Cancel → cancelled status + preserved history
  ├── Check-in → visit/arrival
  └── No-show → status where included in final MVP
```

An appointment belongs to an existing patient. The system should prevent invalid scheduling operations, including operations disallowed by the patient's status policy.

## 7. Check-in and Walk-in Workflow

### Scheduled patient

```text
Existing Patient
      ↓
Existing Appointment
      ↓
Patient Arrives
      ↓
Check-in
      ↓
Visit
```

### Walk-in patient

```text
Patient
   ↓
Search existing patient OR register new patient
   ↓
Check-in
   ↓
Visit
```

The visit's appointment reference is optional so that a walk-in can be represented without inventing an appointment.

## 8. Visit / Chart History

A visit represents an actual arrival/care episode associated with the patient. The MVP keeps visit/check-in history visible from the patient chart.

Where a visit originates from an appointment, the relationship should be preserved. Where it is a walk-in, the appointment relationship remains empty.

## 9. Patient Status and Deceased Handling

If deceased status is included in the final MVP, the system should:

- Record the status explicitly rather than as an arbitrary note.
- Preserve existing patient, appointment, and chart history.
- Clearly display the status.
- Prevent inappropriate new appointments according to the approved policy.

The exact policy for already-scheduled future appointments remains a stakeholder decision until confirmed.

## 10. Role Boundaries

- Receptionist / Front Desk handles patient registration and appointment operations within permission.
- Nurse / Clinical Staff supports patient flow and permitted chart/observation work.
- Clinician / Doctor performs authorized clinical/chart work included in the MVP.
- Receptionist / Front Desk must not receive provider-only permissions.
- Opening a chart never grants additional authority.
- Important actions should be auditable.

## 11. MVP Business Rules

1. A patient must exist before an appointment can reference that patient.
2. Every patient has one unique patient identifier.
3. Chart information must remain associated with the correct patient.
4. Cancelled appointments are retained in history.
5. Rescheduling does not silently destroy the previous appointment state.
6. A walk-in may create a visit without an appointment.
7. Check-in/arrival is represented separately from the appointment itself.
8. Appointment and visit history remains available from the patient chart.
9. Patient-status rules must be enforced consistently.
10. Only the three approved application roles exist in the MVP.
11. Permissions are enforced by the backend, not only by the UI.
12. Important operations should be auditable.

## 12. Open Decisions Before Implementation

The following should be confirmed with the appropriate clinical stakeholder rather than guessed:

- Which role may create/update allergies?
- Which role may create/update medication history?
- Which chart alerts are required for MVP?
- Whether basic vitals/observations are included in the final MVP.
- Whether No-show is required for the first release.
- The exact deceased-patient appointment policy.
- The minimum required patient-registration fields.
- The minimum audit-event set.

## 13. Validation Status

**Current status:** Current MVP workflow baseline. The workflow is intentionally limited to Patient Management, Patient Chart, and Appointment Management. Open clinical-policy questions require stakeholder confirmation before implementation decisions are frozen.
