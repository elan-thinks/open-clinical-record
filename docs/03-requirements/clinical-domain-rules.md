# Clinical Domain Rules & System Behavior

**Status:** Working technical reference for requirements, architecture, data modeling, UX, and testing

**Scope:** Open Clinical Record MVP — Patient Chart, Appointments, Visits/Encounters, Clinical Documentation

**MVP roles:** Clinician/Doctor, Nurse/Clinical Staff, Receptionist/Front Desk

> This document captures clinical concepts and behavioral rules that are easy to miss when translating an EMR workflow into database tables or CRUD screens. It is a living technical reference and should be updated when clinical review resolves an open question.

## 1. Core principle

The system must distinguish **registration, appointments, attendance, visits/encounters, and clinical documentation**. These are related but are not interchangeable.

```text
Patient
  ├── Registration
  ├── Appointments
  │     ├── Scheduled
  │     ├── Rescheduled
  │     ├── Cancelled
  │     ├── No-show
  │     └── Checked-in / Arrived
  └── Clinical Encounters
        ├── First clinical visit
        ├── Returning visit
        ├── Follow-up
        └── New complaint / continuing problem
```

## 2. Patient identity and history

### 2.1 Registration is not a clinical visit

A patient can be registered without having received clinical care. Therefore:

- `registered` must not automatically mean `has_visited`.
- A patient's first **clinical encounter** should be determined from encounter history, not merely from registration date.
- Cancelled and no-show appointments must not count as completed clinical visits.

### 2.2 First-time vs returning patient

The system should be able to determine whether the patient is:

- **New patient:** no previous completed clinical encounter exists in the relevant facility/system context.
- **Returning patient:** one or more previous completed clinical encounters exist.

This should preferably be **derived from encounter history**, rather than stored as a manually maintained `is_first_visit` flag.

If the business later needs a different definition (for example, first visit to a particular department), that definition must be explicitly documented before implementation.

### 2.3 Follow-up

A follow-up is not simply another appointment. It should be possible to associate the current encounter/appointment with a previous encounter, problem, or care plan when the clinical workflow requires it.

**Open clinical decision:** exact follow-up linkage rules require clinical validation.

## 3. Appointment behavior

Appointment lifecycle:

```text
Scheduled
 ├── Checked-in / Arrived
 │      └── In consultation → Completed
 ├── Cancelled → reason + history
 ├── No-show
 └── Rescheduled → new date/time + history
```

Rules:

1. An appointment represents **planned care**, not completed care.
2. Rescheduling must preserve the history of the previous scheduled date/time.
3. Cancellation should preserve the cancellation reason and history.
4. A no-show must remain distinguishable from cancellation.
5. Check-in/arrival indicates attendance and should not by itself imply that the clinical encounter was completed.
6. Walk-in care may create an attendance/encounter flow without a prior scheduled appointment.

## 4. Walk-in behavior

A walk-in patient does not necessarily have a scheduled appointment.

```text
Walk-in
  → Check-in / Arrival
  → Waiting / Queue
  → Nurse / Clinical Staff
  → Clinician / Doctor
  → Encounter
```

Urgency/triage behavior may affect queue handling. Exact triage rules are outside the current MVP unless clinically approved.

## 5. Encounter behavior

An **encounter/visit** represents actual clinical care and is distinct from an appointment.

A completed encounter may contain:

- Chief complaint/reason for visit
- History
- Vital signs
- Observations/examination findings
- Allergies and relevant alerts
- Current medications
- Assessment/diagnosis
- Treatment/care plan
- Prescription, when applicable
- Follow-up plan
- Clinical notes
- Related clinical documents/reports

The system should preserve the relationship between the encounter and the patient so the chart can present longitudinal history.

## 6. Clinical role behavior

### Receptionist / Front Desk

Primary workflow responsibilities:

- Register patient
- Search patient
- Schedule appointment
- Reschedule appointment
- Cancel appointment
- Check in scheduled patients
- Handle walk-in intake according to approved workflow

### Nurse / Clinical Staff

Clinical workflow responsibilities currently modeled around:

- Vital signs
- Observations
- Initial clinical information as approved
- Supporting patient flow from arrival toward clinician consultation

Any additional nurse permissions remain subject to clinical approval where unresolved.

### Clinician / Doctor

Clinical responsibilities include:

- Review patient chart/history
- Conduct clinical encounter
- Record assessment/diagnosis
- Record treatment/care plan
- Create clinical notes
- Produce applicable medical reports/documents
- Finalize/sign clinical documentation
- Record or update clinically authorized patient-status information

## 7. Patient chart behavior

