# Research Log

This is the living record of EMR research. Each entry should capture what was investigated, what was learned, and how the finding may affect Open Clinical Record.

## Entry Template

### [YYYY-MM-DD] Topic

**Sources:**

**Question:**

**Findings:**

**Implication for Open Clinical Record:**

**Classification:** Adopt / Simplify / Innovate / Future / Reject

**Open questions:**

## 2026-09-03 — Patient Chart, Visits, Encounters and Clinical Documentation

**Sources:**

- Oracle Health EHR User Guide — Patient Panel
- Oracle Health EHR User Guide — Create a Note
- Oracle Health Patient Administration — Document Deceased Patients
- Oracle Health EHR User Guide — View Visit or Appointment
- OpenMRS Patient Dashboard documentation
- OpenMRS Visit configuration documentation
- Epic on FHIR / Epic interoperability documentation
- HL7 FHIR Appointment, Encounter and DocumentReference resources
- WHO Digital Health Platform Handbook and SMART Guidelines

**Question:**

How do established EMR platforms connect the patient chart, appointments, visits/encounters and clinical documentation, and what should we carry into the Open Clinical Record foundation?

**Findings:**

1. **The patient chart is a clinical workspace, not just a demographic profile.** Oracle's patient panel brings together identity/demographics, appointment state, allergies, weight/BMI, chief complaint, reason for visit, care-team information and visit details. OpenMRS similarly uses a patient dashboard as the place to view/edit a patient record and access visits and encounters.

2. **Appointment and encounter are different concepts.** Epic explicitly distinguishes them: an Appointment represents scheduled care, while an Encounter represents the setting where care actually takes place. Oracle also exposes visits and appointments separately, while OpenMRS groups encounters under visits when the Visit feature is enabled.

3. **The workflow should connect scheduling to actual care.** A useful conceptual flow is:

   Patient → Appointment → Check-in/Arrival → Visit/Encounter → Clinical Documentation → Finalized Record

   This is a workflow model, not a claim that every EMR implements the exact same screens or status names.

4. **A visit can contain multiple encounters.** OpenMRS groups encounters into visits, and Oracle allows multiple appointments to be associated with a visit. This matters for the data model: we should not assume one appointment equals one clinical record.

5. **Clinical notes are part of the patient's longitudinal record.** Oracle notes can use chart information such as allergies, chief complaint, diagnosis, medications, measurements, orders, problems and vital signs. Notes can remain In Progress and later be signed. Epic also exposes clinical-note creation through FHIR DocumentReference.

6. **Documents need lifecycle/state, not just a text field.** HL7 FHIR DocumentReference distinguishes document metadata and status, including states such as preliminary, final, amended, corrected and entered-in-error. The actual document content may be stored inline or referenced externally.

7. **Patient death is a lifecycle event with workflow consequences.** Oracle documents deceased status and optional date of death; after saving, future appointments are cancelled and a deceased badge is shown in the patient panel. This supports treating deceased status as controlled patient lifecycle data rather than an ordinary free-text note.

8. **Interoperability should influence the internal model early, without forcing a full FHIR implementation into the MVP.** FHIR provides standard resources that map naturally to the core domain: Patient, Appointment, Encounter and DocumentReference. Epic publicly supports FHIR APIs, and WHO guidance emphasizes standards-based, interoperable digital-health architecture.

9. **Architecture should be driven by requirements and context.** WHO describes architecture as the foundation/blueprint for how processes, data, systems and technology fit together. WHO's SMART Guidelines emphasize standards-based, machine-readable, adaptive, requirements-based and testable digital health components.

**Implication for Open Clinical Record:**

The first version should model the clinical workflow explicitly rather than building three unrelated CRUD modules. The patient chart should act as the main clinical context, with appointments and encounters connected to it and clinical documentation linked to the relevant encounter/visit. The database should preserve historical records and support document lifecycle states. Deceased status should be a controlled patient-state feature that can affect future scheduling. The application architecture should leave a clean API/integration boundary so FHIR mapping can be added later.

**Classification:**

- **Adopt:** Patient-centered chart, appointment/encounter separation, clinical documentation lifecycle, deceased status, audit-friendly history, API-ready domain boundaries.
- **Simplify:** Full enterprise scheduling, complex encounter types, advanced document repositories, comprehensive terminology services.
- **Future:** Full FHIR API, laboratory/pharmacy/radiology integrations, patient portal, external health-information exchange.
- **Innovate:** A simple patient timeline and "Needs Attention" view that connects important clinical and workflow events without trying to reproduce a large enterprise EMR.

**Open questions:**

- Which exact appointment statuses and visit/encounter statuses do clinicians in the target environment actually use?
- What information must be captured when a patient is marked deceased, and who is authorized to record it?
- Which clinical note/report types are required for the MVP?
- Should finalized clinical documentation be immutable, or can authorized users amend/correct it through a versioned workflow?
- Which terminology/coding systems are realistic for the internship MVP?
- What should be stored directly in the database versus represented as a document/file reference?

## Initial Research Areas

- Oracle Health patient chart and clinical documentation
- OpenMRS patient, visit, encounter, and modular architecture
- Epic clinical workflow and interoperability
- WHO digital-health architecture and implementation guidance
- HL7 FHIR resources and interoperability concepts
- Clinical terminology and coding requirements
- Patient lifecycle and deceased status
- Appointment-to-visit-to-record workflow
- Auditability, permissions, and clinical documentation integrity
