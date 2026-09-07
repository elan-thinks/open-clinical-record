# Requirements Traceability Matrix

**Project:** Open Clinical Record  
**Scope:** MVP — Patient Chart, Medical Records/Reports, Appointments  
**Status:** Draft

## 1. Purpose

This matrix connects the MVP requirements to their clinical/workflow origin and planned verification. It is intended to keep requirements traceable from discovery through architecture, implementation, and testing.

## 2. Traceability Chain

The MVP follows this chain:

**Clinical discovery → Workflow/use case → Requirement → Business rule → Architecture/data design → Verification**

The matrix records planned verification even where implementation or tests have not yet been created. A requirement is not considered implemented merely because it appears in this document.

## 3. Clinical Workflow / Use-Case References

| ID | Workflow / Use Case |
|---|---|
| UC-01 | Patient registration and identification |
| UC-02 | Patient search, chart and clinical summary |
| UC-03 | Appointment scheduling and management |
| UC-04 | Check-in and walk-in handling |
| UC-05 | Clinical encounter and assessment |
| UC-06 | Clinical documentation and reporting |
| UC-07 | Finalization, correction and amendment of clinical documents |
| UC-08 | Patient status and deceased-patient lifecycle |
| UC-09 | Authentication, authorization and audit |

These use cases reflect the proposed end-to-end clinical workflow connecting registration, chart, appointments, check-in, clinical work, documentation, and the longitudinal record.

## 4. Functional Requirements

| Requirement | Requirement summary | Workflow / source | Business rule | Verification |
|---|---|---|---|---|
| FR-PAT-001 | Register patient | UC-01 | BR-008 | Acceptance test |
| FR-PAT-002 | Assign patient identifier | UC-01 | BR-008 | Unit/integration test |
| FR-PAT-003 | Search patient | UC-02 | BR-008 | Acceptance test |
| FR-PAT-004 | View patient profile | UC-02 | BR-008 | Acceptance test |
| FR-PAT-005 | View clinical summary | UC-02 | BR-005, BR-008 | Acceptance test |
| FR-PAT-006 | Record allergies | UC-02, UC-05 | BR-005, BR-008 | Unit/integration test |
| FR-PAT-007 | Record medications | UC-02, UC-05 | BR-005, BR-008 | Unit/integration test |
| FR-PAT-008 | Display alerts | UC-02 | BR-005 | Acceptance test |
| FR-PAT-009 | Record patient status | UC-02, UC-08 | BR-008 | Acceptance test |
| FR-PAT-010 | Mark deceased patient | UC-08 | BR-006 | Acceptance test |
| FR-PAT-011 | Handle deceased patient | UC-08 | BR-006 | Integration/acceptance test |
| FR-APT-001 | Create appointment | UC-03 | BR-006, BR-008 | Acceptance test |
| FR-APT-002 | View appointments | UC-03 | BR-008 | Acceptance test |
| FR-APT-003 | Reschedule appointment | UC-03 | BR-002 | Acceptance test |
| FR-APT-004 | Cancel appointment | UC-03 | BR-001 | Acceptance test |
| FR-APT-005 | Preserve appointment history | UC-03 | BR-001, BR-002 | Integration test |
| FR-APT-006 | Check in patient | UC-04 | BR-008 | Acceptance test |
| FR-APT-007 | Support walk-in workflow | UC-04 | BR-007 | Acceptance test |
| FR-APT-008 | Link appointment to encounter | UC-04, UC-05 | BR-008 | Integration test |
| FR-APT-009 | Prevent deceased-patient booking | UC-03, UC-08 | BR-006 | Acceptance test |
| FR-ENC-001 | Start encounter | UC-05 | BR-008 | Integration test |
| FR-ENC-002 | Record chief complaint | UC-05 | BR-008 | Acceptance test |
| FR-ENC-003 | Record vitals | UC-05 | BR-008 | Acceptance test |
| FR-ENC-004 | Record history | UC-05 | BR-008 | Acceptance test |
| FR-ENC-005 | Record examination | UC-05 | BR-008 | Acceptance test |
| FR-ENC-006 | Record diagnosis | UC-05 | BR-004, BR-008 | Authorization + acceptance test |
| FR-ENC-007 | Record treatment | UC-05 | BR-004, BR-008 | Authorization + acceptance test |
| FR-ENC-008 | Record prescription | UC-05 | BR-004, BR-008 | Authorization + acceptance test |
| FR-ENC-009 | Create clinical note | UC-06 | BR-003, BR-004, BR-008 | Acceptance test |
| FR-ENC-010 | Maintain encounter linkage | UC-05, UC-06 | BR-008 | Integration test |
| FR-REC-001 | Generate medical report | UC-06 | BR-003, BR-008 | Acceptance test |
| FR-REC-002 | Finalize clinical document | UC-07 | BR-003 | Acceptance test |
| FR-REC-003 | Restrict finalized editing | UC-07 | BR-003, BR-004 | Authorization test |
| FR-REC-004 | Amend finalized document | UC-07 | BR-003 | Acceptance test |
| FR-REC-005 | Preserve original document | UC-07 | BR-003 | Integration test |
| FR-REC-006 | Record amendment history | UC-07 | BR-003, BR-004 | Audit/integration test |
| FR-REC-007 | View document status | UC-06, UC-07 | BR-003 | Acceptance test |
| FR-SEC-001 | Authenticate user | UC-09 | — | Security test |
| FR-SEC-002 | Enforce role permissions | UC-09 | BR-004 | Authorization test |
| FR-SEC-003 | Restrict clinical actions | UC-09 | BR-004 | Authorization test |
| FR-SEC-004 | Audit sensitive actions | UC-09 | BR-004 | Audit test |
| FR-SEC-005 | Protect unauthorized access | UC-09 | BR-004 | Security test |
| FR-VAL-001 | Validate required data | UC-01, UC-03, UC-05, UC-06 | — | Validation test |
| FR-VAL-002 | Prevent invalid appointments | UC-03 | BR-006, BR-008 | Acceptance test |
| FR-VAL-003 | Report failures clearly | All MVP workflows | — | Usability/acceptance test |
| FR-VAL-004 | Preserve data on failure | All MVP workflows | BR-008 | Integration test |