The patient chart is the primary longitudinal clinical workspace.

A chart should allow authorized users to understand, at minimum:

- Patient identity/demographics
- Patient status
- Allergies and important alerts
- Current problems/conditions
- Current/relevant medications
- Medical history
- Previous encounters/visits
- Relevant clinical documents/reports
- Appointment context
- Patient timeline

The chart should make historical information distinguishable from information recorded during the current encounter.

## 8. Clinical documentation lifecycle

Clinical documents should support a lifecycle such as:

```text
Draft / In Progress
        ↓
   Finalized / Signed
        ↓
 Amendment / Correction (if required)
```

Rules:

- Draft documentation may be edited according to permissions.
- Finalized documentation must not be silently overwritten.
- A correction should preserve the original finalized content and record the amendment/correction.
- The system should retain who finalized or amended the document and when.

## 9. Patient status and deceased lifecycle

A patient may be marked deceased.

```text
Patient
  → Marked Deceased
      ├── Record death information
      ├── Preserve existing records
      ├── Prevent inappropriate new appointments
      └── Handle future appointments according to approved policy
```

Rules:

- Deceased status must not delete the patient's historical clinical record.
- Death information should include the appropriate date and provenance fields when clinically approved.
- Future appointments require explicit policy handling rather than being silently treated as normal active appointments.
- The system should record who entered the status and when.

## 10. History and provenance

Important clinical events should be traceable over time. At minimum, the design should account for:

- Event type/status
- Relevant date/time
- Responsible user/role where applicable
- Reason where applicable (for example cancellation or amendment)
- Relationship to patient and relevant appointment/encounter/document

This supports auditability and prevents the system from presenting a misleading simplified history.

## 11. Alerts and safety-relevant context

The patient chart may need prominent alerts for clinically important information, including:

- Allergies
- Critical medical conditions
- Important medications
- Adverse reactions
- Follow-up needs
- Infection/precaution information
- Deceased status

The exact alert severity, display, acknowledgement, and override behavior require clinical validation before implementation.

## 12. Important derived concepts

The following values should generally be derived from authoritative records rather than duplicated as manually maintained fields:

| Concept | Preferred source |
|---|---|
| First clinical visit | Completed encounter history |
| Returning patient | Existence of previous completed encounter |
| Visit count | Encounter history |
| Last visit | Most recent relevant completed encounter |
| Appointment attendance | Appointment/check-in lifecycle |
| No-show | Appointment status |
| Reschedule history | Appointment history/events |
| Cancellation history | Appointment history/events |
| Current clinical timeline | Chronological clinical events |

Derived values may be cached later for performance, but the underlying clinical records remain authoritative.

## 13. Things we must not accidentally model as the same thing

- Patient registration ≠ clinical visit
- Appointment ≠ encounter
- Check-in ≠ completed consultation
- Appointment cancellation ≠ no-show
- Rescheduled appointment ≠ deleted appointment
- Draft document ≠ finalized document
- Correction ≠ silent overwrite
- Patient status = deceased ≠ deleted patient
- Previous history ≠ current encounter findings

## 14. Architecture/data-model implications

Before implementation, the architecture and ERD should explicitly evaluate entities/relationships for:

- Patient
- Appointment
- Appointment history/status events
- Encounter/Visit
- Vital signs/observations
- Diagnosis/assessment
- Treatment/care plan
- Clinical document/report
- Document amendment/correction
- Allergy/alert
- Medication/problem history as required by approved scope
- Patient status/death information
- Audit/provenance

The final entity set must be based on approved requirements and clinical review, not this document alone.

## 15. Open questions requiring clinical/product decision

1. Does “first visit” mean first visit to the facility, first visit to a department, or first visit for a particular service?
2. What exactly qualifies an encounter as completed?
3. How should follow-up encounters link to previous encounters/problems/care plans?
4. Which nurse-entered clinical information is required in the MVP?
5. What triage/urgency behavior is required for walk-ins?
6. Which patient alerts are mandatory, and who may create/modify them?
7. What is the exact policy for future appointments after a patient is marked deceased?
8. Which finalized documents require amendment workflows, and who may amend them?
9. Which clinical events require immutable audit history?

## 16. Relationship to the SRS

This document is a **technical supporting reference**, not a replacement for the SRS.

- The SRS defines approved requirements and scope.
- This document captures detailed domain behavior and modeling considerations.
- The architecture translates approved behavior into system boundaries/components.
- The data model translates approved concepts into entities and relationships.
- Tests should verify the finalized behavioral rules.

When this document conflicts with the approved SRS or mentor/clinical decision, the approved requirement/decision takes precedence and this document must be updated.
