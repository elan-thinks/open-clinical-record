# Non-Functional Requirements

**Project:** Open Clinical Record  
**Scope:** MVP — Patient Management, Patient Chart, Appointment Management  
**Status:** Revised engineering baseline

## 1. Purpose

This document defines the quality requirements for the reduced Open Clinical Record internship MVP. It complements the functional requirements by describing security, privacy, reliability, performance, usability, maintainability, auditability, and backup/recovery expectations.

These requirements are intentionally practical for an internship-scale system. Enterprise capabilities and international interoperability are outside the committed MVP.

## 2. Approved MVP Roles

The MVP has exactly three application roles:

- **Receptionist / Front Desk** — patient registration/search, permitted demographic updates, appointment scheduling/rescheduling/cancellation, check-in, and supported walk-in intake.
- **Nurse / Clinical Staff** — patient/chart access, check-in/visit support, and permitted chart or basic observation updates.
- **Clinician / Doctor** — patient/chart review and authorized clinical/chart updates required by the MVP.

There is **no Administrator role in the MVP application role model**.

## 3. Security and Privacy

**NFR-SEC-001 — Authentication**  
The system shall require authenticated access before protected patient, chart, or appointment information is displayed.

**NFR-SEC-002 — Authorization enforcement**  
Authorization shall be enforced at the backend/service boundary and shall not depend solely on UI visibility.

**NFR-SEC-003 — Least privilege**  
Permissions shall follow least-privilege principles within the three approved MVP roles.

**NFR-SEC-004 — Session protection**  
Sessions shall be protected against trivial unauthorized reuse, and inactive sessions shall follow an approved timeout policy.

**NFR-SEC-005 — Password protection**  
Passwords shall never be stored as plaintext; an appropriate password-hashing mechanism shall be used.

**NFR-SEC-006 — Sensitive-data exposure**  
Patient or chart information shall not be unnecessarily exposed in logs, errors, URLs, or client-side messages.

**NFR-SEC-007 — Sensitive-action auditability**  
Important patient, chart, appointment, and security actions shall be auditable by actor and timestamp where required by the final audit policy.

**NFR-SEC-008 — Role separation**  
The system shall prevent a user from performing operations outside the permissions of the user's assigned MVP role.

**NFR-PRI-001 — Minimum necessary access**  
Patient information shall be exposed only to authenticated users with permission for the requested operation.

**NFR-PRI-002 — Safe development data**  
Development examples, test data, screenshots, demonstrations, and documentation shall use synthetic or de-identified patient information.

**NFR-PRI-003 — Safe application logging**  
Ordinary application logs shall avoid patient-identifying or sensitive clinical information unless explicitly required for a controlled audit purpose.

## 4. Data Integrity

**NFR-DAT-001 — Identifier and relationship consistency**  
Patient identifiers and core patient, appointment, and visit relationships shall remain unique and internally consistent.

**NFR-DAT-002 — Atomic related changes**  
Related changes that must succeed together shall be handled atomically where the persistence technology supports transactions.

**NFR-DAT-003 — Pre-persistence validation**  
Required fields, relationships, dates, identifiers, and applicable business rules shall be validated before persistence.

**NFR-DAT-004 — Cross-patient integrity**  
Patient chart, appointment, and visit relationships shall prevent accidental association with the wrong patient.

**NFR-DAT-005 — Historical preservation**  
Cancelled and rescheduled appointments shall retain sufficient history to understand what happened rather than silently destroying the previous state.

**NFR-DAT-006 — Walk-in integrity**  
A walk-in visit shall be representable without creating a fabricated appointment solely to satisfy the data model.

## 5. Performance

**NFR-PERF-001 — Common reads**  
Under normal MVP deployment conditions, at least 95% of common read operations such as patient search, chart opening, and appointment-list loading should complete within 2 seconds.

**NFR-PERF-002 — Standard writes**  
Under normal MVP deployment conditions, at least 95% of standard patient, chart, appointment, and visit/check-in saves should complete within 3 seconds, excluding unavailable external services.

**NFR-PERF-003 — Concurrent users**  
The MVP should support at least 10 concurrent authenticated users without violating the response targets under a representative workload.

**NFR-PERF-004 — Repeatable measurement**  
Performance tests shall document the test environment and workload so the stated targets are meaningful and repeatable.

## 6. Reliability and Failure Handling

