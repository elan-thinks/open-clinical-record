# Non-Functional Requirements

## 1. Purpose

This document defines the quality attributes and operational constraints for Open Clinical Record. The requirements complement the functional requirements by describing how the system should behave in terms of security, privacy, reliability, performance, usability, maintainability, auditability, and future extensibility.

The requirements are written for the internship MVP and are intentionally practical for a simplified EMR. Enterprise-scale capabilities that cannot be responsibly delivered within the internship scope are treated as future considerations rather than MVP commitments.

## 2. Scope

The MVP focuses on three clinical workflows:

1. Patient chart and patient status management
2. Appointment, check-in, visit, and encounter workflow
3. Medical records and clinical documentation

The MVP has exactly three application roles:

- **Clinician / Doctor** — clinical assessment, diagnosis, treatment, clinical documentation, reports, and relevant patient-status actions.
- **Nurse / Clinical Staff** — vital signs, observations, patient preparation, and supported clinical workflow actions.
- **Receptionist / Front Desk** — patient registration, patient search, appointment scheduling, rescheduling, cancellation, and check-in.

Administrator is not an MVP application role. Deployment-level administration and broader user-management capabilities may be addressed later.

## 3. Quality Requirements

### 3.1 Security

**NFR-SEC-01 — Authentication**  
The system shall require an authenticated user before allowing access to protected patient, appointment, encounter, or medical-record information.

**NFR-SEC-02 — Role-based authorization**  
The system shall enforce permissions according to the three approved MVP roles. A user shall not gain access to an operation merely because the operation is visible in the interface.

**NFR-SEC-03 — Least privilege**  
Users shall receive only the permissions required for their assigned clinical workflow responsibilities.

**NFR-SEC-04 — Protected clinical data**  
Patient and clinical information shall not be exposed through unauthenticated endpoints, public application pages, or client-side interfaces that bypass authorization checks.

### 3.2 Privacy

**NFR-PRI-01 — Minimum necessary access**  
The system shall expose patient information only to authenticated users with a legitimate application permission for the requested operation.

**NFR-PRI-02 — No patient-identifying data in development documentation**  
Development examples, test data, screenshots, demonstrations, and documentation shall use synthetic or de-identified patient information.

**NFR-PRI-03 — Sensitive-data handling**  
The application shall avoid writing patient-identifying or clinical information to ordinary application logs unless explicitly required for a controlled audit purpose.

### 3.3 Data Integrity and Clinical Safety

**NFR-INT-01 — Validation**  
Required fields, dates, statuses, identifiers, and workflow transitions shall be validated before data is persisted.

**NFR-INT-02 — Referential integrity**  
Clinical records, encounters, appointments, and other dependent data shall remain associated with the correct patient and shall not create orphaned clinical records through normal application operations.

**NFR-INT-03 — Historical preservation**  
Rescheduling and cancellation shall preserve relevant history rather than silently replacing the previous state.

**NFR-INT-04 — Finalized-document protection**  
A finalized or signed clinical document shall not be silently overwritten. Corrections shall be represented as an amendment or other traceable correction mechanism.

**NFR-INT-05 — Deceased-patient integrity**  
Marking a patient deceased shall preserve existing historical records while preventing or appropriately handling new appointments that conflict with the patient's status.

### 3.4 Reliability and Availability

**NFR-REL-01 — Transaction consistency**  
Operations that update related clinical data shall either complete consistently or fail without leaving the system in a partially persisted state.

**NFR-REL-02 — Error handling**  
Expected application failures shall produce clear, user-safe error messages without exposing stack traces, database credentials, or other implementation-sensitive information.

**NFR-REL-03 — Network resilience**  
Because network reliability was identified as a practical concern during preliminary clinical feedback, the system shall fail gracefully when a request cannot be completed and shall avoid presenting an unconfirmed clinical action as successful.

**NFR-REL-04 — Recovery consideration**  
The deployment design shall document a practical backup and recovery approach appropriate to the selected database and hosting environment, even if automated disaster recovery is outside the internship MVP.

### 3.5 Performance

**NFR-PERF-01 — Common interactions**  
Under normal development/demo conditions, common operations such as patient search, opening a patient chart, viewing appointments, and loading recent records should normally return within **2 seconds**.

**NFR-PERF-02 — Clinical workflow responsiveness**  
Patient registration, appointment actions, check-in, vital-sign entry, and clinical documentation operations should provide visible completion feedback within **2 seconds** under normal conditions.

**NFR-PERF-03 — Efficient retrieval**  
Patient and appointment queries shall use appropriate database filtering and indexing rather than loading an entire dataset into the client for ordinary searches.

**NFR-PERF-04 — Scope-aware performance**  
Performance expectations apply to the internship MVP and its expected demonstration workload; they do not represent an enterprise-scale capacity guarantee.

### 3.6 Usability

**NFR-USE-01 — Workflow-oriented interface**  
The interface shall reflect the approved clinical workflow: registration/search → chart → appointment or walk-in → check-in → clinical care → documentation → longitudinal record.

