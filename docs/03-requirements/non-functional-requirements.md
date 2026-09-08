# Non-Functional Requirements

**Project:** Open Clinical Record  
**Scope:** MVP — Patient Chart, Medical Records/Reports, Appointments  
**Status:** Draft baseline

## 1. Purpose

This document defines the quality attributes and operational constraints for the Open Clinical Record MVP. It complements the functional requirements by specifying how the system should behave regarding security, privacy, reliability, performance, usability, maintainability, auditability, interoperability readiness, and backup/recovery.

These requirements are intentionally practical for the internship MVP. Enterprise-scale capabilities are future considerations unless separately approved.

## 2. Approved MVP Roles

The MVP has exactly three application roles:

- **Clinician / Doctor** — clinical assessment, diagnosis, treatment, prescription, clinical documentation, reports, finalized-document actions, and authorized patient-status actions.
- **Nurse / Clinical Staff** — clinical support, patient preparation, observations/vitals, and permitted appointment/check-in support.
- **Receptionist / Front Desk** — patient registration/search, appointment scheduling/rescheduling/cancellation, check-in, and supported walk-in intake.

There is **no Administrator role in the MVP application role model**. Deployment-level administration is outside this role baseline.

## 3. Security and Privacy

**NFR-SEC-001 — Authentication**  
The system shall require authenticated access before protected clinical, patient, appointment, encounter, or medical-record information is displayed.

**NFR-SEC-002 — Authorization enforcement**  
Authorization shall be enforced at the application/service boundary and shall not depend solely on UI visibility.

**NFR-SEC-003 — Least privilege**  
Permissions shall follow least-privilege principles within the three approved MVP roles.

**NFR-SEC-004 — Session protection**  
Sessions shall be protected against trivial unauthorized reuse, and inactive sessions shall follow an approved timeout policy.

**NFR-SEC-005 — Password protection**  
Passwords shall never be stored as plaintext; an appropriate password-hashing mechanism shall be used.

**NFR-SEC-006 — Sensitive-data exposure**  
Protected clinical information shall not be unnecessarily exposed in logs, errors, URLs, or client-side messages.

**NFR-SEC-007 — Sensitive-action auditability**  
Security-sensitive and clinically significant actions shall be auditable by actor and timestamp.

**NFR-SEC-008 — Clinical privilege separation**  
The system shall prevent Receptionist / Front Desk users from performing provider-level clinical actions such as diagnosis, treatment, prescribing, clinical-report authoring, or finalized-document amendment.

**NFR-PRI-001 — Minimum necessary access**  
Patient information shall be exposed only to authenticated users with permission for the requested operation.

**NFR-PRI-002 — Safe development data**  
Development examples, test data, screenshots, demonstrations, and documentation shall use synthetic or de-identified patient information.

**NFR-PRI-003 — Safe application logging**  
Ordinary application logs shall avoid patient-identifying or clinical information unless explicitly required for a controlled audit purpose.

## 4. Data Integrity and Clinical Record Safety

**NFR-DAT-001 — Identifier and relationship consistency**  
Patient identifiers and core record relationships shall remain unique and internally consistent.

**NFR-DAT-002 — Atomic related changes**  
Related changes that must succeed together shall be handled atomically where the persistence technology supports transactions.

**NFR-DAT-003 — Finalized-document protection**  
Finalized clinical document content shall be protected against silent modification.

**NFR-DAT-004 — Amendment linkage**  
Amendment history shall remain associated with the original finalized document.

**NFR-DAT-005 — Pre-persistence validation**  
Required fields, relationships, dates, identifiers, and applicable business rules shall be validated before persistence.

**NFR-DAT-006 — Cross-patient integrity**  
Patient, appointment, encounter, and document relationships shall prevent accidental cross-patient association.

**NFR-DAT-007 — Historical reconstruction**  
Historical appointment and clinical-document states shall remain reconstructable to the extent required by approved policy.

## 5. Performance

**NFR-PERF-001 — Common reads**  
Under normal MVP deployment conditions, at least 95% of common read operations such as patient search, chart opening, and appointment-list loading should complete within 2 seconds.

**NFR-PERF-002 — Standard writes**  
Under normal MVP deployment conditions, at least 95% of standard patient, appointment, and encounter save operations should complete within 3 seconds, excluding unavailable external services.

**NFR-PERF-003 — Concurrent users**  
The MVP should support at least 10 concurrent authenticated users without violating the response targets under a representative workload.

**NFR-PERF-004 — Repeatable measurement**  
Performance tests shall document the test environment and workload so the stated targets are meaningful and repeatable.

## 6. Reliability and Failure Handling

**NFR-REL-001 — Safe failure state**  
A temporary network or persistence failure shall result in a clear failure state rather than an unverified success state.

