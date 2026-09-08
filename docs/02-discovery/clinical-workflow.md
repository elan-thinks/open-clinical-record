# Clinical Workflow Specification

**Project:** Open Clinical Record  
**Status:** Mentor-approved baseline; broader clinical validation pending  
**Purpose:** Define the outpatient workflow that guides requirements and design for the MVP.

## 1. Purpose

This document describes the end-to-end clinical workflow for the Open Clinical Record MVP. It connects patient registration, the patient chart, appointments, arrival/check-in, clinical work, documentation, and the longitudinal medical record.

The workflow has been reviewed and approved as the project baseline by the mentor. Broader clinical validation remains pending and may refine unresolved permissions or policies.

## 2. Actors

The MVP uses exactly three approved application roles:

| Actor | Primary responsibilities in MVP |
|---|---|
| Receptionist / Front Desk | Register/search patients, manage basic demographics, schedule/reschedule/cancel appointments, and perform check-in |
| Nurse / Clinical Staff | Support patient flow, record vital signs and permitted observations, and support encounters within assigned permissions |
| Doctor / Clinician | Review the patient chart, conduct encounters, record clinical findings, diagnosis, treatment, and permitted clinical documentation |

Administrative/user-management capabilities are deployment-level or future concerns and are **not** an MVP application role.

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

The exact prioritization of walk-ins remains a clinical/business policy question.

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

The final permission matrix for specific nursing/support actions remains subject to clinical stakeholder confirmation.

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

The system should clearly display deceased status while preserving the patient's historical record. The exact future-appointment policy remains an open decision.

## 10. Role and Permission Principles

- The MVP contains exactly three application roles.
- Receptionist / Front Desk is the primary registration and appointment-management role.
- Nurse / Clinical Staff supports patient flow, check-in, vitals, observations, and other explicitly approved clinical-support actions.
- Clinician / Doctor performs provider-level assessment and documentation, including diagnosis, treatment, prescription, clinical notes/reports, finalized-document actions, and authorized patient-status changes.
- Receptionist / Front Desk must not perform provider-level diagnosis, treatment, prescribing, or clinical-report authoring.
- No user gains additional clinical authority merely because they can open a patient chart.
- Important actions should be auditable.

## 11. Key Business Rules

1. A patient must exist before an appointment or clinical record can be associated with them.
2. Appointment history must preserve meaningful cancellation and rescheduling information.
3. A walk-in must be supported without requiring a pre-existing appointment.
4. Check-in represents arrival and is distinct from the actual clinical encounter.
5. An encounter represents actual care delivered.
6. Clinical documentation should have a controlled lifecycle from draft to final/signed.
7. Finalized documentation should preserve record integrity when corrections are required.
8. Patient history must remain available across visits.
9. A deceased patient's historical records must be preserved.
10. New activity involving a deceased patient must follow the approved business policy.
11. Permissions must reflect clinical responsibilities.
12. Significant changes should be recorded in an audit trail.

## 12. Clinical Validation Questions

The following items remain for mentor/clinical stakeholder confirmation:

- Which role may enter or update allergies and medications?
- Which specific appointment actions may Nurse / Clinical Staff perform?
- Which specific encounter-support actions may Nurse / Clinical Staff perform?
- What information should be mandatory at patient registration?
- What should happen to future appointments after a patient is recorded deceased?
- Which audit events are mandatory and who may view them?
- What are the required retention/deletion rules?
- What backup and recovery objectives apply to the intended deployment?
- Which clinical document/report types are required for the MVP?
- Is No-show a required appointment lifecycle state for the MVP release?

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
- AI-assisted clinical features

The architecture and requirements should leave room for these capabilities without implementing them during the internship MVP.

## 14. Validation Status

**Current status:** Mentor-approved workflow baseline; preliminary clinical validation received from one clinician survey response; broader clinical validation remains pending.

The initial clinician response supports preserving appointment history, separating clinical responsibilities, protecting finalized documentation through amendments, surfacing important chart alerts, and handling deceased-patient status. It also identified network reliability as a practical concern and suggested AI/mobile capabilities as future possibilities. These findings do not constitute statistically representative evidence and should be revisited as additional responses are collected.
