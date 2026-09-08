# Requirements Traceability Matrix

**Project:** Open Clinical Record  
**Scope:** MVP — Patient Management, Patient Chart, Appointment Management  
**Status:** Revised engineering baseline

## 1. Purpose

This matrix connects the approved MVP requirements to workflows, business rules, roles, architecture/data design, and planned verification. It is the traceability bridge between requirements and implementation.

A requirement is not considered implemented or verified merely because it appears in this document. Verification requires objective evidence from tests, review, or acceptance records.

## 2. Canonical MVP Workflows

| ID | Workflow |
|---|---|
| UC-01 | Patient registration and identification |
| UC-02 | Patient search and profile/chart access |
| UC-03 | Patient chart information management |
| UC-04 | Appointment scheduling and management |
| UC-05 | Check-in and walk-in handling |
| UC-06 | Authentication, authorization, validation, and audit |

These six workflows are the canonical MVP set. Individual CRUD actions are requirement items, not additional application modules.

## 3. Functional Requirements

| Requirement | Summary | Workflow | Primary role | Verification |
|---|---|---|---|---|
| FR-PM-001 | Register patient | UC-01 | Receptionist / Front Desk | Acceptance test |
| FR-PM-002 | Assign unique patient ID | UC-01 | System / Receptionist | Unit + integration test |
| FR-PM-003 | Search patient | UC-02 | All three roles | Acceptance test |
| FR-PM-004 | View patient profile | UC-02 | All three roles, permission-controlled | Acceptance test |
| FR-PM-005 | Update permitted patient information | UC-02 | Authorized roles | Authorization + acceptance test |
| FR-PM-006 | Detect likely duplicate patients | UC-01, UC-02 | System behavior | Validation/integration test |
| FR-PM-007 | Maintain basic patient status | UC-02 | Authorized role | Authorization + acceptance test |
| FR-PC-001 | Open patient chart | UC-02, UC-03 | All three roles, permission-controlled | Acceptance test |
| FR-PC-002 | Display chart summary | UC-03 | Nurse / Clinical Staff; Clinician / Doctor | Acceptance test |
| FR-PC-003 | Record/view allergies | UC-03 | Authorized clinical role | Authorization + integration test |
| FR-PC-004 | Record/view medication history | UC-03 | Authorized clinical role | Authorization + integration test |
| FR-PC-005 | Record/view important patient alerts | UC-03 | Authorized clinical role | Acceptance test |
| FR-PC-006 | View appointment history | UC-03 | Authorized roles | Acceptance test |
| FR-PC-007 | View visit/check-in history | UC-03 | Authorized roles | Acceptance test |
| FR-PC-008 | Prevent wrong-patient chart association | UC-03 | System behavior | Integration + authorization test |
| FR-AP-001 | Create appointment | UC-04 | Receptionist / Front Desk | Acceptance test |
| FR-AP-002 | View appointments | UC-04 | All three roles, permission-controlled | Acceptance test |
| FR-AP-003 | View appointment details | UC-04 | Authorized roles | Acceptance test |
| FR-AP-004 | Reschedule appointment | UC-04 | Receptionist / Front Desk | Acceptance + integration test |
| FR-AP-005 | Cancel appointment | UC-04 | Receptionist / Front Desk | Acceptance + integration test |
| FR-AP-006 | Maintain appointment status | UC-04 | System behavior | Unit + integration test |
| FR-AP-007 | Check in patient | UC-05 | Receptionist / Front Desk; Nurse / Clinical Staff | Acceptance test |
| FR-AP-008 | Support basic walk-in | UC-05 | Receptionist / Front Desk; Nurse / Clinical Staff | Acceptance test |
| FR-AP-009 | Link visit to patient and applicable appointment | UC-05 | System behavior | Integration test |
| FR-AP-010 | Preserve appointment history | UC-04 | System behavior | Integration test |
| FR-SEC-001 | Authenticate user | UC-06 | All three roles | Security test |
| FR-SEC-002 | Enforce exactly three roles | UC-06 | System behavior | Authorization test |
| FR-SEC-003 | Restrict unauthorized operations | UC-06 | All three roles | Authorization test |
| FR-SEC-004 | Audit important actions | UC-06 | System behavior | Audit test |
| FR-VAL-001 | Validate required data and relationships | UC-01–UC-05 | System behavior | Validation test |
| FR-VAL-002 | Enforce appointment/patient status rules | UC-04, UC-05 | System behavior | Acceptance test |
| FR-VAL-003 | Report failures clearly | UC-01–UC-06 | All three roles | Usability test |
| FR-VAL-004 | Prevent partial/inconsistent save on failure | UC-01–UC-05 | System behavior | Integration test |

