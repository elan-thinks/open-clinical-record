# 5.7 Appointment, Check-In, and Queue Implementation

## 5.7.1 Purpose

Appointment Management connects patient identity to the operational flow of receiving care. The implementation deliberately distinguishes an appointment from a clinical visit. An appointment represents planned or operational scheduling information; a ClinicalVisit represents the clinical record associated with an actual attendance.

This distinction prevents scheduling data from being confused with clinical documentation.

## 5.7.2 Appointment Creation

Authorized users can create appointments for patients who are eligible for scheduling. The appointment includes scheduling information and an appointment type label.

Appointment types include Consultation, Follow-up, New complaint, Procedure, Walk-in, and Other. These labels support workflow classification without pretending to be a full enterprise scheduling taxonomy.

### [SCREENSHOT INSERT — Figure 5.14: Appointment creation]

**Capture:** Running appointment form with a synthetic patient selected.

**What must be visible:** patient selection, date/time fields, appointment type, relevant status information, and save/create action.

**Purpose:** Demonstrates the implemented scheduling workflow.

**Suggested caption:** *Figure 5.14. OCR appointment creation interface.*

## 5.7.3 Appointment State Machine

Appointment status is modeled explicitly:

**Scheduled → Waiting → CheckedIn → InProgress → Completed**

Other states include Cancelled and NoShow. Valid transitions are controlled rather than allowing arbitrary status changes.

This state-based approach makes the queue behavior understandable and prevents the UI from treating every appointment as equivalent.

### [SCREENSHOT INSERT — Figure 5.15: Appointment/queue dashboard]

**Capture:** OCR appointment or queue page showing multiple appointments with visible status values.

**What must be visible:** patient identifiers using synthetic data, appointment times, appointment types, and statuses such as Scheduled, Waiting, CheckedIn, InProgress, or Completed.

**Purpose:** Demonstrates operational queue state in the running application.

**Suggested caption:** *Figure 5.15. Appointment queue displaying workflow state.*

## 5.7.4 Check-In

Check-in marks the patient's arrival and moves the appointment into the operational care workflow. Where appropriate, check-in also creates the draft ClinicalVisit associated with the attendance.

This is a significant implementation point because it establishes the bridge between scheduling and clinical documentation.

### [SCREENSHOT INSERT — Figure 5.16: Check-in action and resulting state]

**Capture:** Before-and-after evidence if possible. First show an appointment in a schedulable state; then show the same appointment after check-in with its new queue/clinical state.

**Purpose:** Demonstrates a workflow transition rather than merely a static screen.

**Suggested caption:** *Figure 5.16. Appointment check-in transitioning a scheduled patient into the clinical workflow.*

## 5.7.5 Cancellation and Rescheduling

Cancellation requires a non-empty reason so that a state change is not silently recorded without context.

Rescheduling is constrained by appointment state. It is permitted for appropriate pre-visit states such as Scheduled, Waiting, Cancelled, or NoShow, while states such as CheckedIn, InProgress, and Completed are protected from inappropriate rescheduling.

### [SCREENSHOT INSERT — Figure 5.17: Cancellation reason]

**Capture:** Cancellation dialog/form showing the required reason field and confirmation action.

**Purpose:** Demonstrates a business rule that would not be visible in a simple appointment list.

**Suggested caption:** *Figure 5.17. Appointment cancellation requiring an explicit reason.*

## 5.7.6 Appointment History

Meaningful appointment changes are represented through AppointmentEvent history. This separates workflow-event history from the broader audit log.

The distinction is useful: AppointmentEvent answers what happened to an appointment, while AuditEvent provides broader system accountability information such as actor, event, time, and entity.

## 5.7.7 Queue Behavior

The active queue excludes appointments that are Completed, Cancelled, or NoShow. This allows the operational interface to focus on patients who still require workflow attention.

The queue is therefore not merely a filtered database table; it is a projection of appointment state according to business rules.
