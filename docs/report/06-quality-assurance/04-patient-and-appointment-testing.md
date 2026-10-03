# 6.4 Patient and Appointment Testing

## 6.4.1 Patient Management Verification

Patient management testing focused on identity creation, retrieval, updates, lifecycle state, and interaction with downstream workflows.

| Area | Verification question |
|---|---|
| Registration | Can an authorized user create a valid patient? |
| Search/list | Can existing patients be located? |
| Update | Can permitted demographic information be changed? |
| Status | Are lifecycle states represented correctly? |
| Deceased state | Are restricted actions rejected? |
| History | Does changing patient information avoid overwriting visits? |

### [SCREENSHOT INSERT — Figure 6.7: Patient registration test]

**Capture:** Running application showing a successful patient registration using synthetic data, followed by the resulting patient record/list.

**Purpose:** Demonstrates the complete registration result rather than only the form.

**Suggested caption:** *Figure 6.7. Verification of patient registration and resulting patient record.*

## 6.4.2 Appointment Creation

Appointment testing verifies that valid users can create appointments and that business constraints are respected.

A particularly important rule is that deceased patients cannot receive new appointments. This is a domain validation rule rather than a role permission.

## 6.4.3 State Transition Testing

Appointment states include:

**Scheduled, Waiting, CheckedIn, InProgress, Completed, Cancelled, NoShow**

Testing should verify allowed transitions and reject inappropriate transitions.

### [SCREENSHOT INSERT — Figure 6.8: Appointment state transition]

**Capture:** Application evidence showing an appointment before and after a state-changing action, preferably check-in.

**What must be visible:** appointment identifier/patient using synthetic data, previous state, resulting state, and relevant action.

**Purpose:** Demonstrates that appointment workflow is stateful.

**Suggested caption:** *Figure 6.8. Verification of an appointment state transition.*

## 6.4.4 Cancellation Testing

Cancellation requires a non-empty reason.

### [SCREENSHOT INSERT — Figure 6.9: Cancellation validation]

**Capture:** Cancellation dialog with the reason field empty and the resulting validation feedback. If possible, capture the subsequent successful cancellation with a reason separately.

**Purpose:** Demonstrates enforcement of a non-trivial business rule.

**Suggested caption:** *Figure 6.9. Appointment cancellation validation requiring an explicit reason.*

## 6.4.5 Rescheduling Testing

Rescheduling is permitted only for defined states. Tests should therefore include both a permitted reschedule and a state in which rescheduling is blocked.

Meaningful appointment changes are also represented through AppointmentEvent history.

### [SCREENSHOT INSERT — Figure 6.10: Rescheduling and event history]

**Capture:** Appointment after rescheduling, plus the appointment-event/history area if available.

**Purpose:** Demonstrates both the changed scheduling state and historical traceability.

**Suggested caption:** *Figure 6.10. Appointment rescheduling and associated workflow-event evidence.*
