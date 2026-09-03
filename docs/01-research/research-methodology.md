# EMR Research Methodology

## Purpose

Research is being completed before requirements and architecture are finalized. The goal is to learn from established EMR products, open-source systems, digital-health guidance, and interoperability standards without copying any one product blindly.

## Primary References

- Oracle Health — enterprise EMR workflow reference
- OpenMRS — open-source, modular EMR/platform reference
- Epic — enterprise EMR and interoperability reference
- WHO — digital-health architecture and implementation guidance
- HL7 FHIR — interoperability and health-information exchange model
- Relevant clinical terminology standards where they affect the domain model

## Research Questions

### Patient / Medical Chart
- What information must be immediately visible to a clinician?
- How is longitudinal patient history organized?
- How are allergies, problems, medications, alerts, and patient status represented?
- How is deceased status handled while preserving historical records?

### Medical Records / Reports
- What types of clinical documentation are created?
- Which information is structured and which is narrative?
- How are drafts, signed/finalized records, corrections, and history handled?
- What information should appear in a patient timeline?

### Appointments
- How are appointments scheduled, rescheduled, cancelled, and completed?
- How are walk-ins and missed appointments represented?
- How does an appointment connect to a visit/encounter and clinical documentation?

### Architecture and Interoperability
- How do mature systems separate clinical workflows from infrastructure?
- Which modules should be independent?
- Where should API and integration boundaries exist?
- Which FHIR concepts are relevant to the selected MVP?

## Evidence Classification

Every significant finding should be classified as one of:

- **Adopt** — strong evidence and appropriate for the MVP.
- **Simplify** — useful concept, but too complex for the internship scope.
- **Innovate** — improvement justified by the project's goals and clinical feedback.
- **Future** — valuable but intentionally deferred.
- **Reject** — unsuitable for the project's context or scope.

## Research Output

The final research package should contain source notes, feature comparisons, architectural findings, clinical workflow findings, interoperability findings, open questions, and decisions that feed directly into requirements and architecture.
