# 5. EMR Domain Analysis

## 5.1 Domain Perspective

An Electronic Medical Record is not simply a digital replacement for a paper patient folder. The meaning of a record depends on who created it, when it was created, which patient and visit it belongs to, and whether it is still a draft or has been finalized.

For OCR, the domain was deliberately reduced to a focused outpatient workflow. The core entities are Patient, Appointment, ClinicalVisit, VitalSigns, Diagnosis and ClinicalNote, with identity, role and audit information supporting the operational system.

## 5.2 Core Domain Concepts

### Patient

A Patient represents the person receiving care. Registration occurs once within the modeled facility context, after which subsequent attendances are represented through appointments and clinical visits.

### Appointment

An Appointment represents planned or recorded attendance for a particular time and purpose. It is operational scheduling information, not itself the clinical record.

### Clinical Visit

A ClinicalVisit represents the clinical attendance associated with a patient's care episode in OCR. It provides the longitudinal container for information recorded during that attendance.

### Clinical Documentation

Clinical documentation is represented through vitals, diagnoses and notes. These records belong to the relevant clinical visit rather than being stored as disconnected patient-level fields.

### Patient Status

Patient lifecycle status is modeled explicitly. A patient can be Active, Inactive or Deceased. Deceased status changes what operations are permitted but does not erase historical information.

## 5.3 Important Domain Distinctions

### Appointment vs. Visit

The distinction between appointment and visit was one of the most important domain findings. An appointment answers an operational question—when is the patient expected or scheduled? A visit answers a clinical question—what happened during the patient's attendance?

Conflating these concepts would make rescheduling, cancellation, check-in and longitudinal clinical history difficult to represent correctly.

### Patient vs. Patient Visit

A patient is persistent. A visit is episodic. Therefore, the system must not overwrite the patient's previous clinical history when a new attendance occurs.

### Draft vs. Final Clinical Record

OCR distinguishes an in-progress clinical visit from a finalized visit. Finalization represents a workflow boundary: after finalization, the record is treated as immutable within the MVP and a new visit is used for subsequent clinical content.

## 5.4 Longitudinal Record Model

The simplified longitudinal model is:

**Patient → Appointments → Clinical Visits → Clinical Documentation**

where:

- one patient may have many appointments;
- one patient may have many clinical visits;
- a clinical visit may contain zero or one VitalSigns record;
- a clinical visit may contain zero or many diagnoses;
- a clinical visit may contain zero or many clinical notes;
- previous visits remain available as historical records.

This model provides a small but coherent representation of continuity of care.

## 5.5 Domain Integrity Rules

Key rules implemented or represented in the project include:

1. A registered patient is not duplicated for every visit.
2. Previous clinical visits are preserved.
3. Check-in can create a draft clinical visit where appropriate.
4. Finalizing a clinical visit completes the linked appointment.
5. Final clinical visits are not edited as ordinary draft records.
6. A deceased patient cannot receive a new appointment.
7. A cancellation requires a reason.
8. Appointment status controls whether rescheduling is permitted.
9. Role authorization is enforced independently of frontend visibility.
10. Audit information records significant actions without storing the complete clinical payload as an audit event.

## 5.6 Engineering Significance

The domain analysis converted an initially broad feature list into a smaller set of related concepts with explicit relationships and state transitions. This was important because many implementation defects in information systems arise not from inability to create forms, but from unclear meaning between records and lifecycle states.