## 4. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Each patient has one unique patient identifier within the system. |
| BR-002 | Patient chart information must belong to the correct patient. |
| BR-003 | Cancelled appointments remain in history and are not silently deleted. |
| BR-004 | Rescheduling preserves enough history to understand the previous appointment state. |
| BR-005 | A walk-in may create a visit without a prior appointment. |
| BR-006 | Appointment operations must respect applicable patient and appointment status rules. |
| BR-007 | Chart access does not automatically grant permission to modify every chart information type. |
| BR-008 | Only Receptionist / Front Desk, Nurse / Clinical Staff, and Clinician / Doctor are MVP application roles. |
| BR-009 | Important patient and appointment actions should be auditable. |
| BR-010 | Future EMR functionality is deferred until the three core modules are complete. |

## 5. Role Coverage

| Role | Core responsibilities |
|---|---|
| Receptionist / Front Desk | Register/search patients, maintain permitted demographics, manage appointments, check in patients, support basic walk-ins |
| Nurse / Clinical Staff | View patient/chart information, support check-in/visit workflow, maintain permitted chart information |
| Clinician / Doctor | Review patient charts/history and perform authorized chart updates required by the MVP |

**There is no Administrator role in the MVP.** Authentication and authorization are cross-cutting mechanisms supporting these three roles.

## 6. Non-Functional Traceability

| NFR category | Requirements | Main verification |
|---|---|---|
| Security & Privacy | NFR-SEC-001–008; NFR-PRI-001–003 | Security + authorization tests |
| Data Integrity | NFR-DAT-001–006 | Integrity + transaction tests |
| Performance | NFR-PERF-001–004 | Performance tests |
| Reliability | NFR-REL-001–005 | Failure/recovery tests |
| Usability & Accessibility | NFR-USE-001–005 | Usability/acceptance tests |
| Maintainability | NFR-MNT-001–005 | Architecture/code review |
| Auditability | NFR-AUD-001–004 | Audit verification |
| Backup & Recovery | NFR-BAK-001–004 | Restore/recovery test |

International interoperability/FHIR is intentionally not included in the MVP NFR baseline.

## 7. Traceability to Architecture and Data

| Requirement area | Architecture/data target |
|---|---|
| Patient Management | Patient entity + patient-management API/module |
| Patient Chart | Patient + Allergy + Medication History + Patient Alert + patient-linked appointment/visit history |
| Appointment Management | Appointment + optional appointment history/event + Visit |
| Authentication/authorization | User/authentication service and backend authorization |
| Audit | Audit Event or equivalent minimal audit mechanism |

The current logical ERD at `docs/03-requirements/ER/OCR_MVP_ERD.html` and the data-model baseline at `docs/05-data/README.md` are the current data references for implementation.

## 8. Scope Exclusions

The following requirements from earlier drafts are no longer MVP requirements and must not appear as implementation commitments:

- Full clinical encounter documentation
- Diagnosis and treatment documentation
- Prescription management
- Clinical notes as a full documentation subsystem
- Medical report/document generation
- Finalized-document amendment/versioning
- Laboratory, pharmacy, billing, insurance, or radiology modules
- Patient portal/mobile application
- External EMR exchange or FHIR integration
- Advanced analytics or enterprise scheduling
- AI clinical decision support

They may remain in research documents as future/domain context, but they must not be treated as current MVP requirements.

## 9. Status

**Current status:** Scope, SRS, architecture, NFRs, traceability, clinical domain rules, and logical ERD are aligned to the same three-module MVP. The data-model baseline is established and project work can proceed while the remaining workflow decisions are resolved.

A requirement moves to **verified** only when objective implementation/test evidence exists.
