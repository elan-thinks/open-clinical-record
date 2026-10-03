# 11. User and Role Analysis

## 11.1 Role Model

OCR uses four primary operational roles:

- Receptionist / Front Desk
- Nurse / Clinical Staff
- Doctor / Clinician
- Administrator / System Administrator

The role model is intentionally small and maps directly to the workflow responsibilities required by the MVP.

## 11.2 Receptionist / Front Desk

Primary responsibilities:

- register patients;
- search and view operational patient information;
- create appointments;
- check patients in;
- cancel or reschedule appointments where permitted;
- perform permitted patient lifecycle operations.

The receptionist is therefore the principal user at the beginning of the outpatient workflow.

## 11.3 Nurse / Clinical Staff

Primary responsibilities:

- support clinical visits;
- record vital signs;
- contribute permitted clinical documentation;
- review information required to support care.

The nurse role is intentionally restricted from operations reserved for other roles, including the ability to mark a patient deceased where the business rules prohibit it.

## 11.4 Doctor / Clinician

Primary responsibilities:

- review the patient chart;
- review previous clinical visits;
- document diagnoses;
- document clinical notes;
- complete/finalize clinical documentation;
- perform permitted patient lifecycle operations.

The doctor is the principal clinical author in the MVP.

## 11.5 Administrator

Primary responsibilities:

- manage application users;
- manage operational configuration;
- review audit/system information;
- perform authorized administrative operations.

Administrative access does not automatically make the administrator the author of clinical content.

## 11.6 Authorization Principle

OCR follows a defense-in-depth approach:

**Authentication → role identification → frontend access control → API/backend authorization → service-layer business rules → data operation**

Frontend visibility improves usability, but it is not treated as the security boundary. The backend independently enforces authorization and workflow rules.

## 11.7 Role Analysis and Testing

Each role creates distinct test scenarios. Examples include:

- receptionist creates an appointment;
- nurse records permitted vitals;
- doctor adds diagnosis and finalizes a visit;
- unauthorized role attempts a restricted operation;
- deceased patient cannot receive a new appointment;
- administrative user manages users.

This turns the role model into an executable quality concern rather than documentation only.
