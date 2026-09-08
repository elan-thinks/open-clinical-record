# Open Clinical Record

**Open Clinical Record (OCR)** is a focused outpatient EMR internship project built around three core workflows:

1. **Patient Management**
2. **Patient Chart**
3. **Appointment Management**

The MVP is intentionally limited to functionality that can realistically be implemented, tested, and demonstrated within the remaining one-month internship period.

## Project Direction

The patient is the central record connecting the three MVP areas:

```text
Patient Management
       ↓
Patient Chart
       ↓
Appointment Management
       ↓
Check-in / Visit History
```

The project is not attempting to build a complete hospital EMR during the internship. Additional capabilities may be considered only after the core MVP is working and only if sufficient time remains.

### Application Roles

The MVP uses **exactly three application roles**:

- Receptionist / Front Desk
- Nurse / Clinical Staff
- Clinician / Doctor

Authentication, authorization, validation, error handling, and basic audit logging are cross-cutting concerns, not additional business roles or modules.

## MVP Modules

### 1. Patient Management

- Register patients
- Assign unique patient identifiers
- Search patients
- View patient profiles
- Update permitted demographic/contact information
- Maintain basic patient status
- Detect likely duplicate patient records

### 2. Patient Chart

- View patient demographics and status
- Record and view allergies
- Record and view relevant medication/history information
- Record and view important patient alerts where required
- View appointment and visit/check-in history

The chart is intentionally basic. Full clinical encounter documentation is outside the committed MVP.

### 3. Appointment Management

- Create appointments for existing patients
- View appointments
- Reschedule appointments
- Cancel appointments
- Maintain appointment status/history
- Check in patients
- Support a basic walk-in path without fabricating an appointment

## Technology Direction

- **Frontend:** React
- **Backend:** .NET / ASP.NET Core
- **API:** RESTful HTTP API
- **Database:** To be selected during database design and implementation

The implementation is database-independent at the design stage. International healthcare standards and FHIR integration are **not required for the internship MVP**.

## Deferred / Future Work

The following are outside the committed MVP and may be considered later:

- Full clinical encounter documentation
- Diagnosis and treatment documentation
- Prescription management
- Medical report generation and advanced document lifecycle
- Laboratory, pharmacy, billing, insurance, and radiology
- Patient portal/mobile application
- SMS and external integrations
- FHIR or other international-standard integrations
- Advanced analytics and enterprise scheduling
- AI clinical decision support

## Documentation

The `docs/` directory separates engineering documentation from formal documents:

- `00-project/` — project identity, scope, objectives, glossary
- `01-research/` — EMR and domain research
- `02-discovery/` — clinical workflows and stakeholder discovery
- `03-requirements/` — requirements, NFRs, traceability, and formal SRS
- `04-architecture/` — architecture overview and ADRs
- `05-data/` — data model, ERD, and data dictionary
- `06-ux/` — user flows and wireframes
- `07-api/` — API design
- `08-security/` — security and audit design
- `09-testing/` — testing strategy and test plans
- `10-release/` — deployment and release documentation

## Development Approach

```text
Research → Discovery → Requirements → Architecture → Data Model
→ UX → Implementation → Testing → Release
```

The current priority is to baseline the three approved MVP modules before implementation expands into optional functionality.

## Status

**Current phase: Requirements and architecture baseline → Database design**

The project scope, SRS, and architecture have been revised to match the mentor-approved one-month MVP. The ERD/data model is the next major baseline deliverable.

## License

License will be selected as part of project governance and release planning.
