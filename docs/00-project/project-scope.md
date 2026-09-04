# Project Scope

> Keep the first version small enough to finish, but don't paint the system into a corner.

## What we're building

Open Clinical Record is an EMR foundation for a clinic. The first version is centered on three things that are easy to understand from a real clinical workflow:

- the patient's chart
- the patient's medical records and reports
- appointments and the visit/consultation flow

Authentication, roles, audit history, validation, and notifications sit around those workflows because a clinical system needs them to be trustworthy.

## Users and Roles

The MVP is intentionally limited to four operational roles. The goal is to implement clear permissions and realistic workflows rather than create many roles simply to make the system look larger.

### 1. Clinician / Doctor

Primary clinical user. Can, according to assigned permissions:

- Search and open patient charts
- Review demographics, history, allergies, alerts, appointments and timeline
- Start/view encounters
- Record clinical notes
- Record diagnoses
- Record treatment/medication information within the agreed scope
- Create and finalize/sign clinical documentation where authorized
- Review the patient's longitudinal clinical record

### 2. Nurse / Clinical Staff

Clinical support user. Can, according to assigned permissions:

- Search and view patient charts
- View appointments and patient status
- Participate in check-in/arrival and encounter workflow
- Record vital signs and appropriate clinical observations
- View relevant clinical documentation
- Add clinical information permitted by the workflow

Nurse/clinical-staff permissions must not automatically be identical to clinician permissions, especially for diagnosis, finalization and other controlled clinical actions.

### 3. Receptionist / Front Desk

Patient-registration and scheduling user. Can, according to assigned permissions:

- Register patients
- Search patients
- Maintain basic demographic/contact information
- Create appointments
- Reschedule appointments
- Cancel appointments and record reasons
- Check patients in
- Mark appropriate appointment states such as no-show
- View the scheduling information needed for front-desk work

Reception/front-desk access should not provide unrestricted editing of clinical notes, diagnoses or finalized medical reports.

### 4. System Administrator

Technical/system-management user. Can, according to assigned permissions:

- Manage user accounts
- Assign/manage roles and permissions
- Activate/deactivate accounts
- Perform basic system configuration
- Review audit logs and important system activity

System-administrator status does not automatically mean unrestricted clinical authority. Clinical access should remain controlled by the authorization model and organizational policy.

## Users Not Included in the MVP

The following are recognized as valid EMR stakeholders or future users, but are deliberately outside the initial implementation unless clinical discovery shows a clear requirement:

- Patient / Patient Portal user
- Pharmacist
- Laboratory staff
- Radiology staff
- Billing/finance staff
- Hospital/clinic management
- Referral/coordinating staff
- Other specialist or department-specific roles

The patient remains a core subject of the EMR even though a patient-facing login/portal is not part of the MVP.

## MVP

### Patient / Medical Chart

- Register and search patients
- View a patient profile and clinical summary
- Demographics and contact information
- Allergies and important alerts
- Medical history / current problems
- Basic patient status
- Deceased status and date of death where clinically required
- Patient timeline

### Medical Records / Reports

- Create a clinical record for a visit
- Record structured clinical information where useful
- Add clinical notes
- Record diagnoses
- Record treatment/medication information within the agreed scope
- Produce a readable medical report
- Distinguish editable/in-progress documentation from finalized documentation
- Preserve historical records instead of silently overwriting them

### Appointments

- Create and manage appointments
- Assign patient and clinician
- Appointment status
- Reschedule and cancel
- Handle the basic check-in → visit/encounter flow
- Link an appointment/visit to the resulting clinical record

### Cross-cutting

- Authentication
- Role-based authorization
- Audit logging for important actions
- Input validation
- Error handling
- Basic notifications/alerts where useful

## Not in the MVP

These are intentionally left out unless discovery shows that they are necessary:

- Full laboratory information system
- Pharmacy management
- Billing and insurance claims
- Radiology/PACS
- Advanced reporting and analytics
- Patient mobile application/portal
- SMS gateway integration
- External hospital-to-hospital exchange
- Full FHIR implementation
- Complex enterprise scheduling/resource optimization
- Multi-resource booking and advanced recurring scheduling
- Full terminology service

They are not forgotten. They belong in the expansion plan so that we can design sensible boundaries now without trying to build a hospital information system during an internship.

## Future direction

The long-term idea is that a patient should have one longitudinal record while separate modules can grow around it:

```text
                         Open Clinical Record
                                  |
             +--------------------+--------------------+
             |                    |                    |
          Patient             Encounters          Appointments
             |                    |                    |
             |          +---------+---------+          |
          History    Notes    Diagnosis  Treatment    |
             |                                             |
             +--------------------+------------------------+
                                  |
                           Integration API
                                  |
       +--------------------------+----------------------------+
       |              |            |            |               |
     Lab          Pharmacy     Referrals    Radiology       Patient Portal
```

Future role/module expansion may include patient self-service, pharmacy, laboratory, radiology, referrals, billing, management/reporting, and external interoperability. These should be added as separate bounded capabilities rather than tightly coupling everything to the initial three workflows.

The API/integration boundary is a design concern from the beginning, even if external integrations are not implemented in the internship MVP.

## Scope rule

When a feature sounds impressive but does not improve the core patient → appointment → visit → record workflow, it goes into **Future** until there is a clear reason to bring it back.

## Clinical Validation Before SRS Freeze

The role list and permissions are a working proposal, not a substitute for clinical validation. Before the SRS is finalized, confirm with the mentor/clinical stakeholder:

- Which staff roles actually use the target workflow?
- Whether Nurse and Clinician should be separate roles in the MVP
- Which actions each role may perform
- Who can create, reschedule and cancel appointments
- Who can check in patients
- Who can create, edit, finalize and amend clinical documentation
- Who can record deceased status
- Whether administrators should have any clinical-data access