**NFR-REL-002 — Duplicate prevention on retry**  
The application shall avoid duplicate creation when a retried operation can be identified as a retry of the same request.

**NFR-REL-003 — Actionable errors**  
Recoverable errors shall provide a practical next step without exposing implementation details or sensitive information.

**NFR-REL-004 — Recovery procedure**  
Critical data shall be recoverable from backups according to the deployment's approved recovery procedure.

**NFR-REL-005 — Preserve confirmed data**  
The system shall preserve already-confirmed data when a subsequent operation fails.

## 7. Usability and Accessibility

**NFR-USE-001 — Consistent workflow**  
Common workflows shall use consistent navigation, terminology, and action placement.

**NFR-USE-002 — Wrong-patient prevention**  
Patient identity and context shall remain visible enough to reduce wrong-patient actions.

**NFR-USE-003 — Understandable validation**  
Required fields and validation errors shall be understandable to non-technical users.

**NFR-USE-004 — Appointment status visibility**  
Appointment states such as Scheduled, Checked-in/Arrived, In consultation, Completed, Cancelled, No-show, and Rescheduled shall be distinguishable where applicable.

**NFR-USE-005 — Document status visibility**  
Draft/in-progress and finalized/amended clinical documents shall be visually distinguishable.

**NFR-USE-006 — Accessible controls**  
Interactive controls should support keyboard navigation and readable labels where the selected UI technology permits.

## 8. Maintainability and Extensibility

**NFR-MNT-001 — Separation of concerns**  
Business rules shall be separated from presentation concerns sufficiently to allow testing without relying exclusively on UI automation.

**NFR-MNT-002 — Understandable domain model**  
Domain concepts and persistence mappings shall be documented well enough for another developer to understand the model.

**NFR-MNT-003 — Future module support**  
The architecture shall permit future modules such as laboratory, pharmacy, or patient-facing functionality without rewriting core patient/encounter concepts.

**NFR-MNT-004 — Lifecycle traceability**  
Requirements, architecture decisions, and implementation changes shall remain traceable through project documentation and version control.

**NFR-MNT-005 — ADR discipline**  
Significant architectural decisions shall be recorded as ADRs with context, decision, alternatives, consequences, and evidence.

## 9. Interoperability and FHIR Readiness

**NFR-INT-001 — Standards-mappable domain**  
The internal clinical model shall maintain clear patient, appointment, encounter, and document concepts that can later be mapped to interoperability standards.

**NFR-INT-002 — Internal/external separation**  
External interoperability shall not require the internal database schema to be a direct copy of an external standard.

**NFR-INT-003 — Adapter-ready API boundary**  
API boundaries should allow future FHIR-oriented adapters without coupling the UI directly to FHIR payloads.

**NFR-INT-004 — MVP boundary**  
Production-grade external FHIR integration is outside the MVP unless separately approved.

## 10. Auditability

**NFR-AUD-001 — Actor and timestamp**  
Audit records shall identify the relevant user or system actor and event timestamp.

**NFR-AUD-002 — Significant event coverage**  
Auditable events shall include significant changes to patient records, appointments, clinical documents, patient status, and access/security events as defined by the final audit policy.

**NFR-AUD-003 — Audit immutability**  
Audit information shall not be editable through ordinary clinical workflows.

**NFR-AUD-004 — Minimum necessary audit content**  
The audit mechanism shall not unnecessarily store sensitive clinical content when event metadata is sufficient.

## 11. Backup and Recovery

**NFR-BAK-001 — Backup before production**  
The deployment shall define a backup mechanism for persistent clinical data before production use.

**NFR-BAK-002 — Tested restore procedure**  
Backup and restore procedures shall be documented and tested.

**NFR-BAK-003 — Protected backups**  
Backup access shall be protected because backups contain sensitive information.

**NFR-BAK-004 — Relationship-preserving recovery**  
Recovery testing shall demonstrate that a representative dataset can be restored without losing required relationships.

## 12. Clinical Workflow Alignment

The quality requirements support the approved workflow:

**Registration/Search → Patient Chart → Appointment or Walk-in → Check-in → Clinical Care/Encounter → Documentation → Longitudinal Record**

They also reinforce the key safety boundaries: three application roles only, no autonomous clinical decision-making, preserved appointment/document history, protected finalized documents, and safe handling of deceased-patient status.

## 13. Validation Status

These NFRs are an engineering baseline derived from the project scope, approved clinical workflow, preliminary clinical feedback, and the requirements lifecycle. They must be validated during implementation and testing. Requirements affecting clinical safety, permissions, retention, amendment policy, or operational recovery require mentor/clinical stakeholder review before being treated as final.

One clinician response provides useful preliminary qualitative validation, but it is not treated as statistically representative of clinical practice.
