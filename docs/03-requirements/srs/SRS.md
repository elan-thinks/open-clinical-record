# Software Requirements Specification (SRS)

**Product name:** Open Clinical Record (OCR)  
**Document type:** Software Requirements Specification  
**Version:** 2.0  
**Date:** 2026-09-27  
**Status:** Finalization baseline (Week 8) — aligned with implemented MVP on `main`  
**Repository:** https://github.com/elan-thinks/open-clinical-record  

| Version | Date | Summary |
|---------|------|---------|
| 1.x | 2026-09 | Early internship drafts (roles/visit model evolving) |
| **2.0** | **2026-09-27** | Four roles; longitudinal visits; appointment state machine; audit; NFRs linked to implementation |

**Related documents:**  
`docs/00-project/project-scope.md` · `docs/03-requirements/clinical-domain-rules.md` · `docs/03-requirements/traceability-matrix.md` · `docs/03-requirements/non-functional-requirements.md` · `docs/05-engineering/access-control-report.md` · `docs/clinical-visit-model.md` · `docs/08-finalization/technical-documentation.md`

---

## 1. Introduction

### 1.1 Purpose

This SRS defines the functional and non-functional requirements for the Open Clinical Record internship MVP. It is the **requirements baseline** for acceptance, testing, and evaluation. Where older drafts conflict with this document, **this version prevails**.

### 1.2 Scope

OCR is a **focused outpatient electronic medical record** supporting three business modules:

1. **Patient Management** — register, identify, search, update demographics/status  
2. **Patient Chart** — longitudinal chart: allergies, history, **visits** (vitals, diagnoses, notes)  
3. **Appointment Management** — schedule, reschedule, cancel, check-in/queue, status history  

The product is **not** a full hospital EMR. Pharmacy, laboratory, radiology, billing, patient portal, and FHIR exchange are **out of scope**.

### 1.3 Definitions and acronyms

| Term | Definition |
|------|------------|
| MVP | Minimum Viable Product for the internship |
| Patient | Registered person with a unique medical record number |
| Appointment | Scheduled (or walk-in typed) attendance slot |
| Visit / ClinicalVisit | One facility attendance record; holds clinical content |
| Draft | Editable visit status |
| Final | Closed visit; content immutable |
| JWT | JSON Web Token used for API authentication |
| RBAC | Role-based access control |

### 1.4 References

- Project scope, domain rules, role guide, NFRs, traceability matrix (this repository)  
- Architecture overview and ADRs under `docs/04-architecture/`  
- IEEE 830-style structure adapted for internship scale  

### 1.5 Overview

Section 2 describes the product and users. Section 3 lists functional requirements. Section 4 summarizes non-functional requirements (detail in the NFR document). Section 5 states constraints and exclusions. Section 6 describes acceptance.

---

## 2. Overall description

### 2.1 Product perspective

OCR is a standalone web application:

```text
React (SPA)  →  ASP.NET Core REST API (JWT)  →  PostgreSQL
```

### 2.2 Product functions (summary)

- Authenticate users and authorize by role  
- Register and manage patients (including deceased status policy)  
- Maintain longitudinal chart data and **per-visit** clinical documentation  
- Schedule and manage appointments; check in patients; preserve history  
- Provide role-aware dashboards and basic operational reports/stats  
- Audit important actions for administrators  

### 2.3 User characteristics — application roles

The MVP uses **exactly four** application roles:

| Role | Claim value | Primary responsibilities |
|------|-------------|--------------------------|
| Receptionist / Front Desk | `Receptionist` | Registration, booking, check-in, cancel/reschedule, mark deceased |
| Nurse / Clinical Staff | `Nurse` | Chart support, vitals, visit documentation (write) |
| Clinician / Doctor | `Doctor` | Chart review, clinical documentation, mark/clear deceased |
| System Administrator | `Admin` | Users, audit, configuration; operational access without default clinical authorship |

**Rule:** UI visibility is not security. The **API shall enforce** authorization independently.

### 2.4 Constraints

- Internship time-box; scope limited to three modules  
- PostgreSQL as the system of record  
- Development training accounts must not be used in production  
- International interoperability (FHIR) is not required for MVP acceptance  

### 2.5 Assumptions and dependencies

- Users have a modern browser and network access to the API  
- PostgreSQL is available for non-test deployments  
- Appointment dates are handled as clinic-local calendar dates  

---

## 3. Functional requirements

