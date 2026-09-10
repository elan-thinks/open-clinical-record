# Role-Based System Guide

**Product:** Open Clinical Record (OCR)  
**Document:** Role-Based System Guide  
**Status:** Design baseline for UX, authorization, and implementation planning  
**Scope:** Patient Management, Patient Chart, Appointment Management  
**Roles covered:** Clinician / Doctor, Nurse / Clinical Staff, Receptionist / Front Desk, System Administrator

> This guide defines how the product should behave and what each role should see and do after login. It is a product/UX and authorization guide, not a replacement for the SRS. The current SRS baseline defines three application roles; adding System Administrator as a fourth role therefore requires an SRS/scope alignment update before implementation is treated as final.

---

## 1. Product Principle

Open Clinical Record is a role-aware clinical application. Users should not receive the same workspace with a few buttons hidden. After authentication, the system should load a workspace designed around the user's responsibilities.

The four roles have different goals:

| Role | Primary goal |
|---|---|
| **Clinician / Doctor** | Review patient information and perform authorized clinical/chart work |
| **Nurse / Clinical Staff** | Support patient care, observations, and visit workflow |
| **Receptionist / Front Desk** | Register patients, manage appointments, and handle arrival/check-in |
| **System Administrator** | Manage users, permissions, configuration, security, and system operations |

### Core authorization rule

**The frontend controls what the user can see; the backend controls what the user is allowed to do.**

Hiding a button is not security. Every protected API operation must independently enforce authorization.

---

# 2. Shared Application Shell

All authenticated users should use a consistent application shell so the product feels like one system rather than four unrelated applications.

### Shared shell elements

- Application logo/name: **Open Clinical Record**
- Role-aware sidebar navigation
- Global patient search where permitted
- Notifications
- Current user name and role
- User menu
- Help/about access if implemented
- Logout
- Responsive content area

### Shared UX behavior

- Clearly show the current role in the user profile/menu.
- Preserve patient context when moving between related patient screens.
- Do not expose navigation items for functions the role cannot access.
- If a user reaches a protected route directly, the backend must still reject unauthorized requests.
- Destructive or sensitive actions require clear confirmation.
- Success and failure states must be explicit.
- Patient identifiers should be visible enough to prevent wrong-patient actions.

---

# 3. Role 1 — Clinician / Doctor

## 3.1 Role purpose

The clinician is responsible for reviewing the patient's clinical context and performing authorized clinical/chart activities included in the product scope.

The doctor's workspace should prioritize **patient context, chart review, appointments, and clinical information** rather than administrative operations.

## 3.2 Primary navigation

Recommended sidebar:

1. **Dashboard**
2. **Patients**
3. **Medical Chart**
4. **Medical Records**
5. **Appointments**
6. **Reports** — only where an approved MVP report function exists
7. **Notifications**

> Navigation should be permission-driven rather than hard-coded solely by role name.

## 3.3 Doctor dashboard

The dashboard should answer: **“Which patients and clinical work need my attention?”**

Recommended sections:

### Summary cards

- Today's appointments
- Patients waiting / checked in
- Completed visits
- Pending clinical work, if supported

### Appointment view

- Today's schedule
- Patient name and identifier
- Appointment time
- Appointment status
- Quick action: **Open Chart**

### Patient attention area

If supported by the MVP:

- Important patient alerts
- Allergy warnings
- Recently updated patient information

### Design principle

The doctor dashboard should be clinical and focused. Avoid filling it with user-management or front-desk statistics.

## 3.4 Patient list

Doctor should be able to:

- Search patients
- Filter relevant patients
- View basic patient identity/status
- Open the patient chart
- Open appointment/visit history

Patient rows should make the next action obvious:

**Patient → Open Chart → Review → Continue workflow**

## 3.5 Medical Chart

The chart is the doctor's main patient workspace.

Recommended structure:

```text
Patient Header
├── Patient name
├── Patient ID
├── Age / sex or approved demographics
├── Patient status
└── Important alerts

Chart Sections
├── Overview
├── Allergies
├── Medication / History
├── Medical Records
├── Appointments
└── Visit / Check-in History
```

The doctor may view all chart information permitted by the MVP and edit only fields explicitly authorized for clinicians.

## 3.6 Medical records