**NFR-REL-001 — Safe failure state**  
A temporary network or persistence failure shall result in a clear failure state rather than an unverified success state.

**NFR-REL-002 — Duplicate prevention on retry**  
The application should avoid duplicate creation when a retried operation can be identified as a retry of the same request.

**NFR-REL-003 — Actionable errors**  
Recoverable errors shall provide a practical next step without exposing implementation details or sensitive information.

**NFR-REL-004 — Recovery procedure**  
Critical MVP data shall be recoverable from backups according to the deployment's approved recovery procedure.

**NFR-REL-005 — Preserve confirmed data**  
The system shall preserve already-confirmed data when a subsequent operation fails.

## 7. Usability and Accessibility

**NFR-USE-001 — Consistent workflow**  
Common patient and appointment workflows shall use consistent navigation, terminology, and action placement.

**NFR-USE-002 — Wrong-patient prevention**  
Patient identity and context shall remain visible enough to reduce wrong-patient actions.

**NFR-USE-003 — Understandable validation**  
Required fields and validation errors shall be understandable to non-technical users.

**NFR-USE-004 — Appointment status visibility**  
Appointment states used by the MVP, such as Scheduled, Checked-in/Arrived, Completed, Cancelled, and optionally No-show, shall be distinguishable.

**NFR-USE-005 — Accessible controls**  
Interactive controls should support keyboard navigation and readable labels where the selected UI technology permits.

## 8. Maintainability and Extensibility

**NFR-MNT-001 — Separation of concerns**  
Business rules shall be separated from presentation concerns sufficiently to allow testing without relying exclusively on UI automation.

**NFR-MNT-002 — Understandable domain model**  
Core domain concepts and persistence mappings shall be documented well enough for another developer to understand the model.

**NFR-MNT-003 — Future module support**  
The architecture should leave reasonable room for future EMR capabilities without adding those capabilities to the MVP implementation.

**NFR-MNT-004 — Lifecycle traceability**  
Requirements, architecture decisions, implementation changes, and verification evidence shall remain traceable through documentation and version control.

**NFR-MNT-005 — ADR discipline**  
Significant architectural decisions shall be recorded as ADRs with context, decision, alternatives, consequences, and evidence.

## 9. Auditability

**NFR-AUD-001 — Actor and timestamp**  
Audit records shall identify the relevant user or system actor and event timestamp.

**NFR-AUD-002 — Significant event coverage**  
Auditable events shall cover important patient, chart, appointment, check-in/visit, and security actions according to the final audit policy.

**NFR-AUD-003 — Audit immutability**  
Audit information shall not be editable through ordinary application workflows.

**NFR-AUD-004 — Minimum necessary audit content**  
The audit mechanism shall not unnecessarily store sensitive patient content when event metadata is sufficient.

## 10. Backup and Recovery

**NFR-BAK-001 — Backup before production**  
The deployment shall define a backup mechanism for persistent MVP data before production use.

**NFR-BAK-002 — Tested restore procedure**  
Backup and restore procedures shall be documented and tested at an appropriate internship-project scale.

**NFR-BAK-003 — Protected backups**  
Backup access shall be protected because backups contain sensitive patient information.

**NFR-BAK-004 — Relationship-preserving recovery**  
Recovery testing shall demonstrate that a representative dataset can be restored without losing required patient, appointment, and visit relationships.

## 11. MVP Workflow Alignment

The quality requirements support the approved workflow:

**Patient Registration/Search → Patient Chart → Appointment or Walk-in → Check-in/Visit → Updated Patient History**

They reinforce the key boundaries: exactly three application roles, correct-patient association, preserved appointment history, protected patient information, and safe failure handling.

## 12. Deferred Standards and Features

International interoperability standards, including FHIR implementation/integration, are **not MVP requirements**. Full clinical encounters, diagnosis, treatment, prescriptions, advanced medical reports, laboratory, pharmacy, billing, insurance, radiology, patient portals, advanced analytics, and AI clinical decision support are also outside this NFR baseline.

Future work may define additional quality requirements when those features are formally approved.

## 13. Validation Status

**Current status:** Revised engineering baseline aligned with the mentor-approved one-month MVP. Requirements affecting clinical permissions, retention, audit policy, backup/recovery, or patient-status handling should be confirmed with the mentor/clinical stakeholder before final implementation decisions.
