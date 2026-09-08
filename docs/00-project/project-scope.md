# Project Scope

> Keep the first version small enough to finish within the remaining internship period.

## Project Purpose

Open Clinical Record (OCR) is a focused outpatient EMR internship project. The MVP is deliberately limited to three core business areas:

1. **Patient Management**
2. **Patient Chart**
3. **Appointment Management**

The goal is to deliver a usable, coherent patient-to-appointment workflow within the remaining one-month implementation period rather than attempting to build a full EMR platform.

## MVP Modules

### 1. Patient Management

The system shall support the basic lifecycle of a patient record:

- Register a new patient
- Assign a unique patient identifier
- Search for patients
- View patient profile and basic demographic/contact information
- Update permitted patient information
- Maintain basic patient status
- Handle duplicate/invalid patient information appropriately

### 2. Patient Chart

The patient chart shall provide a simple longitudinal view of relevant patient information:

- View patient demographics
- View patient status
- Record and view allergies
- Record and view relevant medication/history information
- Record and view important patient alerts where required
- View the patient's appointment/visit history
- Keep information associated with the correct patient

The chart is intended to provide useful patient context without attempting to implement the full clinical documentation capabilities of a hospital EMR.

### 3. Appointment Management

The appointment workflow shall support:

- Create an appointment for a patient
- View appointments
- Reschedule appointments
- Cancel appointments
- Maintain appointment status/history
- Check in a patient for an appointment
- Support a basic walk-in/unscheduled visit path where practical
- Prevent inappropriate appointment creation based on basic patient status rules

## Core Workflow

```text
Patient Registration
       ↓
Patient Search / Profile
       ↓
Patient Chart
       ↓
Create Appointment
       ↓
Appointment Management
       ↓
Check-in / Visit
       ↓
Patient's history is updated
```

The patient is the central record. Appointments and visit information are linked to the correct patient so that staff can understand the patient's history from the chart.

## Users and Roles

The MVP uses **exactly three application roles**:

### 1. Receptionist / Front Desk

Primary responsibilities:

- Register patients
- Search patients
- Maintain permitted demographic/contact information
- Create, view, reschedule, and cancel appointments
- Check in patients
- Support basic walk-in intake

### 2. Nurse / Clinical Staff

Primary responsibilities:

- Search and view patient information
- View patient charts relevant to care
- View appointments
- Support check-in/visit workflow
- Record permitted clinical/chart information such as allergies, medication history, alerts, or basic observations according to the approved permission matrix

### 3. Clinician / Doctor

Primary responsibilities:

- Search and view patient charts
- Review relevant patient history
- View appointments
- Review patient information needed for care
- Perform authorized clinical updates to the patient chart

Detailed permissions are subject to clinical/stakeholder confirmation. No additional application role is part of the MVP.

## Cross-Cutting Concerns

The following support the three modules but are not separate business modules:

- Authentication
- Role-based authorization
- Input validation
- Error handling
- Basic audit logging for important actions
- Basic protection of patient information

These should be implemented only to the level needed to make the internship MVP safe and usable.

## Explicitly Deferred

The following are **not part of the committed one-month MVP**. They may be considered only after the three core modules are working and there is enough remaining time:

- Full clinical encounter documentation
- Diagnosis and treatment documentation
- Prescription management
- Medical report generation and advanced document lifecycle
- Document amendments/versioning
- Laboratory management
- Pharmacy management
- Billing and insurance
- Radiology/PACS
- Patient portal/mobile application
- SMS gateway integration
- External hospital exchange
- FHIR implementation/integration
- Advanced analytics and reporting
- AI clinical decision support
- Complex enterprise scheduling
- Advanced terminology services

These features are intentionally deferred so they do not put the core internship deliverable at risk.

## Standards and Interoperability

International healthcare standards are **not an MVP requirement** for this internship project. The implementation may be designed cleanly enough for future extension, but FHIR or other standards-based integrations will not be pursued unless they are later established as necessary after the core functionality is complete.

## Scope Rule

During implementation, prioritize completion in this order:

1. Patient Management
2. Patient Chart
3. Appointment Management
4. Cross-cutting security/validation needed by the above
5. Testing and bug fixing
6. Optional future functionality only if the core MVP is complete

If a feature does not directly help complete these three core workflows, it should be deferred rather than added to the MVP.
