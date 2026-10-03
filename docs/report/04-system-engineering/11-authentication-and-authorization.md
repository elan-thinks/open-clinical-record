# 4.11 Authentication and Authorization

## 4.11.1 Security objective

OCR handles patient and clinical information, so identity and access control are core application requirements rather than optional enhancements.

The implementation uses ASP.NET Core Identity for application users and roles and JWT Bearer authentication for API requests. Authorization is role-based and enforced at the backend.

## 4.11.2 Authentication versus authorization

These concepts were treated separately:

**Authentication** establishes who the caller is.

**Authorization** determines whether that authenticated caller may perform a particular action.

A valid login does not automatically grant access to every operation.

## 4.11.3 Implemented roles

| Role | General responsibility |
|---|---|
| Admin | User, audit, and operational administration |
| Doctor | Clinical documentation and selected patient lifecycle actions |
| Nurse | Clinical support, vital signs, and visit documentation |
| Receptionist | Registration, appointments, and front-desk workflow |

The exact permissions are governed by the project's access-control matrix rather than by job titles alone.

## 4.11.4 Defense in depth

The system uses two related controls.

At the frontend, role information can determine which actions and navigation options are visible.

At the backend, authentication and authorization policies independently enforce access.

This is important because frontend restrictions can be bypassed by directly calling an API. The backend therefore remains authoritative.

## 4.11.5 Authorization matrix

Representative permissions include:

| Operation | Admin | Doctor | Nurse | Receptionist |
|---|:---:|:---:|:---:|:---:|
| List patients | ✓ | ✓ | ✓ | ✓ |
| Create patient | ✓ | ✓ | ✓ | ✓ |
| Create appointment | ✓ | ✓ | ✓ | ✓ |
| Mark deceased | ✓ | ✓ | — | ✓ |
| Clear deceased | ✓ | ✓ | — | — |
| Read chart | ✓ | ✓ | ✓ | ✓ |
| Clinical chart write | — | ✓ | ✓ | — |
| User/audit administration | ✓ | — | — | — |

This table is derived from the project's access-control audit. It should not be generalized beyond the documented OCR MVP.

## 4.11.6 HTTP enforcement behavior

The project verifies the distinction between authentication and authorization.

An anonymous caller attempting a protected operation receives 401.

An authenticated caller whose role is not permitted receives 403.

For example, the access-control smoke test records a nurse attempting to mark a patient deceased as a 403 case, while a doctor can perform that action.

## 4.11.7 Patient lifecycle security

Deceased status is particularly sensitive because it changes the patient's lifecycle.

The system therefore limits the ability to mark and clear deceased status separately:

- Admin, Doctor, and Receptionist may mark deceased;
- Admin and Doctor may clear deceased;
- Nurse may not perform either operation.

The report records this as an implemented project rule, not as a universal healthcare standard.

## 4.11.8 Clinical write boundary

Clinical writing is restricted to Doctor and Nurse in the implemented matrix.

This distinction demonstrates why “authenticated user” and “clinical author” are not equivalent concepts.

The frontend may adapt the interface according to role, but the API remains responsible for rejecting unauthorized clinical writes.

## 4.11.9 Development credentials

The repository contains development seed accounts documented for testing. Those credentials are explicitly development-oriented and must not be treated as production credentials.

The technical documentation also notes that training passwords must not be used in production.

This is an important example of separating a convenient development setup from a production security posture.

## 4.11.10 Security limitations

The implemented access control is appropriate to the internship MVP but does not represent a complete production healthcare security program.

Further production work would include stronger credential management, secret rotation, deployment hardening, detailed security monitoring, formal threat modeling, stronger concurrency controls, and broader automated security testing.

These are identified as future hardening areas rather than claimed as completed features.

## 4.11.11 Engineering lesson

Authorization became much clearer when permissions were expressed as concrete actions instead of vague job descriptions. “Doctor” or “nurse” is not itself a security rule; the useful question is which operation that role may perform.

This produced a testable permission matrix and made the distinction between UI convenience and backend enforcement explicit.
