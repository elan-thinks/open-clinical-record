# 6. Healthcare Workflow Analysis

## 6.1 Workflow as the Primary Design Unit

The project research showed that the most useful unit of analysis was not an isolated screen but the end-to-end patient workflow. OCR therefore models a simplified outpatient journey from registration through clinical record finalization.

## 6.2 Core Workflow

**Patient Registration → Appointment → Check-in / Queue → Draft Clinical Visit → Clinical Documentation → Finalized Visit → Completed Appointment**

This sequence is the conceptual backbone of the MVP.

### Stage 1 — Patient Registration

The front desk creates the patient record and receives an MRN. Registration establishes the persistent identity used by later appointments and visits.

### Stage 2 — Appointment

An appointment is created for a registered patient. OCR supports defined appointment types and operational states such as Scheduled, Waiting, CheckedIn, InProgress, Completed, Cancelled and NoShow.

### Stage 3 — Check-in and Queue

When the patient arrives, the appointment can be checked in. The workflow then represents the patient as part of the active operational queue. Check-in may establish the associated draft clinical visit.

### Stage 4 — Clinical Documentation

Clinical staff can record supporting information such as vital signs and notes according to their role. The doctor can review the chart and document clinical diagnoses and notes.

### Stage 5 — Finalization

The clinical visit moves from Draft to Final. Finalization represents a controlled transition from an active working record to a historical clinical record.

### Stage 6 — Appointment Completion

Finalization of the linked visit completes the corresponding appointment where the workflow permits it. The appointment and clinical record therefore remain connected without being treated as the same entity.

## 6.3 State-Based Reasoning

The workflow is state-driven rather than simply action-driven.

For appointments:

**Scheduled → Waiting → CheckedIn → InProgress → Completed**

with alternative paths involving **Cancelled** or **NoShow**, and with rescheduling restricted by current state.

For clinical visits:

**Draft → Final**

with **Cancelled** available as a separate terminal state where supported.

This approach makes invalid transitions explicit instead of leaving every operation to a generic update form.

## 6.4 Operational Queue

The dashboard/queue view is derived from appointment state. Completed, Cancelled and NoShow appointments are excluded from the active queue. This means the queue is a workflow projection rather than an independent source of truth.

## 6.5 Exceptional and Boundary Conditions

The workflow analysis also identified cases that require explicit handling:

- a patient may be deceased;
- a cancelled appointment must carry a reason;
- an appointment already in a clinical state should not be freely rescheduled;
- historical clinical visits should remain available;
- a final record should not be casually overwritten;
- frontend restrictions cannot substitute for backend authorization.

## 6.6 Why Workflow Analysis Mattered

Without workflow analysis, it would have been easy to implement Patient, Appointment and Medical Record pages independently. That would satisfy a superficial feature checklist but would not establish a coherent EMR process. Workflow analysis instead provided the relationships needed for architecture, database constraints, service methods, authorization and testing.
