# 16. Workflow State Model

## 16.1 Appointment State Model

The appointment lifecycle is modeled as a finite set of operational states:

**Scheduled → Waiting → CheckedIn → InProgress → Completed**

Alternative terminal paths include:

**Scheduled/Waiting → Cancelled**

and

**Scheduled/Waiting → NoShow**

The exact permitted transitions are governed by the appointment workflow service rather than by arbitrary status updates from the client.

## 16.2 State Transition Matrix

| Current state | Possible next state(s) | Rationale |
|---|---|---|
| Scheduled | Waiting, CheckedIn, Cancelled, NoShow | Appointment has not entered active consultation |
| Waiting | CheckedIn, Cancelled, NoShow, InProgress | Patient is in operational queue |
| CheckedIn | InProgress, Cancelled where permitted | Arrival has been recorded |
| InProgress | Completed | Clinical workflow is active |
| Completed | None in ordinary workflow | Historical terminal state |
| Cancelled | Scheduled/Waiting through permitted reschedule path | Appointment may be reactivated through rescheduling |
| NoShow | Scheduled/Waiting through permitted reschedule path | Follow-up scheduling may be needed |

The implementation should remain the authoritative source for exact transition enforcement. The table documents the business model used in analysis.

## 16.3 Clinical Visit State Model

The core clinical visit lifecycle is:

**Draft → Final**

with a separate **Cancelled** state where supported.

Draft represents an active documentation state. Final represents the historical record boundary.

## 16.4 Patient Lifecycle State

Patient status is:

**Active / Inactive / Deceased**

These are not workflow states in the same sense as an appointment. They describe the lifecycle of the patient record and impose constraints on subsequent operations.

## 16.5 Why State Modeling Was Necessary

Without explicit state modeling, the application could accept logically impossible operations—for example, rescheduling an appointment that has already been completed or modifying a finalized clinical record as if it were a draft. State modeling converts these conditions into explicit rules that can be implemented and tested.
