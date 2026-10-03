# 12. Functional Requirements

## 12.1 Requirements Engineering Approach

The functional requirements for OCR were derived from the approved internship scope, domain research, workflow analysis, role analysis, and the implemented MVP. Requirements are expressed as observable system behavior so that each requirement can be connected to implementation evidence and verification.

The final requirements are organized around the three core business modules: Patient Management, Patient Chart, and Appointment Management. Authentication, authorization, auditability, dashboard information and testing are treated as supporting requirements.

## 12.2 Patient Management Requirements

| ID | Requirement | Verification |
|---|---|---|
| FR-PAT-01 | The system shall allow an authorized user to register a patient. | Functional test |
| FR-PAT-02 | The system shall assign or record an MRN for a registered patient. | Functional test |
| FR-PAT-03 | The system shall allow authorized users to search for patients. | Functional/manual test |
| FR-PAT-04 | The system shall display patient demographic information to authorized users. | Functional/manual test |
| FR-PAT-05 | The system shall allow permitted patient information to be updated. | Functional test |
| FR-PAT-06 | The system shall maintain patient lifecycle status. | Functional test |
| FR-PAT-07 | The system shall preserve historical clinical information when patient information changes. | Data/workflow verification |
| FR-PAT-08 | The system shall prevent new appointments for patients whose status is Deceased. | Negative test |

## 12.3 Patient Chart Requirements

| ID | Requirement | Verification |
|---|---|---|
| FR-CHT-01 | The system shall provide an authorized user with access to a patient's longitudinal chart. | Functional test |
| FR-CHT-02 | The system shall associate clinical visits with the correct patient. | Data verification |
| FR-CHT-03 | The system shall allow permitted users to record vital signs. | Role test |
| FR-CHT-04 | The system shall allow the clinician role to record diagnoses. | Role test |
| FR-CHT-05 | The system shall allow permitted users to record clinical notes. | Role test |
| FR-CHT-06 | The system shall distinguish Draft and Final clinical visit states. | Workflow test |
| FR-CHT-07 | The system shall preserve finalized visits as historical records. | Data/workflow test |
| FR-CHT-08 | The system shall prevent ordinary modification of finalized clinical content. | Negative test |

## 12.4 Appointment Requirements

| ID | Requirement | Verification |
|---|---|---|
| FR-APT-01 | The system shall allow authorized users to create appointments for eligible patients. | Functional test |
| FR-APT-02 | The system shall record appointment type and scheduling information. | Functional test |
| FR-APT-03 | The system shall support appointment status transitions required by the outpatient workflow. | State-transition test |
| FR-APT-04 | The system shall support patient check-in. | Workflow test |
| FR-APT-05 | The system shall expose active queue information based on appointment state. | Dashboard/manual test |
| FR-APT-06 | The system shall require a reason when an appointment is cancelled. | Validation test |
| FR-APT-07 | The system shall restrict rescheduling according to appointment state. | Negative/state test |
| FR-APT-08 | The system shall support recording NoShow where applicable. | Functional test |
| FR-APT-09 | The system shall connect completed clinical workflow to appointment completion. | End-to-end test |

## 12.5 Security and Supporting Requirements

| ID | Requirement | Verification |
|---|---|---|
| FR-SEC-01 | The system shall authenticate users before protected operations. | Authentication test |
| FR-SEC-02 | The system shall associate authenticated users with roles. | Authentication/authorization test |
| FR-SEC-03 | The backend shall independently enforce authorization. | Negative API test |
| FR-SEC-04 | The system shall restrict operations according to role and business rules. | Role matrix tests |
| FR-AUD-01 | The system shall record significant auditable actions with actor and time information. | Audit verification |
| FR-USR-01 | An authorized administrator shall be able to manage application users. | Functional/role test |
| FR-DAS-01 | The system shall present basic operational information through the dashboard. | Manual verification |

## 12.6 Requirement Quality

These requirements are intentionally written so that “implemented” can be distinguished from “planned.” A requirement is considered satisfied only when implementation evidence and verification evidence can be identified. Features appearing only in the original internship plan are not automatically treated as completed requirements.
