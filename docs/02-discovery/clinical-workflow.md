# Clinical Workflow Specification

**Project:** Open Clinical Record  
**Status:** Draft for clinical validation  
**Purpose:** Define the outpatient workflow that will guide requirements and design for the MVP.

## 1. Purpose

This document describes the proposed end-to-end clinical workflow for the Open Clinical Record MVP. It connects patient registration, the patient chart, appointments, arrival/check-in, clinical work, documentation, and the longitudinal medical record.

The workflow is intended to be validated against real clinical practice before functional requirements are finalized.

## 2. Actors

| Actor | Primary responsibilities in MVP |
|---|---|
| Receptionist / Front Desk | Register/search patients, manage basic demographics, schedule/reschedule/cancel appointments, check-in patients |
| Nurse / Clinical Staff | Support patient flow, record vital signs and permitted observations, support encounters |
| Doctor / Clinician | Review chart, conduct encounter, record clinical findings, diagnosis, treatment, and clinical documentation |
| System Administrator | Manage users, roles, permissions, configuration, and audit information |

## 3. Approved End-to-End Workflow

```text
PATIENT
  ↓
Patient Registration (Receptionist)
  ↓
Patient Chart
  ├── Schedule Appointment (Receptionist)
  │       ↓
  │     SCHEDULED
  │       ├── Reschedule → new date/time + history
  │       ├── Cancel → reason + history
  │       └── No-show
  │
  └── Walk-in
          ↓
    CHECK-IN / ARRIVAL
          ↓
    Waiting / Queue
          ↓
    NURSE / CLINICAL STAFF
          ├── Vital Signs
          └── Observations
          ↓
    CLINICIAN / DOCTOR
          ↓
       ENCOUNTER
          ├── History
          ├── Diagnosis
          └── Treatment
          ↓
    Clinical Documentation
          ├── Draft / In Progress
          └── Final / Signed
          ↓
    Patient Medical Record
          ↓
    Patient Timeline
```

## 4. Core Concepts

### Patient Chart

The patient chart is the main clinical workspace for viewing information about a patient. It should provide access to relevant demographics, allergies, alerts, history, appointments, clinical information, documents, and patient status.

### Appointment

An appointment represents **planned care**: a scheduled date/time for a patient to receive a service from a provider or clinic.

### Check-in / Arrival

Check-in records that the patient has arrived for care. A walk-in may enter the workflow without a previously scheduled appointment.

### Encounter

An encounter represents **actual care** delivered to the patient. It is distinct from the appointment that may have led to it.

### Clinical Documentation

Clinical documentation records what happened during care. Documentation may begin as a draft/in-progress document and become final/signed after completion.

### Medical Record

The medical record is the longitudinal collection of the patient's clinical information and documentation over time.

### Patient Timeline

The timeline provides a chronological view of important patient events, helping users understand the patient's history without manually searching through separate areas.

## 5. Appointment Lifecycle

The MVP supports the following appointment outcomes:

```text
Scheduled
   ├── Checked-in / Arrived
   │       ↓
   │   In consultation
   │       ↓
   │   Completed
   │
   ├── Cancelled
   │       ↓
   │   cancellation reason + history
   │
   ├── No-show
   │
   └── Rescheduled
           ↓
       new date/time + history
```

Cancelled, rescheduled, and no-show events should remain understandable in appointment history rather than silently replacing previous information.

## 6. Walk-in Workflow

A patient may arrive without a scheduled appointment. The system should support registration/search, arrival/check-in, waiting or queue handling, and continuation into the clinical workflow according to clinic policy and availability.

The exact prioritization of walk-ins is a clinical/business rule to be validated with stakeholders.

## 7. Clinical Visit Workflow

After arrival, clinical staff may record vital signs and permitted observations. The clinician then reviews the patient's information and conducts the encounter.

The encounter may include:

- Relevant history
- Examination findings
- Diagnosis
- Treatment or care plan
- Medication/prescription information where applicable
- Follow-up instructions
- Clinical notes

The exact responsibilities of nurses and clinicians must be confirmed during clinical validation.

## 8. Clinical Documentation Lifecycle

```text
Draft / In Progress
        ↓
      Review
        ↓
   Final / Signed
```

A finalized clinical document should not be treated like ordinary editable text. Corrections or amendments must preserve the integrity and history of the clinical record and follow the permissions defined for the relevant role.

## 9. Deceased Patient Workflow

```text
Active Patient
      ↓
Marked Deceased
      ├── Record death information
      ├── Preserve existing records
      ├── Prevent inappropriate new appointments
      └── Handle future appointments according to policy
```

The system should clearly display deceased status while preserving the patient's historical record. The exact information recorded at death and the permissions for recording it require clinical validation.

## 10. Role and Permission Principles

- Users should only perform actions appropriate to their assigned role.
- Reception/front-desk users should not have unrestricted access to clinical documentation or diagnosis editing.
- Clinical staff should have access to the clinical information required for their work.
- Clinicians should be able to create and finalize permitted clinical documentation.
- Administrative access should not automatically imply unrestricted clinical authority.
- Important actions should be auditable.

## 11. Key Business Rules to Validate

1. A patient must exist before an appointment or clinical record can be associated with them.
2. Appointment history must preserve meaningful cancellation and rescheduling information.
3. A walk-in must be supported without requiring a pre-existing appointment.
4. Check-in represents arrival and is distinct from the actual clinical encounter.
5. An encounter represents actual care delivered.
6. Clinical documentation should have a controlled lifecycle from draft to final/signed.
7. Finalized documentation should preserve record integrity when corrections are required.
8. Patient history must remain available across visits.
9. A deceased patient's historical records must be preserved.
10. New activity involving a deceased patient must follow appropriate business rules.
11. Permissions must reflect clinical responsibilities.
12. Significant changes should be recorded in an audit trail.

## 12. Clinical Validation Questions

The following questions should be confirmed with healthcare staff before requirements are finalized:

- Are the proposed receptionist, nurse, clinician, and administrator roles accurate?
- Which role performs each patient-registration action?
- Who schedules, reschedules, and cancels appointments?
- How are walk-ins handled in practice?
- Which staff members perform check-in?
- Which observations are normally recorded by nurses/clinical staff?
- Who creates, edits, finalizes, and amends clinical documents?
- Which documents are required for common outpatient visits?
- What information should be immediately visible on the patient chart?
- What information should trigger a prominent alert?
- Who is authorized to record deceased status?
- What should happen to future appointments after a patient is recorded deceased?
- What actions must be included in the audit history?

## 13. Scope Boundary

This workflow is the foundation for the MVP requirements. It does **not** attempt to model every hospital workflow or enterprise scheduling scenario.

The following are intentionally outside the initial workflow scope and may be considered for future expansion:

- Laboratory workflows
- Pharmacy workflows
- Radiology/PACS
- Billing and insurance
- Patient portal/mobile application
- External EMR exchange
- Full FHIR implementation
- Complex enterprise scheduling/resource optimization

The architecture and requirements should leave room for these capabilities without implementing them during the internship MVP.

## 14. Validation Status

**Current status:** Proposed workflow approved by mentor; clinical validation pending.

Survey responses and stakeholder feedback will be used to confirm, modify, or reject assumptions before the functional requirements are finalized.
