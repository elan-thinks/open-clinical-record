# 7.4 EMR Domain Learning

## From generic software to healthcare workflow

The internship introduced a domain in which information has operational and clinical meaning. The same data can have different consequences depending on who records it, when it is recorded, and which workflow state the record occupies.

## Patient lifecycle

The patient record is longitudinal. Registration establishes identity, while later encounters add history rather than replace it. Patient status also has lifecycle meaning. A deceased patient remains part of historical records while restrictions apply to new operational actions.

Thus "deceased" is a controlled status, not a deletion instruction.

## Appointment and visit distinction

An appointment describes scheduling and operational progress. A clinical visit represents the record of an attendance and its clinical documentation. Check-in connects operational workflow to clinical workflow.

This distinction affected both the data model and state transitions.

## Clinical documentation lifecycle

OCR simplifies clinical lifecycle to Draft, Final, and Cancelled visit states. A finalized visit is treated as immutable within the MVP; additional clinical information requires a new visit rather than silently rewriting the previous finalized record.

This is a deliberate project simplification, not a claim that it represents every production EMR amendment model.

## Role boundaries

The domain also demonstrated why roles need explicit boundaries:
- Receptionist/front desk: registration, scheduling, and check-in.
- Nurse/clinical staff: clinical-support information such as vitals.
- Doctor/clinician: clinical documentation and finalization.
- Admin: user and operational administration.

These boundaries were translated into authorization tests.

## Historical integrity

"Correct current data" is not sufficient when historical records matter. The system must preserve what happened previously and distinguish it from what is happening now.

## Evidence

**Figure 7.6 — EMR workflow learned during the internship**

Capture the final project workflow:
Patient Registration → Appointment → Check-in/Queue → Draft Clinical Visit → Clinical Documentation → Finalized Visit → Completed Appointment

**Figure 7.7 — Longitudinal patient chart**

Use a synthetic patient with at least two separate visits. Show the same patient identity, two distinct dates, different observations, chronological preservation, and no real patient information.

## Reflection

Healthcare software cannot be designed responsibly by thinking only about forms and database tables. Workflow, chronology, role, and record lifecycle must be modeled together.