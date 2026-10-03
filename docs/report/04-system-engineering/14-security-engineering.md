# 4.14 Security Engineering

## 4.14.1 Security scope

Security in OCR is a cross-cutting concern because the system contains patient and clinical information. Protecting identity, access, data integrity, and operational accountability is therefore part of the core design.

The implemented controls are appropriate to the internship MVP and should not be presented as a complete production healthcare security program.

## 4.14.2 Security control layers

The security chain can be understood as:

User → Authentication → JWT identity → Role/policy authorization → Workflow validation → Persistence → Audit/operational history.

Each layer answers a different question. Authentication identifies the caller. Authorization limits actions. Business validation checks whether an otherwise authorized action is valid in the current state.

## 4.14.3 Authentication

ASP.NET Core Identity manages application users and roles. JWT Bearer authentication provides the mechanism by which API requests carry authenticated identity.

The project's access-control testing confirms that anonymous access to protected operations is rejected.

## 4.14.4 Authorization

Authorization is role-based. The implemented roles are Admin, Doctor, Nurse, and Receptionist.

The access-control matrix defines specific capabilities rather than granting unrestricted access to every authenticated user. For example, Nurse is explicitly denied permission to mark a patient deceased.

## 4.14.5 Backend enforcement

The strongest security boundary exists on the backend. Frontend controls can hide unavailable actions, but a client can construct HTTP requests manually. Backend authorization therefore independently checks the caller's role.

The project validates this behavior through automated access-matrix tests and manual smoke scenarios.

## 4.14.6 Input and workflow validation

Security is not limited to authentication. Backend validation checks conditions such as patient existence, lifecycle state, appointment transitions, cancellation reasons, and required roles.

This reduces the chance that a technically valid request can create an invalid system state.

## 4.14.7 Configuration and secrets

The project uses application configuration/environment mechanisms for connection strings and JWT-related settings rather than embedding deployment-specific secrets into normal application logic.

Development seed credentials are documented for testing only. They are not suitable production credentials.

A production deployment would require proper secret storage, rotation, least-privilege database credentials, and environment-specific configuration management.

## 4.14.8 Error-information control

Persistence failures return generic client-facing information while database exception details remain on the server side. This reduces the chance of exposing schema names, SQL details, provider information, or internal implementation structure.

## 4.14.9 CORS

Development configuration allows the Vite frontend origin to communicate with the backend. CORS is treated as a browser-origin control, not as an authentication mechanism. It does not replace API authorization.

## 4.14.10 Auditability

AuditEvent provides a mechanism for recording important system actions with actor, event, time, and affected entity information. The audit trail supports accountability without duplicating the complete clinical payload.

## 4.14.11 Security areas not fully addressed

Further production hardening would include formal threat modeling, stronger credential policies, secret rotation, session/token strategy, rate limiting, security headers, dependency vulnerability management, centralized monitoring, penetration testing, and detailed privacy/compliance controls.

These are future hardening areas rather than current implemented features.

## 4.14.12 Engineering lesson

Security cannot be bolted onto the interface after functionality is complete. Role boundaries, authentication, backend authorization, validation, auditability, and record integrity influence architecture from the beginning.

The access-control matrix was particularly useful because it transformed vague security expectations into concrete, testable behavior.