Requirements use IDs compatible with the traceability matrix. Priority: **M** = must for MVP acceptance.

### 3.1 Patient management (FR-PM)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PM-001 | The system shall allow authorized users to **register** a new patient with required demographics. | M |
| FR-PM-002 | The system shall assign a **unique medical record number** to each patient. | M |
| FR-PM-003 | The system shall allow authenticated staff to **search** patients by name and/or MRN. | M |
| FR-PM-004 | The system shall allow authorized users to **view** a patient profile. | M |
| FR-PM-005 | The system shall allow authorized users to **update** permitted demographic and contact fields. | M |
| FR-PM-006 | The system should support **duplicate awareness** (e.g. search-before-create guidance). | M |
| FR-PM-007 | The system shall maintain patient **status**: Active, Inactive, or Deceased. | M |
| FR-PM-008 | The system shall support **marking a patient deceased** with recorded provenance for roles Admin, Doctor, and Receptionist (**not Nurse**). | M |
| FR-PM-009 | The system shall support **clearing deceased status** for roles Admin and Doctor only. | M |
| FR-PM-010 | The system shall **reject new appointments** for patients with status Deceased. | M |

### 3.2 Patient chart and visits (FR-PC)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PC-001 | The system shall allow authorized users to **open a patient chart** in the context of a single patient. | M |
| FR-PC-002 | The system shall display a chart **summary** (identity, status, key alerts). | M |
| FR-PC-003 | The system shall allow **Doctor and Nurse** to record and view **allergies**. | M |
| FR-PC-004 | The system shall allow **Doctor and Nurse** to record and view **medical history items**. | M |
| FR-PC-005 | The system shall represent clinical attendance as a **ClinicalVisit** linked to the patient. | M |
| FR-PC-006 | The system shall support visit statuses **Draft**, **Final**, and **Cancelled**. | M |
| FR-PC-007 | New visits shall default to **Draft** and remain editable until Final. | M |
| FR-PC-008 | **Final** visits shall be **immutable** (no further clinical documentation edits). | M |
| FR-PC-009 | The system shall allow clinical staff to record **vital signs** on a visit. | M |
| FR-PC-010 | The system shall allow clinical staff to record **diagnoses** (primary/secondary) on a visit. | M |
| FR-PC-011 | The system shall allow clinical staff to record **clinical notes** and plan/instructions on a visit. | M |
| FR-PC-012 | The system shall **never overwrite** a prior visit when the patient returns; a **new visit** shall be created. | M |
| FR-PC-013 | The system shall display **visit history** chronologically on the chart. | M |
| FR-PC-014 | Receptionist shall **not** create or edit clinical visit content (API forbidden). | M |
| FR-PC-015 | When a visit linked to an appointment is set to **Final**, the system shall set that appointment to **Completed** (queue alignment). | M |

### 3.3 Appointments (FR-AP)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AP-001 | The system shall allow authorized staff to **create** an appointment for an existing non-deceased patient. | M |
| FR-AP-002 | The system shall allow viewing appointments for a selected **date** (list). | M |
| FR-AP-003 | The system shall support a **calendar** view (day/week) of appointments. | M |
| FR-AP-004 | The system shall support appointment **types** as labels (e.g. Consultation, Follow-up, Walk-in). | M |
| FR-AP-005 | The system shall allow **reschedule** when status is Scheduled, Waiting, Cancelled, or NoShow; and shall block reschedule for CheckedIn, InProgress, and Completed. | M |
| FR-AP-006 | The system shall allow **cancel** only with a **non-empty reason**. | M |
| FR-AP-007 | The system shall implement appointment statuses: Scheduled, Waiting, CheckedIn, InProgress, Completed, Cancelled, NoShow, with **enforced transitions**. | M |
| FR-AP-008 | The system shall allow **check-in**, transitioning to CheckedIn and creating a **Draft visit** when applicable. | M |
| FR-AP-009 | The system shall record **AppointmentEvent** history for meaningful status/reschedule changes. | M |
| FR-AP-010 | The active **check-in queue** shall exclude terminal statuses Completed, Cancelled, and NoShow. | M |
| FR-AP-011 | Booking shall be available to Admin, Doctor, Nurse, and Receptionist (staff book policy). | M |

