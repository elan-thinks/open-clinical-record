# Patient Chart Research

Status: Discovery
Date: 2026-09-03

## Why this document exists

The patient chart is the center of the Open Clinical Record workflow. This research separates what established systems actually do from what we should implement in the internship MVP.

## Findings from established systems

### Oracle Health

Oracle Health describes the patient panel as a static part of the patient chart containing both demographic and encounter-specific information. Its documented fields include patient name, pronouns, age, administrative sex, date of birth, deceased date when applicable, allergies, weight, BMI, chief complaint, reason for visit, PCP, care-team information, encounter type, location, visit provider, visit date/time, visit number, advance-care information and MRNs.

Oracle also provides a patient-chart notifications banner. Notifications are ordered by severity (alert, warning, informational). Its life timeline can display clinical information over selectable time periods and allow a user to inspect a specific visit.

### OpenMRS

OpenMRS uses a patient dashboard to bring together patient information and clinical activity. Its documented dashboard includes allergies, a problem list, relationships, treatment regimens, and a Visits/Encounters area. Visits can group encounters.

### HL7 FHIR

FHIR's Patient resource is primarily about the administrative and demographic identity of the person receiving care. It is referenced by many clinical resources, including Appointment, Encounter, AllergyIntolerance, Condition, DocumentReference, Observation, MedicationRequest and AuditEvent. This is useful because the patient is the common subject connecting the rest of the clinical model.

## Design lessons

### 1. Patient profile is not enough

A simple CRUD profile containing name, age and phone number is not a sufficient clinical chart. The chart needs a compact summary of information that affects the current interaction.

### 2. Separate stable identity from clinical activity

Patient identity/demographics should not be mixed with appointment, encounter or note data. Those records have their own lifecycles and history but reference the patient.

### 3. Make important information visible early

The MVP should provide a patient summary/header containing, at minimum:

- Patient name
- Medical record number (MRN)
- Date of birth / age
- Sex or other locally required demographic field
- Contact information
- Patient status
- Allergy/critical-alert indicator
- Date of death when applicable
- Current/next appointment information when applicable

The exact demographic fields must be validated with the clinical stakeholder before implementation.

### 4. Allergies and problems are clinically different from ordinary notes

Allergies and ongoing problems should have structured records rather than being buried in free text. Oracle displays allergy status prominently, and OpenMRS provides a dedicated problem list.

For the internship MVP, we should keep these structures intentionally small rather than attempting a complete enterprise terminology engine.

### 5. Patient death is a controlled lifecycle state

A deceased flag should not be implemented as an arbitrary note. Oracle records deceased status and optional date of death; saving that state can cancel future appointments and show a deceased badge. The Open Clinical Record equivalent should preserve the patient's historical records while preventing inappropriate future workflow.

### 6. Timeline is useful, but should remain simple

Oracle has a Life timeline that lets users move across time periods and inspect visits. This supports a smaller MVP idea: a patient timeline containing major events such as appointments, visits/encounters, diagnoses, notes/reports and important status changes.

The timeline should be an aggregation/view, not a second source of truth.

### 7. "Needs Attention" is a workflow concept

Oracle provides a Needs Attention panel for items that require action. This is useful inspiration for a small MVP feature: surface unfinished documentation, overdue actions or other explicitly defined workflow items. It should not become an automated diagnostic or treatment recommendation system.

## Proposed MVP patient chart

```text
Patient Chart
│
├── Patient Summary
│   ├── Identity / demographics
│   ├── MRN
│   ├── Status
│   ├── Allergies / alerts
│   └── Current appointment / visit context
│
├── Clinical Context
│   ├── Problems / history
│   └── Basic medications if required by scope
│
├── Activity
│   ├── Appointments
│   ├── Visits / encounters
│   ├── Clinical notes
│   └── Medical reports / documents
│
└── Timeline
    └── Important patient events
```

## Adopt / Simplify / Innovate / Future

| Classification | Decision |
|---|---|
| Adopt | Patient-centered chart, MRN, allergies/alerts, structured problems, patient status, appointment/encounter context |
| Simplify | Demographics, care team, history, timeline and notifications; implement only what the target clinic actually needs |
| Innovate | A lightweight patient timeline plus a focused Needs Attention panel for unfinished workflow items |
| Future | Full terminology service, advanced risk scores, comprehensive care plans, patient portal, AI-assisted documentation, external health-information exchange |

## Important caution

Oracle Health and OpenMRS are reference systems, not requirements for Open Clinical Record. Their feature sets are much larger than this internship project. We should copy useful concepts, not reproduce enterprise complexity.

## Questions for the clinician / mentor

1. What fields must appear immediately when a clinician opens a patient chart?
2. Which allergies/alerts must be visible at the top?
3. Which patient statuses are actually used in the target workflow?
4. What information must be recorded when a patient is marked deceased?
5. Who is allowed to mark a patient deceased or change that status?
6. Which problems/history items should be structured?
7. What should appear in the patient timeline?
8. What information should be visible from the patient chart without opening another page?
9. Which unfinished tasks should count as "Needs Attention"?
10. Are there local identifiers or demographic fields that are required but absent from generic EMR examples?

## References

- Oracle Health EHR — Patient Panel: https://docs.oracle.com/en/industries/health/oracle-health-ehr/ehrfg/introduction2.html
- Oracle Health EHR — Patient Visit: https://docs.oracle.com/en/industries/health/oracle-health-ehr/ehrug/patient-visit.html
- Oracle Health EHR — Life Timeline: https://docs.oracle.com/en/industries/health/oracle-health-ehr/ehrfg/navigate-life-timeline.html
- Oracle Health — Document Deceased Patients: https://docs.oracle.com/en/industries/health/health-patient-administration/health-patient-admin-userguide/document-deceased-patients.html
- OpenMRS — Patient Dashboard In Depth: https://openmrs.atlassian.net/wiki/spaces/docs/pages/518390279/The%2BPatient%2BDashboard%2BIn%2BDepth
- HL7 FHIR R4 — Patient: https://hl7.org/fhir/R4/patient.html
- WHO — SMART Guidelines: https://www.who.int/teams/digital-health-and-innovation/smart-guidelines