## 5. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Cancelled appointments remain in history and are clearly marked cancelled. |
| BR-002 | Rescheduled appointments retain sufficient history to distinguish the original appointment from the updated appointment. |
| BR-003 | Finalized clinical documents cannot be silently overwritten; corrections are handled as traceable amendments while preserving the original. |
| BR-004 | Diagnosis, treatment, clinical notes, reports, and patient-status changes are protected by role-based permissions. |
| BR-005 | Clinically relevant alerts, including allergies and high-priority risks, are visible in appropriate clinical context. |
| BR-006 | Deceased patients cannot receive inappropriate future appointments; existing future appointments are handled according to the configured policy. |
| BR-007 | Walk-in handling remains flexible because the appropriate path may depend on urgency and patient condition. |
| BR-008 | Clinical information remains linked to the correct patient and encounter. |

## 6. Non-Functional Requirements

The NFRs are traced by category to the same workflow and architectural evidence. Detailed NFR verification will be expanded as the architecture and test plan are completed.

| NFR category | Primary requirements | Traceability / verification |
|---|---|---|
| Security & Privacy | NFR-SEC-001–006 | UC-09; security, authorization and privacy tests |
| Data Integrity & Clinical Record Safety | NFR-DAT-001–005 | BR-003, BR-008; integrity, transaction and audit tests |
| Performance | NFR-PERF-001–003 | Core patient, appointment and encounter workflows; performance tests |
| Reliability & Failure Handling | Reliability NFRs | All critical workflows; failure/recovery tests |
| Auditability | Audit NFRs | UC-09 and BR-003/BR-004; audit verification |
| Usability | Usability NFRs | Core clinical workflows; acceptance/usability testing |
| Maintainability & Extensibility | Maintainability NFRs | Architecture review and code-quality verification |
| Interoperability / FHIR Readiness | Interoperability NFRs | Architecture/data review; future integration verification |
| Backup & Recovery | Backup/recovery NFRs | Recovery testing |

## 7. Role Coverage

The MVP uses three application roles:

- **Administrator:** manages users, permissions, configuration and audit oversight.
- **Clinical Staff:** supports patient registration/search, appointment operations, check-in and other permitted clinical workflow tasks.
- **Doctor/Clinician:** performs clinical assessment and documentation, including diagnosis, treatment, prescriptions, clinical notes, medical reports and authorized amendments.

Role permissions are governed by the authorization requirements and must be validated against the final role-permission matrix before implementation is considered complete.

## 8. Evidence Sources

The matrix is grounded in the project's current discovery and research artifacts, especially:

- `docs/02-discovery/clinical-workflow.md` — proposed end-to-end clinical workflow.
- `docs/01-research/clinical-documentation-research.md` — finalized-document integrity and amendment direction.
- `docs/01-research/research-log.md` — patient chart as the main clinical context, linked appointments/encounters, historical preservation, deceased-patient handling, and future interoperability boundary.
- `docs/04-architecture/adr/0001-record-architectural-decisions.md` — approach for recording architecture decisions and their evidence.

## 9. Traceability Status

**Current status:** Requirements and business-rule traceability drafted. Architecture, data-model, implementation and test references will be linked as those artifacts are produced.

A requirement should only move to **verified** when objective evidence exists in the corresponding test, review, or acceptance record.
