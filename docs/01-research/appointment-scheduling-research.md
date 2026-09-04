# Appointment & Scheduling Research

**Status:** Discovery research
**Date:** 2026-09-04

## Purpose

Understand how established EMR platforms model appointments and scheduling, how an appointment becomes an actual clinical visit/encounter, and which behaviors are appropriate for the Open Clinical Record MVP.

## Questions

- What information belongs to an appointment?
- How are provider, location, appointment type and time represented?
- What happens when a patient arrives?
- How should cancellation, rescheduling, no-show and completion work?
- What is the relationship between appointment, visit and encounter?
- What should happen when a patient has future appointments but is marked deceased?
- Which scheduling capabilities belong in the MVP versus future expansion?

## Findings

### 1. Appointment is the planned event

HL7 FHIR models Appointment as a booking for a healthcare event. It can involve a patient and practitioner and can reference the reason, service type, specialty, location and scheduled time. An Appointment may result in one or more Encounters.

**Implication:** Open Clinical Record should not treat an appointment as the medical record itself. It is a planned piece of care that can lead to an actual visit/encounter.

### 2. Encounter represents actual care

FHIR distinguishes the planned Appointment from the Encounter in which healthcare is actually provided. The Encounter can reference the Appointment and has its own lifecycle.

**Implication:** The core workflow should remain:

Patient → Appointment → Check-in/Arrival → Visit/Encounter → Clinical Documentation

An appointment may exist without a completed encounter, for example when it is cancelled or the patient does not show.

### 3. OpenMRS connects scheduling with check-in and visits

OpenMRS patient-management functionality includes appointments, active visits and service queues. Its appointments configuration supports a check-in action. When a patient already has an active visit, the check-in flow can update the appointment status instead of starting another visit.

**Implication:** Check-in should be a real workflow transition, not simply a boolean field on Patient.

### 4. Oracle supports operational appointment management

Oracle Health provides appointment/visit lists and supports scheduling, editing, rescheduling and cancellation. Visit details can include reason, time/duration, location, resources, comments, preparations and instructions. Oracle also records appointment history and audit entries when appointments are changed or cancelled.

**Implication:** Even a simplified MVP should capture enough context to explain an appointment and preserve important scheduling history.

### 5. Rescheduling is not the same as deleting

Oracle's rescheduling workflow retains the original appointment context and captures a reason before selecting another available date/time. This demonstrates that changing an appointment should preserve history rather than simply overwrite the old values.

**Implication:** For the MVP, rescheduling should create a traceable change/history entry. Avoid destructive deletion of appointment history.

### 6. Cancellation has a reason and audit trail

Oracle captures who requested the cancellation and a reason. It also logs appointment history and an audit entry; notifications may be sent to the patient's preferred contact method.

**Implication:** MVP cancellation should include a cancellation reason and record who/when performed the action. Notifications can be simplified or deferred.

### 7. Status is central to scheduling

Established systems use appointment states to distinguish planned, checked-in, cancelled, no-show and completed/finished situations. The exact names differ between systems.

**Recommended MVP statuses:**

- Scheduled
- Checked-in
- Completed
- Cancelled
- No-show

**Note:** The exact status vocabulary should be validated with the mentor/clinician before being frozen in the SRS.

### 8. Appointment information should be practical, not excessive

The common scheduling information across the researched systems is:

- Patient
- Provider/resource
- Appointment type/reason
- Date
- Start time
- Duration/end time
- Location/department
- Status
- Notes/comments where appropriate
- Cancellation/rescheduling reason when applicable
- Created/updated metadata

**MVP principle:** capture information that affects scheduling and clinical workflow; avoid copying enterprise scheduling complexity without a demonstrated need.

### 9. Walk-ins should be considered

Healthcare workflows may receive patients without a previously scheduled appointment. Oracle documentation includes walk-in appointment workflows, and OpenMRS connects check-in with active visits.

**Implication:** A future-proof design should allow an encounter/visit to originate without a normal scheduled appointment. The internship MVP can support this simply as a "walk-in" path if the clinician confirms it is useful.

### 10. Deceased patients require scheduling safeguards

Oracle's deceased-patient workflow can cancel future appointments after a patient is documented as deceased. This connects the patient lifecycle to scheduling behavior.