For the current MVP, “medical records” should remain consistent with the approved SRS. Full diagnosis, treatment, prescription, and enterprise encounter documentation should not be silently added just because the interface has a Medical Records section.

Where a record type is approved, the doctor should be able to:

- View it in patient context
- Create or update authorized information
- See author/date information
- Understand the chronological history

## 3.7 Appointments

Doctor should be able to:

- View relevant appointments
- Open appointment details
- See patient context
- See appointment status
- Open the patient chart
- Review check-in/visit information

The doctor should not be the primary owner of front-desk scheduling unless a specific permission is added.

## 3.8 Doctor restrictions

Normally unavailable:

- User creation/deactivation
- Role assignment
- Permission management
- System configuration
- Security configuration
- Deleting patient history
- Editing information outside clinical permissions

---

# 4. Role 2 — Nurse / Clinical Staff

## 4.1 Role purpose

The nurse supports patient care and the clinical workflow. The interface should make **patient preparation, observations, chart context, and visit support** easy to perform.

## 4.2 Primary navigation

Recommended sidebar:

1. **Dashboard**
2. **Patients**
3. **Medical Chart**
4. **Medical Records**
5. **Appointments**
6. **Notifications**

## 4.3 Nurse dashboard

The dashboard should answer: **“Which patients need clinical support right now?”**

Recommended sections:

### Summary cards

- Patients checked in
- Today's appointments
- Patients awaiting support
- Completed/handled patients, if useful

### Work queue

- Patient
- Appointment time
- Status
- Assigned/available action

### Quick actions

- Search patient
- Open chart
- Open appointment
- Record approved observations/vitals
- Support check-in/visit workflow

## 4.4 Patient and chart access

Nurses should be able to:

- Search and open authorized patients
- Review relevant demographics
- Review allergies and important alerts
- Review relevant medication/history information
- View appointment and visit history
- Add or update nurse-owned information when the MVP explicitly supports it

The nurse should not overwrite a doctor's clinical decision or modify fields owned by another role.

## 4.5 Observations / vitals

If basic vitals/observations are confirmed as part of the MVP, the nurse interface should provide a focused data-entry experience.

Example:

```text
Patient: [Name]   ID: [ID]

Vitals / Observations
---------------------
Blood Pressure     [       ]
Heart Rate         [       ]
Temperature        [       ]
Respiratory Rate   [       ]
SpO₂               [       ]
Notes              [       ]

[Cancel] [Save]
```

Only confirmed fields should be implemented. Do not introduce a large nursing module without an approved requirement.

## 4.6 Appointments and check-in

Nurses may:

- View relevant appointments
- Confirm patient arrival where authorized
- Support visit/check-in workflow
- Open the patient's chart from the appointment

Check-in must remain distinct from completion of a clinical consultation.

## 4.7 Nurse restrictions

Normally unavailable:

- User/role management
- System configuration
- Appointment administration outside granted permissions
- Editing or deleting another role's protected clinical information
- Deleting patient history

---

# 5. Role 3 — Receptionist / Front Desk

## 5.1 Role purpose

The receptionist owns the **front-door workflow**: identifying patients, registering patients, scheduling appointments, and recording arrival.

The receptionist interface should be operational and fast rather than clinically dense.

## 5.2 Primary navigation

Recommended sidebar:

1. **Dashboard**
2. **Patients**
3. **Appointments**
4. **Registration**
5. **Check-in / Queue**
6. **Notifications**

## 5.3 Receptionist dashboard

The dashboard should answer: **“Who is arriving, what needs scheduling, and what needs attention at the front desk?”**

Recommended sections:

### Summary cards

- Today's appointments
- Checked-in patients
- Waiting patients
- Available/open appointment slots, if supported

### Today's schedule

Display:

- Time
- Patient
- Appointment purpose/reason where approved
- Status
- Action

### Quick actions

- **Register Patient**
- **Find Patient**
- **Book Appointment**
- **Check In**
- **Walk-in**

These should be prominent because they represent the core front-desk workflow.

## 5.4 Patient registration

Receptionist can:

- Create a patient
- Enter required demographic/contact information
- Generate/receive a unique patient identifier
- Search for possible duplicates before creating a new patient
- View the resulting patient profile

The registration form should be short and structured. Avoid exposing clinical fields that are not required for registration.

## 5.5 Patient profile

Receptionist should see only the patient information required for front-desk work, such as:

- Patient name
- Patient ID
- Approved demographics
- Contact information
- Patient status
- Appointment information

Clinical details such as diagnoses, clinical notes, or sensitive medical history should not be unnecessarily exposed.

## 5.6 Appointment management

Receptionist is the primary scheduling role.

They can:

- Create an appointment for an existing patient
- View appointments
- Reschedule eligible appointments
- Cancel appointments
- View appointment status
- Preserve appointment history

The UI should make appointment state obvious:

```text
Scheduled → Checked-in → Completed
     │
     ├── Rescheduled
     └── Cancelled
```

If No-show is implemented, it must remain distinct from Cancelled.

## 5.7 Check-in and walk-in

### Scheduled patient

```text
Find appointment
      ↓
Confirm patient identity
      ↓
Check in
      ↓
Visit / waiting workflow
```

### Walk-in

```text
Find or register patient
      ↓
Record walk-in arrival
      ↓
Create visit/check-in record
```

A walk-in must not require a fabricated appointment.

## 5.8 Receptionist restrictions

Normally unavailable:

- Clinical notes
- Diagnoses
- Clinical decision-making
- Nursing observations
- Clinical record editing
- User/role/permission management
- System configuration

---

# 6. Role 4 — System Administrator

## 6.1 Role purpose

The System Administrator manages the **application and its security**, not clinical care.

The admin workspace should therefore be operational and security-focused.

## 6.2 Primary navigation

Recommended sidebar:

1. **Dashboard**
2. **Users**
3. **Roles & Permissions**
4. **Patients** — controlled/read-only operational access as required
5. **Audit Logs**
6. **Reports** — administrative reports where approved
7. **System Settings**
8. **Notifications**

## 6.3 Admin dashboard

The dashboard should answer: **“Is the system healthy, secure, and properly configured?”**

Recommended sections:

### Summary cards

- Active users
- Inactive users
- Recent audit events
- System alerts

### Recent activity

Examples:

- User created
- User deactivated
- Role changed
- Permission changed
- Important patient/appointment event

Do not display unnecessary clinical content in administrative activity feeds.

## 6.4 User management

Admin can:

- Create user accounts
- Activate/deactivate accounts
- Reset or initiate account recovery where supported
- Assign approved roles
- View account status
- Update permitted user profile information

User creation should require the minimum information necessary.

## 6.5 Roles and permissions

The permission model should be explicit.

Recommended permission groups:

```text
Patient
├── patient.view
├── patient.create
├── patient.update

Chart
├── chart.view
├── chart.update
├── allergy.view
├── allergy.manage
├── medication-history.view
├── medication-history.manage

Appointments
├── appointment.view
├── appointment.create
├── appointment.update
├── appointment.cancel
├── appointment.checkin

Administration
├── user.view
├── user.create
├── user.update
├── user.deactivate
├── role.view
├── role.manage
├── audit.view
└── system.manage
```

The exact permission list must be finalized against the SRS and implementation architecture.

## 6.6 Audit logs

Admin should be able to review important system events.

Each audit event should provide, where appropriate:

- Actor/user
- Action
- Timestamp
- Affected entity/type
- Result/status
- Relevant identifier

Avoid copying sensitive clinical content into audit messages unnecessarily.

Example:

```text
09 Sep 2026 09:42
User: Receptionist A
Action: Appointment rescheduled
Entity: Appointment #A-1024
Result: Success
```

## 6.7 System settings

Only approved system configuration should appear here. Possible categories include:

- Application settings
- Appointment configuration
- User/account policies
- Audit configuration
- Other approved operational settings

Do not create a large settings area simply to make the admin dashboard look complete.

## 6.8 Admin access to patient information

Administrator access should be carefully controlled and audited.

Being a system administrator does **not** automatically make a user a clinician.

Where technical support requires access to patient records, that access should be:

- Explicitly permitted
- Limited to the required operation
- Audited
- Not presented as clinical authoring capability

---

# 7. Cross-Role Permission Matrix

The following is the recommended product baseline. Exact permissions should be reconciled with the final SRS before implementation.

