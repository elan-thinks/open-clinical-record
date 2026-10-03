# 5.9 Dashboard, Audit, and Supporting Features

## 5.9.1 Dashboard Implementation

The dashboard provides aggregate operational information rather than replacing the underlying patient, appointment, and chart modules. It is intended to help users understand the current state of the system and active workflow.

Dashboard information should therefore be interpreted as a view derived from application data, not as an independent source of truth.

### [SCREENSHOT INSERT — Figure 5.22: OCR dashboard]

**Capture:** Main dashboard in the running application with the principal cards, counters, queue/appointment summary, or other implemented aggregate information visible.

**What must be visible:** dashboard title, aggregate values, relevant workflow summary, and navigation.

**Purpose:** Demonstrates how implemented data is presented at an operational level.

**Suggested caption:** *Figure 5.22. OCR operational dashboard presenting aggregate application information.*

## 5.9.2 Audit Events

Audit functionality records important system actions with information such as actor, event, time, and entity. The purpose is accountability and traceability, not duplication of the entire clinical record.

The audit design therefore avoids treating the audit log as a second clinical database.

### [SCREENSHOT INSERT — Figure 5.23: Audit log]

**Capture:** Admin/audit screen showing several synthetic audit events.

**What must be visible:** actor/user, event/action, timestamp, and affected entity or entity type if displayed.

**Purpose:** Demonstrates accountability support without exposing clinical payloads.

**Suggested caption:** *Figure 5.23. OCR audit events supporting operational accountability.*

## 5.9.3 Appointment Events

AppointmentEvent history records meaningful workflow changes to an appointment. This is useful for understanding how an appointment reached its current state.

For example, a scheduling record can be associated with transitions such as check-in, cancellation, rescheduling, or completion.

## 5.9.4 User Management

User management supports the operational role model. Administrators can manage application users and assign appropriate roles.

The implementation deliberately separates operational account management from clinical authorship. Having administrative privileges does not automatically mean that the user should act as a clinician in the clinical workflow.

### [SCREENSHOT INSERT — Figure 5.24: User management]

**Capture:** Admin user-management page showing demo users and their assigned roles.

**What must be visible:** user list, role values, and available management controls.

**Do not show:** real credentials, passwords, tokens, or personal contact details.

**Purpose:** Demonstrates the implemented administrative support capability.

**Suggested caption:** *Figure 5.24. Administrative user and role management interface.*

## 5.9.5 Supporting Features as System Glue

Authentication, dashboard, audit, validation, and user management may appear secondary compared with patient and chart screens, but they provide the controls that make the primary modules usable as a coherent system.

Without authentication, role boundaries cannot be established. Without auditability, important actions become harder to trace. Without validation, workflow states can become inconsistent. Without a dashboard/queue view, operational users have less visibility into current work.

## 5.9.6 Implementation Boundary

The dashboard and supporting features remain intentionally lightweight. The project does not claim advanced business intelligence, enterprise analytics, formal clinical decision support, or comprehensive hospital administration.

This is consistent with the internship scope and prevents the report from inflating the implemented feature set.
