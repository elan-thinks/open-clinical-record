# Requirements Traceability Matrix

**Project:** Open Clinical Record  
**Scope:** MVP — Patient Chart, Medical Records/Reports, Appointments  
**Status:** Draft baseline

## 1. Purpose

This matrix connects the MVP requirements to their clinical/workflow origin, business rules, approved user roles, and planned verification. It keeps requirements traceable from discovery through architecture, implementation, and testing.

The matrix records planned verification even where implementation or tests have not yet been created. A requirement is not considered implemented or verified merely because it appears in this document.

## 2. Traceability Chain

**Clinical discovery → Workflow/use case → Requirement → Business rule → Architecture/data design → Verification**

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

## 4. Functional Requirements

| Requirement | Requirement summary | Workflow / source | Business rule | Primary role coverage | Verification |
|---|---|---|---|---|---|
| FR-PAT-001 | Register patient | UC-01 | BR-008 | Receptionist; Nurse; Clinician | Acceptance test |
| FR-PAT-002 | Assign patient identifier | UC-01 | BR-008 | Receptionist; Nurse; Clinician | Unit/integration test |
| FR-PAT-003 | Search patient | UC-02 | BR-008 | All three roles | Acceptance test |
| FR-PAT-004 | View patient profile | UC-02 | BR-008 | All three roles, permission-controlled | Acceptance test |
| FR-PAT-005 | View clinical summary | UC-02 | BR-005, BR-008 | Nurse; Clinician; limited context for Receptionist | Acceptance test |
| FR-PAT-006 | Record allergies | UC-02, UC-05 | BR-005, BR-008 | Nurse/Clinical Staff or Clinician per approved policy | Authorization + integration test |
| FR-PAT-007 | Record medications | UC-02, UC-05 | BR-005, BR-008 | Nurse/Clinical Staff or Clinician per approved policy | Authorization + integration test |
| FR-PAT-008 | Display alerts | UC-02 | BR-005 | Clinician; Nurse as clinically required | Acceptance test |
| FR-PAT-009 | Record patient status | UC-02, UC-08 | BR-008 | Clinician primarily | Authorization test |
| FR-PAT-010 | Mark deceased patient | UC-08 | BR-006 | Clinician/Doctor | Acceptance test |
| FR-PAT-011 | Handle deceased patient | UC-08 | BR-006 | All scheduling roles | Integration/acceptance test |
| FR-APT-001 | Create appointment | UC-03 | BR-006, BR-008 | Receptionist; Nurse; Clinician if permitted | Acceptance test |
| FR-APT-002 | View appointments | UC-03 | BR-008 | All three roles, permission-controlled | Acceptance test |
| FR-APT-003 | Reschedule appointment | UC-03 | BR-002 | Receptionist; Nurse; Clinician if permitted | Acceptance test |
| FR-APT-004 | Cancel appointment | UC-03 | BR-001 | Receptionist; Nurse; Clinician if permitted | Acceptance test |
| FR-APT-005 | Preserve appointment history | UC-03 | BR-001, BR-002 | System behavior | Integration test |
| FR-APT-006 | Check in patient | UC-04 | BR-008 | Receptionist; Nurse; Clinician if permitted | Acceptance test |
| FR-APT-007 | Support walk-in workflow | UC-04 | BR-007 | Receptionist; Nurse; Clinician | Acceptance test |
| FR-APT-008 | Link appointment to encounter | UC-04, UC-05 | BR-008 | System behavior | Integration test |
| FR-APT-009 | Prevent deceased-patient booking | UC-03, UC-08 | BR-006 | System behavior | Acceptance test |
| FR-ENC-001 | Start encounter | UC-05 | BR-008 | Nurse; Clinician | Integration test |
| FR-ENC-002 | Record chief complaint | UC-05 | BR-008 | Clinician/Doctor | Acceptance test |
| FR-ENC-003 | Record vitals | UC-05 | BR-008 | Nurse; Clinician | Acceptance test |
| FR-ENC-004 | Record history | UC-05 | BR-008 | Clinician/Doctor | Acceptance test |
| FR-ENC-005 | Record examination | UC-05 | BR-008 | Clinician/Doctor | Acceptance test |
| FR-ENC-006 | Record diagnosis | UC-05 | BR-004, BR-008 | Clinician/Doctor | Authorization + acceptance test |
| FR-ENC-007 | Record treatment | UC-05 | BR-004, BR-008 | Clinician/Doctor | Authorization + acceptance test |
| FR-ENC-008 | Record prescription | UC-05 | BR-004, BR-008 | Clinician/Doctor | Authorization + acceptance test |
| FR-ENC-009 | Create clinical note | UC-06 | BR-003, BR-004, BR-008 | Clinician/Doctor | Acceptance test |
| FR-ENC-010 | Maintain encounter linkage | UC-05, UC-06 | BR-008 | System behavior | Integration test |
| FR-REC-001 | Generate medical report | UC-06 | BR-003, BR-008 | Clinician/Doctor | Acceptance test |
| FR-REC-002 | Finalize clinical document | UC-07 | BR-003 | Clinician/Doctor | Acceptance test |
| FR-REC-003 | Restrict finalized editing | UC-07 | BR-003, BR-004 | Clinician/Doctor; system enforcement | Authorization test |
| FR-REC-004 | Amend finalized document | UC-07 | BR-003 | Clinician/Doctor | Acceptance test |
| FR-REC-005 | Preserve original document | UC-07 | BR-003 | System behavior | Integration test |
| FR-REC-006 | Record amendment history | UC-07 | BR-003, BR-004 | System behavior | Audit/integration test |
| FR-REC-007 | View document status | UC-06, UC-07 | BR-003 | Authorized clinical roles | Acceptance test |
| FR-SEC-001 | Authenticate user | UC-09 | — | All three roles | Security test |
| FR-SEC-002 | Enforce role permissions | UC-09 | BR-004 | All three roles | Authorization test |
| FR-SEC-003 | Restrict clinical actions | UC-09 | BR-004 | All three roles | Authorization test |
| FR-SEC-004 | Audit sensitive actions | UC-09 | BR-004 | System behavior | Audit test |
| FR-SEC-005 | Protect unauthorized access | UC-09 | BR-004 | All three roles | Security test |
| FR-VAL-001 | Validate required data | UC-01, UC-03, UC-05, UC-06 | — | All relevant workflows | Validation test |
| FR-VAL-002 | Prevent invalid appointments | UC-03 | BR-006, BR-008 | All scheduling roles | Acceptance test |
| FR-VAL-003 | Report failures clearly | All MVP workflows | — | All three roles | Usability/acceptance test |
| FR-VAL-004 | Preserve data on failure | All MVP workflows | BR-008 | System behavior | Integration test |