| Capability | Doctor | Nurse | Receptionist | Admin |
|---|:---:|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ | ✅ |
| Dashboard | Clinical | Nursing | Front desk | Administration |
| Search patients | ✅ | ✅ | ✅ | Controlled |
| View basic patient profile | ✅ | ✅ | ✅ | Controlled |
| Register patient | — | — | ✅ | Controlled |
| Update demographics | Limited | Limited | ✅ | Controlled |
| View medical chart | ✅ | ✅ | Limited/No clinical detail | Controlled |
| View allergies | ✅ | ✅ | Limited | Controlled |
| Manage allergies | Authorized | Authorized | ❌ | Controlled/audited |
| View medication/history | ✅ | Authorized | ❌ | Controlled/audited |
| Manage medication/history | Authorized | Authorized | ❌ | Controlled/audited |
| Clinical notes | Authorized | Nursing-only if approved | ❌ | ❌ as clinical author |
| Vitals/observations | View | Create/update if approved | ❌ | Controlled/audited |
| View appointments | ✅ | ✅ | ✅ | ✅ operational |
| Create appointments | Limited/permission | Limited/permission | ✅ | Controlled |
| Reschedule appointments | Limited/permission | Limited/permission | ✅ | Controlled |
| Cancel appointments | Limited/permission | Limited/permission | ✅ | Controlled |
| Check-in | Limited | ✅ | ✅ | Controlled |
| Walk-in support | Limited | ✅ | ✅ | Controlled |
| View visit history | ✅ | ✅ | Limited | Controlled |
| User management | ❌ | ❌ | ❌ | ✅ |
| Role management | ❌ | ❌ | ❌ | ✅ |
| Permission management | ❌ | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | ❌ | ✅ |
| System settings | ❌ | ❌ | ❌ | ✅ |

**Important:** “Controlled” means the function may exist for technical/administrative reasons but must not automatically expose unrestricted clinical access.

---

# 8. Role-Specific UX Rules

## 8.1 Dashboard cards must have meaning

Do not show identical statistics to every role. Each dashboard should reflect the user's actual work.

- Doctor → clinical workload
- Nurse → patient support/work queue
- Receptionist → arrivals and scheduling
- Admin → users, security, and system activity

## 8.2 Navigation should be role-aware

The sidebar should prioritize the user's job.

A receptionist should not have **System Settings** sitting beside **Appointments**. A doctor should not have **User Management** as a primary navigation item.

## 8.3 Patient context must be obvious

Whenever clinical or appointment information is displayed, show enough patient identity to reduce wrong-patient actions.

Recommended patient header:

```text
[Patient Name]
Patient ID: OCR-000123   |   DOB/Age: ...   |   Status: Active
```

## 8.4 Protect sensitive information through progressive disclosure

Show users the information necessary for their task, not everything the database contains.

This is especially important for the receptionist workflow.

## 8.5 Destructive actions require confirmation

Examples:

- Cancel appointment
- Deactivate user
- Change important permissions
- Other approved destructive operations

Cancellation should not mean deletion of historical appointment data.

## 8.6 Empty states should guide the user

Examples:

- “No appointments scheduled for today.”
- “No patient records match your search.”
- “No recent audit activity.”

Avoid empty screens with no explanation or next action.

## 8.7 Errors should be role-appropriate

Errors should explain what happened and what the user can do next without exposing technical details or protected information.

---

# 9. Login and Authorization Flow

The expected flow is:

```text
Login
  ↓
Authenticate credentials
  ↓
Load user + role + permissions
  ↓
Create authenticated session/token
  ↓
Load role-specific dashboard
  ↓
Apply navigation permissions
  ↓
Enforce permissions on every protected backend operation
```

### Example

```text
Receptionist logs in
        ↓
Front Desk Dashboard
        ↓
Patients / Registration / Appointments / Check-in
```

```text
Doctor logs in
        ↓
Clinical Dashboard
        ↓
Patients / Chart / Medical Records / Appointments
```

```text
Nurse logs in
        ↓
Nursing Dashboard
        ↓
Patients / Chart / Appointments / Clinical Support
```

```text
Administrator logs in
        ↓
Administration Dashboard
        ↓
Users / Roles / Audit / Settings
```

---

# 10. Backend Authorization Requirements

Role-based UI must be backed by server-side authorization.

The backend should evaluate:

```text
Authenticated user
      ↓
Assigned role(s)
      ↓
Permission
      ↓
Requested resource/action
      ↓
Allow or deny
```

### Example

A receptionist may see a patient's name and appointment information, but a request to retrieve protected clinical notes should be rejected even if the frontend route is manually entered.

