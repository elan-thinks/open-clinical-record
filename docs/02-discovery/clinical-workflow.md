# Clinical Workflow Specification

**Project:** Open Clinical Record  
**Status:** Mentor-approved MVP baseline; broader clinical validation pending  
**Purpose:** Define the focused outpatient workflow that guides requirements and design for the internship MVP.

## 1. Purpose

This document describes the approved MVP workflow for Open Clinical Record (OCR). Following mentor feedback, the workflow is intentionally limited to three core areas:

1. Patient Management
2. Patient Chart
3. Appointment Management

The workflow supports patient registration/search, chart access, appointment handling, and check-in/visit history. Full clinical encounter documentation is outside the committed MVP.

## 2. Actors

The MVP uses exactly three application roles:

| Actor | Primary MVP responsibilities |
|---|---|
| Receptionist / Front Desk | Register/search patients, maintain permitted demographics, create/reschedule/cancel appointments, and perform check-in/basic walk-in intake |
| Nurse / Clinical Staff | View patient/chart information, support check-in/visit workflow, and maintain permitted chart information or basic observations |
| Clinician / Doctor | Review patient charts/history and perform authorized chart updates required by the MVP |

There is no Administrator role in the MVP application model.

## 3. Approved MVP Workflow

```text
PATIENT
  ↓
Register / Search / Identify
  ↓
Patient Profile / Chart
  ├── View demographics and status
  ├── View allergies / medication history / alerts
  └── View appointment and visit history
          ↓
    Appointment Management
      ├── Create appointment
      ├── Reschedule
      └── Cancel
          ↓
      Check-in / Visit
      ├── Scheduled appointment
      └── Walk-in without a fabricated appointment
          ↓
      Patient history updated
```

The patient is the central record. Appointment and visit information remains linked to the correct patient.

## 4. Patient Management Workflow

```text
Register patient
      ↓
Assign unique patient identifier
      ↓
Search / identify patient
      ↓
View or update permitted information
```

The system should detect likely duplicate registrations and prevent invalid patient relationships.

## 5. Patient Chart Workflow

The patient chart provides a focused longitudinal view of information available in the MVP:

- Demographics and contact information
- Patient status
- Allergies
- Relevant medication/history information
- Important patient alerts where required
- Appointment history
- Visit/check-in history

Chart access and chart modification are separate permissions. A user being able to open a chart does not automatically allow every type of update.

## 6. Appointment Lifecycle

The MVP supports a deliberately simple appointment lifecycle:

```text
Scheduled
   ├── Checked-in / Arrived
   │       ↓
   │   Completed
   │
   ├── Cancelled
   │       ↓
   │   History retained
   │
   └── Rescheduled
           ↓
       New date/time
       + history retained
```

No-show may be included if it is confirmed as necessary during implementation. Appointment states must not silently destroy historical information.

## 7. Check-in and Walk-in Workflow

### Scheduled patient

```text
Existing appointment
      ↓
Patient arrives
      ↓
Check-in
      ↓
Visit created/updated
      ↓
Patient history reflects attendance
```

### Walk-in patient

```text
Patient arrives without appointment
      ↓
Search existing patient OR register patient
      ↓
Check-in / create visit
      ↓
Patient history reflects visit
```

A walk-in visit may exist without an appointment reference. The system must not create a fake appointment merely to support the data model.

## 8. Visit Concept

A visit represents an actual patient attendance/check-in. It is distinct from an appointment, which represents planned care.

For the MVP, the visit model should remain simple. A visit may reference an appointment when one exists, or have no appointment reference for a walk-in.

Detailed encounter documentation is not part of the MVP.

## 9. Patient Status / Deceased Handling

Basic patient status may be maintained when required by the approved workflow. If deceased status is implemented, the system should:

- preserve existing patient history;
- clearly display the status;
- prevent inappropriate future appointments; and
- handle existing future appointments according to the approved policy.

The exact deceased-patient policy remains a mentor/clinical stakeholder decision if this feature is included in the MVP.

## 10. Role and Permission Principles

- The MVP contains exactly three application roles.
- Receptionist / Front Desk is the primary patient-registration and appointment-management role.
- Nurse / Clinical Staff supports patient flow, check-in/visit workflow, and permitted chart/observation updates.
- Clinician / Doctor reviews patient history and performs authorized chart updates required by the MVP.
- Chart access does not automatically grant modification authority.
- Backend authorization must enforce permissions; hiding a UI control is not sufficient.
- Important actions should be auditable.

## 11. Key Business Rules

1. A patient must exist before an appointment or visit can be associated with that patient.
2. Each patient has a unique patient identifier.
3. Patient chart information must remain associated with the correct patient.
4. Cancelled appointments remain visible in history.
5. Rescheduling preserves enough information to understand the previous appointment state.
6. A walk-in may create a visit without a prior appointment.
7. A visit may reference an appointment when applicable.
8. Appointment actions must respect applicable patient and appointment status rules.
9. A user does not gain additional authority merely by opening a patient chart.
10. Important patient and appointment actions should be auditable.

## 12. Open Decisions for MVP Confirmation

The following should be confirmed before implementation is treated as final:

- Which role may add/update allergies?
- Which role may add/update medication history?
- Which role may add/update patient alerts?
- Which role may change basic patient status?
- Whether No-show is required in the first release.
- Whether basic vital signs are necessary for the Patient Chart MVP.
- What should happen to future appointments when a patient is marked deceased.
- Which audit events are mandatory.
- What backup/restore procedure is practical for the internship deployment.

These are focused decisions, not reasons to expand the MVP into a full clinical documentation system.

## 13. Scope Boundary

The following are outside the committed internship MVP:

- Full clinical encounter documentation
- Diagnosis and treatment documentation
- Prescription management
- Full clinical notes/report generation
- Clinical document finalization/amendment/versioning
- Laboratory, pharmacy, billing, insurance, and radiology
- Patient portal/mobile application
- External EMR exchange or FHIR integration
- Advanced analytics and enterprise scheduling
- AI clinical decision support

Research documents may discuss these topics as domain context or future work, but they must not be treated as current implementation commitments.

## 14. Validation Status

**Current status:** Mentor-approved three-module workflow baseline. Preliminary clinical feedback has informed the project, but broader clinical validation remains pending.
