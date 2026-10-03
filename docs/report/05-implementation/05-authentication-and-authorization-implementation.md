# 5.5 Authentication and Authorization Implementation

## 5.5.1 Security Boundary

OCR implements authentication and authorization as separate but connected concerns. Authentication establishes the identity of the user. Authorization determines whether the authenticated identity is permitted to perform a requested operation.

The application uses ASP.NET Core Identity together with JWT Bearer authentication.

## 5.5.2 Authentication Flow

At a high level:

1. a user submits credentials;
2. the backend authenticates the user;
3. the application issues an authenticated token;
4. the frontend retains the authentication state required for API requests;
5. protected API operations require valid authentication;
6. authorization rules evaluate the user's role and requested operation.

### [SCREENSHOT INSERT — Figure 5.8: Login screen]

**Capture:** OCR login screen in the running application.

**What must be visible:** application branding/title, username/email field, password field, and login action. Use a non-sensitive training/demo account or obscure the actual username if necessary.

**Do not show:** real passwords, JWT tokens, connection strings, secret keys, or personal patient data.

**Purpose:** Demonstrates the user-facing entry point to the authenticated application.

**Suggested caption:** *Figure 5.8. OCR authentication interface.*

## 5.5.3 Role Model

The implemented role model contains:

- Admin
- Doctor
- Nurse
- Receptionist / Front Desk

Roles are used to constrain workflow operations. For example, nurses can support clinical documentation and record vitals, while doctor-level clinical decisions remain restricted to the doctor role. Front-desk users support registration and appointments. Administrators manage operational users and system-level functions.

## 5.5.4 Defense in Depth

The frontend can hide or disable controls that are not appropriate for a role, but this is not treated as the security boundary. The backend independently enforces authorization.

This is important because a malicious or accidental direct API request can bypass frontend visibility. Server-side authorization therefore protects the actual resource boundary.

### [SCREENSHOT INSERT — Figure 5.9: Role-aware application interface]

**Capture:** A running application screen showing a role-specific navigation/menu or action set. If possible, capture the same page under two different demo roles to demonstrate the difference.

**Purpose:** Shows the usability layer of RBAC while the report text explains that backend authorization remains authoritative.

**Suggested caption:** *Figure 5.9. Role-aware presentation of OCR application capabilities.*

## 5.5.5 Authorization Verification

The test strategy includes boundary-focused authorization cases such as:

| Scenario | Expected result |
|---|---|
| Anonymous user accesses protected patient data | 401 |
| Nurse attempts to mark patient deceased | 403 |
| Doctor marks patient deceased | Allowed |
| Doctor books appointment for deceased patient | 400 |
| Receptionist creates clinical visit | 403 |
| Nurse creates clinical visit | 201 |

These cases test the difference between authentication failure, authorization failure, and valid domain rejection.

### [SCREENSHOT INSERT — Figure 5.10: Authorization test evidence]

**Capture:** Test-run output showing one or more authorization-related automated tests passing. If the terminal output contains many unrelated tests, crop or scroll so the relevant test names and pass result are readable.

**Purpose:** Provides executable evidence for the access-control claims.

**Suggested caption:** *Figure 5.10. Automated verification of selected OCR authorization boundaries.*

## 5.5.6 Security Limitations

The implementation is not presented as a complete production security program. Additional production work would include stronger secret management, security monitoring, hardened deployment, comprehensive penetration testing, more complete frontend security testing, and formal operational policies.
