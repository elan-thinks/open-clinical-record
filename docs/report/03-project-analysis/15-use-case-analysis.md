# 15. Use-Case Analysis

## 15.1 Purpose

Use cases translate stakeholder responsibilities into observable interactions with the system. They complement the requirements tables by explaining how users accomplish work rather than only listing what the system shall do.

## 15.2 Use-Case Catalogue

| ID | Use case | Primary actor |
|---|---|---|
| UC-01 | Authenticate user | All users |
| UC-02 | Register patient | Receptionist |
| UC-03 | Search/view patient | Authorized operational/clinical users |
| UC-04 | Update patient information | Permitted user |
| UC-05 | Book appointment | Receptionist |
| UC-06 | Check in patient | Receptionist |
| UC-07 | Review patient chart | Doctor / permitted clinical users |
| UC-08 | Record vital signs | Nurse / permitted clinical user |
| UC-09 | Record diagnosis | Doctor |
| UC-10 | Record clinical note | Permitted clinical user |
| UC-11 | Finalize clinical visit | Doctor / authorized workflow actor |
| UC-12 | Cancel appointment | Authorized operational user |
| UC-13 | Reschedule appointment | Authorized operational user |
| UC-14 | Mark appointment NoShow | Authorized operational user |
| UC-15 | Manage users | Administrator |
| UC-16 | Review audit information | Administrator |
| UC-17 | View operational dashboard | Authorized user |

## 15.3 Example Use Case — Register Patient

**Preconditions**
- User is authenticated.
- User has the required role.

**Main flow**
1. User opens patient registration.
2. User enters required patient information.
3. System validates the input.
4. System creates the patient record.
5. System assigns/records the MRN.
6. System confirms successful registration.

**Postconditions**
- A persistent patient exists and can be used in subsequent workflow.

**Failure cases**
- Required information is missing.
- Input fails validation.
- Persistence operation fails.

## 15.4 Example Use Case — Check In Patient

**Preconditions**
- Patient has an eligible appointment.
- User is authenticated and authorized.

**Main flow**
1. User locates the appointment.
2. User initiates check-in.
3. System validates appointment state.
4. System changes the appointment workflow state.
5. System creates or associates the draft clinical visit where appropriate.
6. Patient appears in the active workflow/queue.

**Failure cases**
- Appointment is already completed.
- Appointment is cancelled.
- Appointment is marked NoShow.
- User is not authorized.

## 15.5 Example Use Case — Finalize Clinical Visit

**Preconditions**
- User is authenticated.
- User has the required clinical role.
- Visit is in Draft state.

**Main flow**
1. Clinician reviews the patient and current visit.
2. Clinician records required clinical information.
3. System validates the operation.
4. Visit transitions to Final.
5. The linked appointment is completed where the workflow permits.
6. Historical visit remains available in the chart.

**Failure cases**
- Visit is already Final.
- User lacks authorization.
- Required relationship or record is missing.

## 15.6 Use-Case Value

The use-case analysis creates a direct bridge between requirements and testing. Each major use case can later be represented by a normal-path test, one or more validation tests, and one or more authorization/negative tests.
