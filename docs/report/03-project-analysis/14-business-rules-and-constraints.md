# 14. Business Rules and Constraints

## 14.1 Why Business Rules Matter

Business rules define what the system is allowed to do, not merely what screens exist. In OCR, many of the most important requirements are state and relationship constraints.

## 14.2 Patient Rules

**BR-PAT-01:** A patient is registered once and reused across subsequent appointments and visits.

**BR-PAT-02:** Patient status may be Active, Inactive or Deceased.

**BR-PAT-03:** Marking a patient Deceased does not delete the patient's history.

**BR-PAT-04:** A Deceased patient cannot receive a new appointment.

**BR-PAT-05:** The ability to mark a patient Deceased is role-controlled.

## 14.3 Appointment Rules

**BR-APT-01:** Appointment status is controlled by the workflow.

**BR-APT-02:** Cancellation requires a non-empty reason.

**BR-APT-03:** Active queue views exclude Completed, Cancelled and NoShow appointments.

**BR-APT-04:** Rescheduling is permitted only for states defined by the workflow.

**BR-APT-05:** Rescheduling is blocked for CheckedIn, InProgress and Completed appointments.

**BR-APT-06:** Appointment type is descriptive workflow information, not a separate clinical subsystem.

## 14.4 Clinical Visit Rules

**BR-VIS-01:** A clinical visit belongs to a patient.

**BR-VIS-02:** A visit may contain zero or one vital-sign record.

**BR-VIS-03:** A visit may contain multiple diagnoses.

**BR-VIS-04:** A visit may contain multiple clinical notes.

**BR-VIS-05:** A visit begins as Draft where the workflow creates it before finalization.

**BR-VIS-06:** Final visits are treated as immutable within the MVP.

**BR-VIS-07:** New clinical content after finalization is represented through a new visit rather than ordinary editing of the final visit.

## 14.5 Authorization Rules

**BR-AUTH-01:** Authentication establishes the user's identity.

**BR-AUTH-02:** Authorization determines whether the user may perform a protected operation.

**BR-AUTH-03:** Frontend restrictions are not the final security boundary.

**BR-AUTH-04:** Backend/service-layer rules must reject unauthorized or invalid operations even if a client attempts to bypass the UI.

## 14.6 Audit Rules

**BR-AUD-01:** Important system actions should identify the actor and event time.

**BR-AUD-02:** Audit records should provide traceability without unnecessarily copying complete clinical payloads into audit entries.

## 14.7 Project Constraints

The most important constraint was the one-month internship duration. Additional constraints included a deliberately reduced functional scope, available development time, the intern's learning curve, and the requirement to produce a demonstrable system alongside documentation and presentation.

These constraints explain why OCR prioritizes a coherent core workflow rather than breadth.