## 5. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Cancelled appointments remain in history and are clearly marked cancelled. |
| BR-002 | Rescheduled appointments retain sufficient history to distinguish the original appointment from the updated appointment. |
| BR-003 | Finalized clinical documents cannot be silently overwritten; corrections are handled as traceable amendments while preserving the original. |
| BR-004 | Diagnosis, treatment, prescription, clinical notes, reports, and patient-status changes are protected by role-based permissions. |
| BR-005 | Clinically relevant alerts, including allergies and high-priority risks, are visible in appropriate clinical context. |
| BR-006 | Deceased patients cannot receive inappropriate future appointments; existing future appointments are handled according to the configured policy. |
| BR-007 | Walk-in handling remains flexible because the appropriate path may depend on urgency and patient condition. |
| BR-008 | Clinical information remains linked to the correct patient and encounter. |
| BR-009 | A user does not gain additional clinical authority merely by accessing a patient chart. |
| BR-010 | Historical information is not silently destroyed when an operational state changes. |

## 6. Non-Functional Requirements

| NFR category | Primary requirements | Traceability / verification |
|---|---|---|
| Security & Privacy | NFR-SEC-001–008 | UC-09; security, authorization and privacy tests |
| Data Integrity & Clinical Record Safety | NFR-DAT-001–007 | BR-003, BR-008; integrity, transaction and audit tests |
| Performance | NFR-PERF-001–004 | Core patient, appointment and encounter workflows; performance tests |
| Reliability & Failure Handling | NFR-REL-001–005 | All critical workflows; failure/recovery tests |
| Usability & Accessibility | NFR-USE-001–006 | Core workflows; usability/acceptance testing |
| Maintainability & Extensibility | NFR-MNT-001–005 | Architecture review and code-quality verification |
| Interoperability / FHIR Readiness | NFR-INT-001–004 | Architecture/data review; future integration verification |
| Auditability | NFR-AUD-001–004 | UC-09 and BR-003/BR-004; audit verification |
| Backup & Recovery | NFR-BAK-001–004 | Recovery testing |

## 7. Approved Role Coverage

The MVP uses exactly three application roles:

1. **Clinician / Doctor** — responsible for clinical assessment and provider-level documentation, including diagnosis, treatment, prescription, clinical notes, medical reports, finalized-document actions, and authorized patient-status changes.
2. **Nurse / Clinical Staff** — responsible for permitted clinical support activities, patient/appointment workflow support, check-in, vitals, and other duties explicitly granted by the final permission policy.
3. **Receptionist / Front Desk** — responsible for patient-facing administrative workflow, registration, search, appointment operations, check-in, and supported walk-in intake; not provider-level diagnosis, treatment, prescribing, or clinical-report authoring.

There is **no Administrator role in the MVP role model**. System security and authorization are implemented across the three approved roles. Any future administrative capability must be introduced through a separately approved requirements change rather than assumed in the current baseline.

## 8. Evidence Sources

The matrix is grounded in the project's current discovery and research artifacts, especially:

- `docs/02-discovery/clinical-workflow.md` — proposed end-to-end clinical workflow.
- `docs/01-research/clinical-documentation-research.md` — finalized-document integrity and amendment direction.
- `docs/01-research/research-log.md` — patient chart as the main clinical context, linked appointments/encounters, historical preservation, deceased-patient handling, and future interoperability boundary.
- `docs/01-research/patient-chart-research.md` — patient chart content and longitudinal context.
- `docs/01-research/appointment-scheduling-research.md` — appointment lifecycle and scheduling considerations.
- `docs/04-architecture/adr/0001-record-architectural-decisions.md` — approach for recording architecture decisions and evidence.

## 9. Traceability Status

**Current status:** Functional requirements, business rules, role coverage, and high-level NFR traceability are drafted. Architecture, data-model, implementation, and test references will be linked as those artifacts are produced.

A requirement should only move to **verified** when objective evidence exists in the corresponding test, review, or acceptance record.
