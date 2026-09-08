# Non-Functional Requirements

**Project:** Open Clinical Record  
**Scope:** MVP — Patient Management, Patient Chart, Appointment Management  
**Status:** Revised engineering baseline

## 1. Purpose

This document defines the practical quality requirements for the internship MVP. It supports the three approved business areas without committing the project to enterprise EMR capabilities.

## 2. Approved Application Roles

The MVP has exactly three application roles:

- **Receptionist / Front Desk** — patient registration/search, permitted demographic updates, appointment management, check-in, and basic walk-in intake.
- **Nurse / Clinical Staff** — patient/chart access, permitted chart updates, patient flow, check-in support, and observations such as vitals where included in the final MVP.
- **Clinician / Doctor** — patient/chart review and authorized clinical/chart updates included in the MVP.

There is **no Administrator role in the MVP**. Authentication, authorization, validation, audit, and error handling are cross-cutting concerns.

## 3. Security and Privacy

**NFR-SEC-001 — Authentication**  
Protected patient, chart, appointment, and visit information shall require authenticated access.

**NFR-SEC-002 — Authorization enforcement**  
Authorization shall be enforced at the backend/application-service boundary, not only through UI visibility.

**NFR-SEC-003 — Least privilege**  
Permissions shall follow least-privilege principles across the three approved roles.

**NFR-SEC-004 — Session protection**  
Authenticated sessions shall use an approved timeout and protection against trivial unauthorized reuse.

**NFR-SEC-005 — Password protection**  
Passwords shall never be stored as plaintext and shall use an appropriate password-hashing mechanism.

**NFR-SEC-006 — Sensitive-data exposure**  
Patient and clinical information shall not be unnecessarily exposed through logs, URLs, or error messages.

**NFR-SEC-007 — Sensitive-action auditability**  
Important patient, chart, appointment, status, and security actions shall be attributable to an actor and timestamp where audit is required.

**NFR-SEC-008 — Role separation**  
Receptionist / Front Desk users shall not receive permissions intended only for authorized clinical roles.

**NFR-PRI-001 — Minimum necessary access**  
Patient information shall be exposed only to authenticated users with permission for the requested operation.

**NFR-PRI-002 — Safe development data**  
Examples, tests, screenshots, demonstrations, and documentation shall use synthetic or de-identified patient information.

**NFR-PRI-003 — Safe application logging**  
Normal application logs shall avoid patient-identifying or clinical information unless explicitly required for controlled auditing.

## 4. Data Integrity

**NFR-DAT-001 — Unique patient identity**  
Patient identifiers shall be unique within the system.

**NFR-DAT-002 — Relationship consistency**  
Patient, chart, appointment, and visit relationships shall remain internally consistent.

**NFR-DAT-003 — Validation before persistence**  
Required fields, identifiers, dates, relationships, and applicable business rules shall be validated before data is saved.

**NFR-DAT-004 — Cross-patient integrity**  
The system shall prevent accidental association of chart, appointment, or visit information with the wrong patient.

**NFR-DAT-005 — Atomic related changes**  
Changes that must succeed together shall be persisted atomically where transactions are supported.

**NFR-DAT-006 — Historical preservation**  
Cancelled and rescheduled appointment information shall remain understandable rather than being silently destroyed.

## 5. Performance

**NFR-PERF-001 — Common reads**  
Under normal MVP deployment conditions, at least 95% of common operations such as patient search, chart opening, and appointment-list loading should complete within 2 seconds.

**NFR-PERF-002 — Standard writes**  
At least 95% of normal patient and appointment save operations should complete within 3 seconds, excluding unavailable external services.

**NFR-PERF-003 — Concurrent users**  
The MVP should support at least 10 concurrent authenticated users under a representative workload.

**NFR-PERF-004 — Repeatable measurement**  
Performance testing shall document the environment and workload used for measurement.

## 6. Reliability and Failure Handling

**NFR-REL-001 — Safe failure state**  
Network or persistence failures shall result in a clear failure state rather than an unverified success state.

**NFR-REL-002 — Duplicate prevention**  
The application should avoid duplicate creation when a retry can be identified as the same operation.

**NFR-REL-003 — Actionable errors**  
Recoverable errors shall provide a practical next step without exposing implementation details or sensitive information.

**NFR-REL-004 — Preserve confirmed data**  
A failed subsequent operation shall not corrupt already-confirmed patient, chart, appointment, or visit data.

**NFR-REL-005 — Recovery procedure**  
Critical persistent data shall have a documented recovery procedure appropriate to the internship deployment.

## 7. Usability and Accessibility

**NFR-USE-001 — Consistent workflow**  
Core workflows shall use consistent navigation, terminology, and action placement.

**NFR-USE-002 — Wrong-patient prevention**  
Patient identity and context shall remain visible during chart-related operations to reduce wrong-patient actions.

**NFR-USE-003 — Understandable validation**  
Required fields and validation messages shall be understandable to non-technical users.

**NFR-USE-004 — Appointment status visibility**  
Relevant appointment states such as Scheduled, Checked-in/Arrived, Completed, Cancelled, and No-show shall be distinguishable where included in the final MVP.

**NFR-USE-005 — Accessible controls**  
Interactive controls should have readable labels and support keyboard navigation where the selected UI technology permits.

## 8. Maintainability

**NFR-MNT-001 — Separation of concerns**  
Business rules shall be sufficiently separated from presentation concerns to allow testing without relying exclusively on UI automation.

**NFR-MNT-002 — Understandable domain model**  
Patient, chart, appointment, and visit concepts shall be documented clearly enough for another developer to understand the model.

**NFR-MNT-003 — Modular design**  
The architecture shall keep the three MVP business areas sufficiently separated to support later expansion without complicating the current implementation.

**NFR-MNT-004 — Lifecycle traceability**  
Requirements, architecture decisions, implementation changes, and tests shall remain traceable through documentation and version control.

**NFR-MNT-005 — ADR discipline**  
Significant architectural decisions shall be recorded using the project's ADR format.

## 9. Auditability

**NFR-AUD-001 — Actor and timestamp**  
Audit events shall identify the relevant user or system actor and event timestamp.

**NFR-AUD-002 — Important event coverage**  
The final audit policy shall cover important patient, appointment, status, access, and other sensitive operations included in the MVP.

**NFR-AUD-003 — Audit protection**  
Audit information shall not be editable through ordinary application workflows.

**NFR-AUD-004 — Minimum necessary content**  
Audit records shall store event metadata rather than unnecessary clinical content.

## 10. Backup and Recovery

**NFR-BAK-001 — Backup mechanism**  
A backup mechanism for persistent MVP data shall be defined before any production-like deployment.

**NFR-BAK-002 — Restore procedure**  
Backup and restore procedures shall be documented and tested at least once using representative data.

**NFR-BAK-003 — Protected backups**  
Backup access shall be protected because backups may contain sensitive patient information.

**NFR-BAK-004 — Relationship-preserving recovery**  
Recovery testing shall confirm that representative patient, chart, appointment, and visit relationships remain intact.

## 11. Scope Boundary

The following are **not MVP non-functional commitments**: FHIR implementation, external EMR exchange, enterprise-scale interoperability, advanced analytics, AI clinical decision support, patient portal/mobile functionality, and enterprise scheduling/resource optimization.

International healthcare standards are not required for this internship MVP.

## 12. Validation Status

These requirements form the current engineering baseline for the MVP. Requirements involving clinical permissions, patient-status policy, audit coverage, retention, and recovery should be confirmed with the appropriate clinical stakeholder before being treated as final.

Available clinical feedback is preliminary and qualitative; it is not treated as statistically representative clinical evidence.