Similarly, a doctor who attempts to create a system user should receive an authorization failure.

Recommended HTTP behavior:

- `401 Unauthorized` → not authenticated
- `403 Forbidden` → authenticated but not permitted
- Validation errors → clear field/business-rule feedback

---

# 11. Recommended Screen Inventory

| Screen | Doctor | Nurse | Receptionist | Admin |
|---|:---:|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Patient Search/List | ✅ | ✅ | ✅ | Controlled |
| Patient Registration | — | — | ✅ | Controlled |
| Patient Profile | ✅ | ✅ | ✅ limited | Controlled |
| Medical Chart | ✅ | ✅ | Limited | Controlled |
| Medical Records | ✅ | ✅ limited | ❌ | Controlled/audited |
| Appointments | ✅ | ✅ | ✅ | ✅ operational |
| Appointment Details | ✅ | ✅ | ✅ | ✅ |
| Check-in | Limited | ✅ | ✅ | Controlled |
| Walk-in | Limited | ✅ | ✅ | Controlled |
| User Management | ❌ | ❌ | ❌ | ✅ |
| Roles & Permissions | ❌ | ❌ | ❌ | ✅ |
| Audit Logs | ❌ | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ✅ |

---

# 12. What This Means for the Three Core Modules

The four roles should interact differently with the same three core product areas.

## Patient Management

```text
Receptionist → Create / search / maintain front-desk information
Nurse       → Search / view / permitted clinical support
Doctor      → Search / view / clinical context
Admin       → Controlled operational access / administration
```

## Patient Chart

```text
Receptionist → Minimal approved patient context
Nurse       → Clinical-support information + permitted updates
Doctor      → Full authorized clinical/chart workspace
Admin       → Controlled technical access, audited
```

## Appointment Management

```text
Receptionist → Primary scheduling + check-in
Nurse       → View + support check-in/visit workflow
Doctor      → View schedule + patient context
Admin       → Operational oversight / controlled management
```

This keeps the product centered on the same patient record while avoiding four completely separate systems.

---

# 13. Scope Discipline

The role system must not become an excuse to expand the internship MVP.

The following remain outside the committed MVP unless separately approved:

- Full diagnosis management
- Prescription management
- Laboratory
- Pharmacy
- Billing
- Insurance
- Radiology
- Patient portal
- Mobile application
- Advanced analytics
- AI clinical decision support
- FHIR/international interoperability implementation
- Large enterprise scheduling

A new role or permission should only be added when it supports an approved product requirement.

---

# 14. Decisions Required Before Implementation

The following items should be resolved before the permission matrix is considered final:

1. Confirm whether **System Administrator** is officially part of the internship MVP.
2. Confirm exactly which role can create/update allergies.
3. Confirm exactly which role can create/update medication/history information.
4. Confirm whether basic vitals/observations are in the MVP.
5. Confirm whether doctors can modify appointments or are primarily consumers of appointment information.
6. Confirm whether No-show is required in the first release.
7. Confirm the deceased-patient policy and permissions.
8. Define the final permission names used by the backend.
9. Align the SRS, clinical-domain rules, ERD, API authorization design, and UI navigation with the final decision.

---

# 15. Implementation Principle

The product should feel like **one EMR with four professional workspaces**, not four separate applications.

```text
                    OPEN CLINICAL RECORD
                            │
              Authentication + Authorization
                            │
        ┌───────────┬───────┴───────┬───────────┐
        ↓           ↓               ↓           ↓
     Doctor       Nurse        Receptionist     Admin
        │           │               │           │
   Clinical      Clinical        Front Desk   System
   Workspace     Support         Workspace   Workspace
        │           │               │           │
        └───────────┴───────┬───────┴───────────┘
                            ↓
                   Shared Patient Record
                            │
          ┌─────────────────┼─────────────────┐
          ↓                 ↓                 ↓
   Patient Management   Patient Chart   Appointments
```

The user's role changes the **workspace and permissions**, but the patient remains the central record connecting the system.

---

## Document Maintenance

When a role or permission changes, update the related artifacts together:

1. This role-based system guide
2. SRS
3. Clinical domain rules
4. Authorization/permission design
5. UI navigation and wireframes
6. API requirements
7. ERD/data model if the permission change affects stored data
8. Test cases

This prevents the UI, backend, documentation, and database design from drifting apart.
