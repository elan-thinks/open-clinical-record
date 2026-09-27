# Requirements Traceability Matrix

**Project:** Open Clinical Record  
**Scope:** MVP — Patient Management, Patient Chart, Appointment Management  
**Status:** Aligned with SRS v2.0 (2026-09-27)

## 1. Purpose

This matrix connects approved MVP requirements to workflows, roles, and verification. A requirement is **verified** only with objective test or acceptance evidence.

## 2. Canonical MVP workflows

| ID | Workflow |
|----|----------|
| UC-01 | Patient registration and identification |
| UC-02 | Patient search and profile/chart access |
| UC-03 | Patient chart and visit documentation |
| UC-04 | Appointment scheduling and management |
| UC-05 | Check-in, queue, and walk-in handling |
| UC-06 | Authentication, authorization, validation, and audit |

## 3. Functional requirements

| Requirement | Summary | Workflow | Primary roles | Verification |
|-------------|---------|----------|---------------|--------------|
| FR-PM-001 | Register patient | UC-01 | Receptionist (+ staff) | Acceptance + AccessMatrix |
| FR-PM-002 | Unique MRN | UC-01 | System | Integration |
| FR-PM-003 | Search patient | UC-02 | All staff | Acceptance |
| FR-PM-004 | View profile | UC-02 | All staff | Acceptance |
| FR-PM-005 | Update demographics | UC-02 | Authorized staff | Authorization test |
| FR-PM-006 | Duplicate awareness | UC-01 | System / UI | Acceptance |
| FR-PM-007 | Patient status | UC-02 | Authorized | Acceptance |
| FR-PM-008 | Mark deceased | UC-02 | Admin, Doctor, Receptionist | AccessMatrix |
| FR-PM-009 | Clear deceased | UC-02 | Admin, Doctor | AccessMatrix |
| FR-PM-010 | No book if deceased | UC-04 | System | AccessMatrix / workflow test |
| FR-PC-001 | Open chart | UC-02, UC-03 | Staff | Acceptance |
| FR-PC-002 | Chart summary | UC-03 | Clinical / staff | Acceptance |
| FR-PC-003 | Allergies | UC-03 | Doctor, Nurse | AccessMatrix |
| FR-PC-004 | Medical history items | UC-03 | Doctor, Nurse | AccessMatrix |
| FR-PC-005 | ClinicalVisit entity | UC-03, UC-05 | System | LongitudinalVisitTests |
| FR-PC-006 | Visit statuses Draft/Final/Cancelled | UC-03 | System | ClinicalDocumentationTests |
| FR-PC-007 | Default Draft | UC-03, UC-05 | System | ClinicalDocumentationTests |
| FR-PC-008 | Final immutable | UC-03 | System | ClinicalDocumentationTests |
| FR-PC-009 | Vital signs | UC-03 | Doctor, Nurse | ClinicalDocumentationTests |
| FR-PC-010 | Diagnoses | UC-03 | Doctor, Nurse | ClinicalDocumentationTests |
| FR-PC-011 | Notes / plan | UC-03 | Doctor, Nurse | ClinicalDocumentationTests |
| FR-PC-012 | No overwrite on return | UC-03 | System | LongitudinalVisitTests |
| FR-PC-013 | Visit history UI | UC-03 | Staff | Acceptance |
| FR-PC-014 | Receptionist blocked from clinical write | UC-03 | System | AccessMatrix |
| FR-PC-015 | Final → appointment Completed | UC-03, UC-05 | System | Workflow + acceptance |
| FR-AP-001 | Create appointment | UC-04 | StaffCanBook | AccessMatrix |
| FR-AP-002 | List by date | UC-04 | Staff | Acceptance |
| FR-AP-003 | Calendar view | UC-04 | Staff | Acceptance |
| FR-AP-004 | Appointment type labels | UC-04 | Staff | Acceptance |
| FR-AP-005 | Reschedule rules | UC-04 | Staff | AppointmentWorkflowTests |
| FR-AP-006 | Cancel requires reason | UC-04 | Staff | AppointmentWorkflowTests |
| FR-AP-007 | Status transition engine | UC-04 | System | AppointmentWorkflowTests |
| FR-AP-008 | Check-in + Draft visit | UC-05 | Desk / Nurse | AppointmentWorkflowTests |
| FR-AP-009 | AppointmentEvent history | UC-04 | System | AppointmentWorkflowTests |
| FR-AP-010 | Queue excludes terminal | UC-05 | System | Acceptance |
| FR-AP-011 | Staff book policy | UC-04 | All four roles | AccessMatrix |
| FR-SEC-001 | Authenticate | UC-06 | All | Security / 401 tests |
| FR-SEC-002 | Four roles | UC-06 | System | AccessMatrix |
| FR-SEC-003 | Reject unauthorized | UC-06 | System | AccessMatrix |
| FR-SEC-004 | Audit important actions | UC-06 | System | Audit tests / acceptance |
| FR-SEC-005 | Admin list audit | UC-06 | Admin | Acceptance |
| FR-VAL-001 | Validate before save | UC-01–05 | System | Validation tests |
| FR-VAL-002 | Status business rules | UC-04–05 | System | Workflow tests |
| FR-VAL-003 | Clear errors | UC-01–06 | System | Acceptance |
| FR-RPT-001 | Dashboard stats | UC-06 | Staff | Acceptance |
| FR-RPT-002 | Simple reports view | UC-06 | Staff | Acceptance |

## 4. Business rules

| ID | Rule |
|----|------|
| BR-001 | Each patient has one unique MRN. |
| BR-002 | Chart and visit data belong to one patient; wrong-patient association is prevented. |
| BR-003 | Cancelled appointments remain in history (not hard-deleted). |
| BR-004 | Reschedule preserves prior slot information via events. |
| BR-005 | Walk-in is supported as an appointment type and/or check-in path without inventing false history. |
| BR-006 | Appointment transitions are limited to the approved matrix. |
| BR-007 | Chart write permission is separate from chart read permission. |
| BR-008 | Exactly four application roles exist. |
| BR-009 | Important actions are auditable. |
| BR-010 | Prior visits are never overwritten. |
| BR-011 | Cancel requires a reason. |
| BR-012 | Final visit completes linked appointment. |

## 5. Role coverage

| Role | Core responsibilities |
|------|------------------------|
| Receptionist | Register/search, appointments, check-in, mark deceased |
| Nurse | Chart writes (vitals/visits), queue support; not mark deceased |
| Doctor | Chart writes, mark/clear deceased |
| Admin | Users, audit, operational access; not default clinical author |

## 6. NFR categories

See `non-functional-requirements.md` (NFR-SEC, NFR-DAT, NFR-PERF, NFR-REL, NFR-USE, NFR-MNT, NFR-AUD, NFR-BAK).

## 7. Architecture / data mapping

| Area | Implementation target |
|------|------------------------|
| Patient Management | Patient APIs + Patient entity |
| Chart / visits | ClinicalChartService + ClinicalVisit + vitals/dx/notes |
| Appointments | AppointmentWorkflowService + AppointmentEvent |
| Security | JWT + policies |
| Audit | AuditEvent + Admin API |

## 8. Exclusions

Pharmacy, lab, radiology, billing, portal, FHIR, enterprise scheduling, AI CDS — not MVP requirements.

## 9. Status

**SRS v2.0 + this matrix** are the Week 8 requirements baseline. Verification evidence lives in automated tests and the manual E2E checklist.