**Implication:** Open Clinical Record should prevent inappropriate new appointments for deceased patients and define what happens to existing future appointments. The exact behavior should be confirmed during clinical validation.

### 11. Permissions matter

Scheduling actions are not necessarily available to every user. Oracle exposes actions according to workflow and context, while patient-facing systems can restrict cancellation/rescheduling according to organization policy.

**Implication:** Appointment permissions should be role-based. For example, reception/admin staff may manage scheduling while clinicians may view and manage appointments relevant to their workflow. Exact permissions should be validated before implementation.

## Proposed Open Clinical Record Workflow

```text
Patient
   │
   ├── Schedule Appointment
   │       │
   │       ├── Scheduled
   │       │      ├── Reschedule → new date/time + history
   │       │      ├── Cancel → reason + history
   │       │      └── No-show
   │       │
   │       └── Check-in / Arrival
   │                │
   │                └── Visit / Encounter
   │                         │
   │                         └── Clinical Documentation
   │                                  │
   │                                  └── Completed
   │
   └── Walk-in → Visit / Encounter
```

## Suggested MVP Data Model

```text
Appointment
- id
- patient_id
- provider_id
- appointment_type_id / type
- reason
- location_id (optional if location is in scope)
- start_at
- end_at or duration_minutes
- status
- notes
- cancellation_reason (nullable)
- created_at
- created_by
- updated_at
- updated_by
```

If appointment history is required as a separate entity, use an `AppointmentHistory` or audit mechanism rather than overwriting important changes.

## Classification

### Adopt

- Patient-linked appointments
- Provider/resource
- Appointment type/reason
- Date/time and duration
- Status lifecycle
- Check-in transition
- Cancellation reason
- Rescheduling with history
- Role-based scheduling actions
- Audit-friendly changes
- Connection from appointment to visit/encounter

### Simplify

- Complex resource scheduling
- Multi-resource booking
- Advanced availability rules
- Enterprise referral/scheduling workflows
- Patient self-scheduling
- Calendar synchronization
- Complex recurring appointments

### Innovate

- A simple daily appointment board that clearly separates Scheduled, Checked-in, No-show and Completed patients.
- A patient timeline that connects appointment → encounter → clinical documentation.
- A small "Needs Attention" indicator for issues such as missing appointment information or overdue documentation.

### Future

- Patient portal self-scheduling
- SMS/email reminders
- Online cancellation/rescheduling
- Recurring appointments
- Provider availability management
- Queue management
- Multi-location scheduling
- FHIR Appointment/Slot/Schedule APIs
- External calendar integration

### Reject for MVP

- Trying to reproduce a full enterprise scheduling engine.
- Building a complex optimization engine for provider/resource allocation without a real requirement.
- Treating appointment records as disposable CRUD rows that can be silently deleted.

## Clinical Validation Questions

Before finalizing the SRS, ask the mentor/clinician:

1. What appointment types are actually used in the target clinic?
2. Who creates appointments: receptionist, nurse, clinician, or multiple roles?
3. Who is allowed to reschedule or cancel?
4. Which statuses are used in the real workflow?
5. Is check-in required for every appointment?
6. How are walk-ins handled?
7. What information must be recorded when an appointment is cancelled or rescheduled?
8. What happens to future appointments when a patient is marked deceased?
9. Can one appointment lead to multiple encounters, or is that unnecessary for this setting?
10. Are reminders/notifications required for the internship MVP?

## Sources

- HL7 FHIR Appointment: https://hl7.org/fhir/R4/appointment.html
- HL7 FHIR Encounter: https://hl7.org/fhir/R4/encounter.html
- Oracle Health EHR — Visits: https://docs.oracle.com/en/industries/health/oracle-health-ehr/ehrug/visits-list.html
- Oracle Health Patient Administration — Manage Visits: https://docs.oracle.com/en/industries/health/health-patient-administration/health-patient-admin-userguide/manage-visits.html
- Oracle Health Patient Administration — Cancel Appointment: https://docs.oracle.com/en/industries/health/health-patient-administration/health-patient-admin-userguide/cancel-appointment.html
- Oracle Health Patient Administration — Reschedule Appointment: https://docs.oracle.com/en/industries/health/health-patient-administration/health-patient-admin-userguide/reschedule-appointment.html
- OpenMRS O3 Patient Management configuration: https://o3-docs.openmrs.org/en-US/docs/configure-o3/configure-patient-management/
