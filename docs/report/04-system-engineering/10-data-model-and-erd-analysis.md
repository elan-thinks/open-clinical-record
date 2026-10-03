# 4.10 Data Model and ERD Analysis

## 4.10.1 Purpose

The Entity Relationship Diagram translates the conceptual EMR model into persistent structures. Its main purpose is not to reproduce database tables visually, but to make the relationships between patient identity, scheduling, clinical attendance, documentation, and audit history explicit.

The central modeling decision is longitudinality: a patient is persistent, while appointments and clinical visits represent events that occur over time.

## 4.10.2 Core entities

| Entity | Purpose |
|---|---|
| Patient | Persistent identity, demographics, and lifecycle state |
| Appointment | Scheduled/operational patient appointment |
| AppointmentEvent | Meaningful appointment change history |
| ClinicalVisit | Clinical attendance and longitudinal record |
| VitalSigns | Observations associated with a visit |
| Diagnosis | Diagnosis documented for a visit |
| ClinicalNote | Clinical notes associated with a visit |
| PatientDeathRecord | Information/provenance associated with deceased status |
| AuditEvent | Important system activity |

## 4.10.3 Conceptual relationship model

```text
                         ┌─────────────────┐
                         │     Patient     │
                         └───────┬─────────┘
                         1       │       many
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
          ┌──────────────────┐       ┌──────────────────┐
          │    Appointment   │       │  ClinicalVisit   │
          └────────┬─────────┘       └────────┬─────────┘
                   │                          │
                   ▼                          ├── VitalSigns
          AppointmentEvent                    ├── Diagnosis
                                              └── ClinicalNote

Patient ─── 0..1 ─── PatientDeathRecord
System activity ─── many ─── AuditEvent
```

This is a conceptual report diagram. The repository's actual database migrations remain the authoritative implementation source.

## 4.10.4 Patient and appointment separation

A Patient represents an enduring identity. An Appointment represents a particular scheduling event involving that patient.

A patient may therefore have many appointments over time without the patient record itself being duplicated.

This distinction prevents a common modeling problem in small CRUD applications where demographic information is copied into every appointment and subsequently becomes inconsistent.

## 4.10.5 Appointment and clinical visit separation

An appointment and a clinical visit are related concepts but have different meanings.

An appointment expresses an intended or operational interaction with the facility. A clinical visit represents the clinical record associated with an attendance.

This separation permits situations such as:

- a scheduled appointment being cancelled;
- a patient checking in and receiving a draft visit;
- a visit progressing independently through clinical documentation;
- an attendance being represented without relying on a scheduling record in every case.

The distinction was established during domain analysis and then reflected in the persistent model.

## 4.10.6 Longitudinal clinical model

The model preserves clinical history through multiple ClinicalVisit records:

```text
Patient
  ├── ClinicalVisit 001
  ├── ClinicalVisit 002
  ├── ClinicalVisit 003
  └── ...
```

Each visit has its own clinical context.

This is preferable to placing all clinical information directly on Patient because a later visit should not overwrite the documentation belonging to an earlier attendance.

## 4.10.7 Visit composition

The implemented model allows a ClinicalVisit to contain:

- zero or one VitalSigns record;
- zero or more Diagnoses;
- zero or more ClinicalNotes.

This accommodates the workflow in which a visit begins as Draft and accumulates documentation before being finalized.

The model therefore supports the operational sequence rather than requiring every clinical field to exist at the moment a visit is created.

## 4.10.8 Lifecycle state in the data model

State is part of the domain model.

Patient status includes Active, Inactive, and Deceased.

Appointment status includes Scheduled, Waiting, CheckedIn, InProgress, Completed, Cancelled, and NoShow.

ClinicalVisit status includes Draft, Final, and Cancelled.

These state values are not decorative labels. They determine which operations are allowed and therefore influence service-layer validation and API behavior.

## 4.10.9 Deceased status and historical preservation

A deceased patient is not deleted. The lifecycle state changes while previous appointments and clinical visits remain.

The model also contains PatientDeathRecord information for provenance/details associated with the deceased state.

This provides a clearer historical representation than treating deletion as the meaning of death.

## 4.10.10 Audit and event history

AppointmentEvent and AuditEvent have different purposes.

AppointmentEvent describes meaningful changes to an appointment's workflow.

AuditEvent records important system activity such as actor, event, time, and affected entity.

Separating these concepts avoids turning the audit log into a duplicate copy of operational or clinical data.

## 4.10.11 Constraints reflected by the model

The model supports business rules including:

- every appointment belongs to a patient;
- every clinical visit belongs to a patient;
- clinical observations belong to visits;
- a deceased patient cannot receive a new appointment;
- finalized visits are not normally edited through the ordinary workflow;
- appointment transitions are restricted by current state;
- cancellation requires a reason.

Some constraints can be expressed directly through relational constraints. Others depend on role and current workflow state and therefore belong in application services.

## 4.10.12 Data-model trade-offs

The model intentionally does not represent the full breadth of an enterprise EHR. It excludes laboratory, pharmacy, radiology, multi-facility, FHIR exchange, and advanced amendment/versioning models.

This is not an accidental omission. The mentor's scope decision explicitly prioritized Patient Management, Patient Chart, and Appointment Management within the one-month internship.

## 4.10.13 Engineering lesson

The ERD became substantially clearer after the project stopped treating the EMR as a collection of patient CRUD forms. Modeling Patient, Appointment, and ClinicalVisit as different concepts forced the implementation to preserve chronology and workflow state.

The data model therefore demonstrates how domain analysis directly influenced implementation rather than being documentation created after the code was finished.
