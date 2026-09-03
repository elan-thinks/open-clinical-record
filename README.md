# Open Clinical Record

**Open Clinical Record** is an extensible Electronic Medical Record (EMR) platform designed around three core clinical workflows: **patient/medical chart management, medical records and reports, and appointments**.

The project is being developed as a professional software-engineering internship project, with an emphasis on maintainability, security, interoperability, clinical usability, and future expansion.

## Project Direction

The initial system will focus on a practical MVP while preserving a foundation for future modules such as laboratory, pharmacy, referrals, billing, immunization, patient portals, notifications, and interoperability.

### Primary users
- Clinicians and clinical staff
- Reception and administrative staff
- System administrators

### Primary clinical areas
1. Patient / Medical Chart
2. Medical Records / Clinical Reports
3. Appointments / Visits / Consultation workflow

### Design principles
- Patient safety and data integrity first
- Role-based access and auditability
- Modular and extensible architecture
- API-ready and interoperability-aware design
- Clear separation of clinical, application, and data concerns
- MVP-first implementation with future expansion in mind

## Research Basis

The project research considers established EMR platforms and digital-health standards, including Oracle Health, OpenMRS, Epic, WHO digital-health guidance, HL7 FHIR, and relevant clinical terminology/interoperability standards. Clinical requirements will be validated with healthcare professionals before final requirements are baselined.

## Documentation

The `docs/` directory separates living engineering documentation from formal documents.

- `00-project/` — project identity, scope, objectives, glossary
- `01-research/` — EMR landscape and standards research
- `02-discovery/` — clinical workflows and stakeholder discovery
- `03-requirements/` — requirements and formal SRS
- `04-architecture/` — architecture decisions and diagrams
- `05-data/` — data model, ERD and data dictionary
- `06-ux/` — user flows and wireframes
- `07-api/` — API design
- `08-security/` — security, permissions and audit logging
- `09-testing/` — testing strategy and test plans
- `10-release/` — deployment and release documentation

Formal documents such as the SRS and architecture document will use LaTeX and be compiled to PDF where appropriate. GitHub-native and frequently changing engineering notes will remain in Markdown.

## Development Approach

The project follows an evidence-driven workflow:

**Research → Clinical Discovery → Requirements → Architecture → Data Model → UX → Implementation → Testing → Release**

Requirements will not be finalized before research and clinical validation are completed.

## Status

**Current phase: Discovery and EMR research**

The repository is intentionally starting with project and research documentation before implementation. This keeps architectural and clinical decisions traceable instead of prematurely locking the design.

## License

License will be selected as part of the project governance and release planning.