**NFR-USE-02 — Clear status visibility**  
Appointment and documentation statuses shall be clearly distinguishable, including Scheduled, Checked-in/Arrived, In consultation, Completed, Cancelled, No-show, and Rescheduled where applicable.

**NFR-USE-03 — Clinical context**  
The patient chart shall provide the primary context for relevant patient information rather than requiring users to navigate unrelated screens to reconstruct the patient's current clinical state.

**NFR-USE-04 — Action feedback**  
The system shall provide clear confirmation for successful create/update actions and clear recovery guidance for failed actions.

**NFR-USE-05 — Safety-critical visibility**  
Important alerts such as allergies, critical conditions, important medications, adverse reactions, follow-up needs, precautions, and deceased status shall be visually distinguishable from ordinary patient information.

### 3.7 Auditability

**NFR-AUD-01 — Auditable clinical changes**  
The system shall retain sufficient information to determine what important clinical or workflow change occurred, when it occurred, and which authenticated user performed it.

**NFR-AUD-02 — Appointment history**  
Reschedule and cancellation actions shall retain their relevant history, including the action and responsible user where applicable.

**NFR-AUD-03 — Document lifecycle**  
Clinical documentation shall distinguish draft/in-progress information from finalized/signed information and preserve correction history when applicable.

### 3.8 Maintainability

**NFR-MNT-01 — Separation of concerns**  
The implementation shall separate presentation/UI concerns, application/business logic, data access, and domain models sufficiently to allow individual areas to be changed without unnecessary impact on the rest of the system.

**NFR-MNT-02 — Consistent conventions**  
The codebase shall use consistent naming, formatting, project structure, error-handling patterns, and commit conventions.

**NFR-MNT-03 — Testability**  
Business rules and important workflow behavior shall be implemented in a form that can be tested independently of the user interface where practical.

**NFR-MNT-04 — Documentation**  
Important architectural and design decisions shall be recorded so that another developer can understand the reasoning behind significant implementation choices.

### 3.9 Extensibility and Interoperability Readiness

**NFR-EXT-01 — Modular boundaries**  
Patient, appointment, encounter, and medical-record capabilities shall have clear domain boundaries so future modules can be added without redesigning the entire system.

**NFR-EXT-02 — API readiness**  
The architecture shall avoid coupling core business rules directly to a specific UI so that an API or alternative client can be introduced later.

**NFR-EXT-03 — Standards awareness**  
The data and API design should use concepts that can be mapped to healthcare interoperability standards such as FHIR where practical, without requiring full FHIR implementation in the MVP.

**NFR-EXT-04 — Future modules**  
The design shall leave reasonable extension points for future laboratory, pharmacy, radiology, billing/insurance, patient portal, mobile, and AI-assisted capabilities without treating those capabilities as current MVP requirements.

## 4. Backup and Recovery

Backup and recovery are deployment concerns rather than clinical user workflows, but they must be considered before release.

The deployment documentation shall specify:

- What database data is backed up
- Backup frequency appropriate to the chosen environment
- Where backups are stored
- How a backup can be restored
- Who is responsible for performing recovery in the internship deployment
- How test/demo data is separated from any real patient information

No production deployment should rely on an undocumented backup process.

## 5. Accessibility and Responsible UX

The MVP should provide readable labels, clear form validation, sufficient contrast, predictable navigation, and status information that is not communicated only through color.

Because this is a clinical system, the interface should favor clarity and error prevention over decorative complexity.

## 6. Requirements Priority

| ID Group | Priority | Rationale |
|---|---|---|
| SEC | High | Protects patient and clinical information |
| PRI | High | Supports responsible handling of health information |
| INT | High | Prevents unsafe or misleading clinical data changes |
| REL | High | Clinical workflow must fail safely |
| AUD | High | Important clinical and workflow actions need traceability |
| USE | High | Workflow must be practical for clinical users |
| PERF | Medium | Important for usable demonstrations and normal operation |
| MNT | Medium | Reduces implementation and maintenance risk |
| EXT | Medium | Prepares the system for future modules without overbuilding MVP |

## 7. Acceptance Summary

Issue #3 can be considered complete when:

- Security and privacy requirements are explicitly defined.
- Data-integrity rules cover clinical history, finalized documents, and deceased status.
- Reliability requirements address failures and network-related concerns.
- Performance expectations are measurable enough to test during MVP validation.
- Usability requirements reflect the approved clinical workflow.
- Auditability requirements cover important clinical and appointment changes.
- Maintainability and extensibility expectations are documented.
- Backup/recovery expectations are recorded as deployment requirements.
- Requirements remain consistent with the three-role MVP and do not introduce Administrator as an application role.

## 8. Validation Status

These NFRs are an engineering baseline derived from the approved workflow, project scope, preliminary clinical feedback, and the current requirements lifecycle. They should be validated during implementation and testing, and clinical stakeholders should review requirements that directly affect clinical safety or workflow.

One clinician response has provided useful preliminary validation, but it is not treated as statistically representative of clinical practice.