### 3.4 Security, validation, audit (FR-SEC / FR-VAL)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SEC-001 | The system shall **authenticate** users before accessing protected resources. | M |
| FR-SEC-002 | The system shall enforce **exactly four** application roles as defined in §2.3. | M |
| FR-SEC-003 | The system shall **reject unauthorized** operations at the API (e.g. 401/403). | M |
| FR-SEC-004 | The system shall **audit** important actions with actor and timestamp. | M |
| FR-SEC-005 | Admin shall be able to **list audit events**. | M |
| FR-VAL-001 | The system shall validate required fields and relationships before persistence. | M |
| FR-VAL-002 | The system shall enforce patient/appointment **business status rules** (e.g. deceased booking). | M |
| FR-VAL-003 | The system shall return **clear error messages** without leaking sensitive internals. | M |

### 3.5 Dashboard and reporting (FR-RPT)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RPT-001 | The system shall provide **dashboard statistics** (e.g. appointments today, waiting, checked-in). | M |
| FR-RPT-002 | The system may provide a simple **reports** view based on live stats (not a full BI suite). | M |

---

## 4. Non-functional requirements (summary)

Full text: `docs/03-requirements/non-functional-requirements.md`.

| Category | Commitments (MVP) |
|----------|-------------------|
| Security | Backend authorization, hashed passwords, least privilege, no plaintext secrets in repo |
| Privacy | Minimum necessary access; synthetic data in demos |
| Integrity | Unique MRN; consistent FKs; history not silently deleted |
| Performance | Common reads ~2s, writes ~3s under normal lab load; ≥10 concurrent users target |
| Reliability | Failed ops do not report success; confirmed data preserved |
| Usability | Role-aware navigation; visible patient context; distinguishable statuses |
| Auditability | Actor + timestamp; non-editable audit stream |
| Maintainability | Service-layer separation; migrations as schema source of truth |

---

## 5. External interface requirements

### 5.1 User interfaces

- Web SPA with role-aware shell  
- Core screens: Login, Dashboard, Patients, Register, Chart, Appointments (list/calendar), Check-in queue, Profile, Admin audit  

### 5.2 Software interfaces

- REST JSON API under `/api/*`  
- PostgreSQL via EF Core  

### 5.3 Communication

- HTTPS preferred in deployment; HTTP allowed in local development  

---

## 6. Data requirements (logical)

| Concept | Persistence |
|---------|-------------|
| Patient | Patients table; status; MRN unique |
| Allergy / history | Patient-owned rows |
| Visit | ClinicalVisits; content cascaded |
| Appointment | Appointments + AppointmentEvents |
| Death | PatientDeathRecords |
| Audit | AuditEvents |
| Users/roles | ASP.NET Identity (or equivalent) |

Schema authority: **EF Core migrations**. Reference SQL under `docs/05-data/` is secondary.

---

## 7. Verification and acceptance

### 7.1 Verification methods

| Method | Use |
|--------|-----|
| Automated API tests | Access matrix, appointment transitions, clinical finalize, longitudinal visits |
| Manual E2E checklist | `docs/09-testing/e2e-clinical-flow-checklist.md` |
| CI pipeline | Backend tests + frontend typecheck/build on `main` |

### 7.2 Acceptance criteria (MVP)

1. Four roles can sign in and see role-appropriate navigation.  
2. Patient can be registered, searched, and opened in chart.  
3. Appointment can be booked, checked in, cancelled (with reason), and rescheduled under allowed statuses.  
4. Clinical staff can document a Draft visit and finalize; history shows multiple visits without overwrite.  
5. Finalizing a visit completes the linked appointment for queue purposes.  
6. Unauthorized clinical writes by Receptionist are rejected.  
7. Deceased booking is rejected; mark/clear deceased follows role matrix.  
8. Technical documentation and user guide are available in the repository.  

---

## 8. Exclusions (not requirements)

- Prescription / pharmacy dispensing  
- Laboratory or imaging order management  
- Billing and insurance adjudication  
- Patient portal or native mobile apps  
- FHIR/HL7 external exchange  
- Multi-facility enterprise scheduling  
- AI clinical decision support  

---

## 9. Appendices

### A. Seed users (development only)

See `docs/05-engineering/access-control-report.md`.

### B. Appointment transition table

See `docs/03-requirements/clinical-domain-rules.md` §3.

### C. Traceability

Requirement IDs in this SRS map to `docs/03-requirements/traceability-matrix.md`.

---

**Document control:** Changes after v2.0 shall increment version and note the date. Implementation evidence is the `main` branch of the project repository.
