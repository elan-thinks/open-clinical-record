# Project Scope

> Keep the first version small enough to finish, but don't paint the system into a corner.

## What we're building

Open Clinical Record is an EMR foundation for a clinic. The first version is centered on three things that are easy to understand from a real clinical workflow:

- the patient's chart
- the patient's medical records and reports
- appointments and the visit/consultation flow

Authentication, roles, audit history, validation, and notifications sit around those workflows because a clinical system needs them to be trustworthy.

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
             |          |         |         |          |
          History    Notes    Diagnosis  Treatment    |
             |                                             |
             +--------------------+------------------------+
                                  |
                           Integration API
                                  |
                  +---------------+---------------+
                  |               |               |
                Lab           Pharmacy        Referrals
```

The API/integration boundary is a design concern from the beginning, even if external integrations are not implemented in the internship MVP.

## Scope rule

When a feature sounds impressive but does not improve the core patient → appointment → visit → record workflow, it goes into **Future** until there is a clear reason to bring it back.
