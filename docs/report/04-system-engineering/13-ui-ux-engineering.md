# 4.13 UI/UX Engineering

## 4.13.1 UI as workflow support

The OCR interface was designed around the operational workflow rather than around database entities alone. A healthcare application is used to perform tasks in sequence: register a patient, schedule or locate an appointment, check in the patient, document the visit, and complete the workflow.

A visually polished interface that does not support that sequence would still be a poor workflow tool. UI engineering therefore focused on clarity, state visibility, role awareness, and reducing unnecessary navigation.

## 4.13.2 Main UX goals

The interface was intended to provide clear navigation, visible patient identity, understandable appointment states, clear separation between current and historical visits, role-appropriate actions, immediate validation feedback, useful dashboard summaries, and predictable form and table behavior.

These goals follow the functional and non-functional requirements documented earlier.

## 4.13.3 Dashboard

The dashboard acts as a high-level operational view rather than a complete analytics platform. Its purpose is to help staff understand the current state of the application quickly and move toward patients, appointments, queues, or administrative tasks.

## 4.13.4 Patient-management UX

Patient management must balance speed with correctness. A typical workflow is:

Search existing patient → found: open chart; not found: register → confirm identity → continue workflow.

Registration is therefore not the only path to a patient. Search and existing-patient workflows are essential because patients return for multiple appointments and visits.

## 4.13.5 Appointment and queue UX

Appointments are presented as operational states rather than static records. Users need to distinguish Scheduled, Waiting, CheckedIn, InProgress, Completed, Cancelled, and NoShow.

This makes the queue meaningful. A queue is not simply a list of appointments; it represents where patients are in the operational process.

## 4.13.6 Patient chart UX

The chart should make chronology understandable. The current or relevant visit must remain distinguishable from previous visits so users do not confuse historical documentation with active clinical work.

The chart therefore acts as a longitudinal clinical workspace rather than a demographic profile.

## 4.13.7 Role-aware UX

Different roles have different operational emphases:

| Role | Primary UX emphasis |
|---|---|
| Receptionist | Registration, appointments, check-in |
| Nurse | Patient support, vitals, visit documentation |
| Doctor | Chart review, clinical documentation, finalization |
| Admin | Users, audit, operational administration |

Role awareness should guide what users see without pretending that visual hiding is a security mechanism.

## 4.13.8 Forms and validation

Frontend validation gives users immediate feedback and reduces avoidable failed requests. Server-side validation remains authoritative because requests can originate outside the browser.

This produces a two-level approach: frontend validation for usability and backend validation for correctness and security.

## 4.13.9 State-changing actions

Workflow operations should make their consequences understandable. Examples include requiring a cancellation reason, clearly indicating finalization, and communicating unsuccessful operations without exposing internal database details.

## 4.13.10 Accessibility boundary

The internship focused on functional usability rather than completing a formal accessibility certification or comprehensive usability study.

A production iteration should perform structured accessibility testing covering keyboard navigation, semantic labeling, contrast, responsive behavior, and assistive-technology checks.

## 4.13.11 Evidence

The final report should include screenshots of login, dashboard, patient management, patient chart, appointment queue, clinical documentation, user management, and audit views where available. Each screenshot should be labeled as evidence of a specific implemented workflow or requirement.

## 4.13.12 Engineering lesson

Visual design became easier once the workflow was understood first. The interface is the tool through which the workflow is performed, not the workflow itself. For OCR, making system state visible and understandable was more important than simply making individual screens attractive.
