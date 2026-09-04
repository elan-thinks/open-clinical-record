# Clinical Documentation Research

**Date:** 2026-09-04  
**Status:** Discovery research — not yet a final requirement

## Why this matters

The medical-record part of an EMR is not simply a large text box attached to a patient. Established systems treat clinical documentation as structured, contextual, authored information with a lifecycle. The design of Open Clinical Record should reflect that without attempting to reproduce the complexity of an enterprise EHR.

## Research question

How do established EMR systems represent clinical notes, reports and documents, and what should Open Clinical Record adopt for its MVP?

## Findings

### 1. Documentation belongs to a clinical context

Oracle Health allows a note to be created for a patient's visit. Templates can bring existing chart information into the note, including allergies, chief complaint, diagnosis, medications, measurements, orders, problems and vital signs.

This means a clinical note is not an isolated text record. It has a relationship to the patient and normally to the care episode/visit or encounter that produced it.

### 2. A document has an author and timestamps

Epic's FHIR documentation exposes clinical-note metadata including the patient, author, creation time, note type and associated encounter. The document metadata is separate from the actual document content.

For Open Clinical Record, at minimum a clinical document should be able to answer:

- Who created it?
- Which patient does it belong to?
- Which visit/encounter does it belong to, when applicable?
- What type of document is it?
- When was it created?
- What is its current state?
- Who finalized/signed it?
- When was it finalized/signed?

### 3. Draft and final documentation are different states

Oracle automatically saves a newly created note as **In Progress**. The note can later be signed, after which Oracle describes it as completed. Oracle also supports editing documents and then signing the updated version.

Epic's FHIR representation provides a more explicit document-status vocabulary: **preliminary**, **final**, **amended**, and **entered-in-error**.

We should therefore avoid a simplistic design such as:

```text
medical_record(id, patient_id, text)
```

A better conceptual model is:

```text
ClinicalDocument
├── patient
├── encounter/visit (optional depending on document)
├── type
├── author
├── created_at
├── status
├── content
├── signed_by (when finalized)
└── signed_at (when finalized)
```

### 4. Finalization is an important integrity boundary

A clinical note that has been finalized should not behave like an ordinary editable comment. The system needs a controlled way to handle later changes.

The exact amendment/correction workflow needs clinical stakeholder validation. For the internship MVP, the safest design direction is to preserve the original finalized record and record an authorized amendment/correction rather than silently overwriting historical clinical information.

This is a design recommendation for Open Clinical Record, not a claim that every EMR uses exactly this implementation.

### 5. Documents and document content can be separated

Epic's FHIR documentation shows an important interoperability pattern: `DocumentReference` describes the document and its metadata, while the actual content can be provided through a referenced `Binary` resource.

This suggests a useful future-ready boundary:

```text
ClinicalDocument
      │
      ├── metadata
      │     ├── patient
      │     ├── author
      │     ├── type
      │     ├── status
      │     └── encounter
      │
      └── content
            ├── structured clinical data
            └── document/file content
```

For the MVP, we do not need to build a sophisticated document-management platform. We should simply avoid coupling every future document type to one giant text column.

### 6. Templates are useful, but templates should not become the whole clinical model

Oracle uses templates to help create notes and can populate them with chart information. This is valuable because clinicians should not repeatedly type information that already exists in the patient's chart.

For Open Clinical Record, a small set of practical note/report templates may be useful. However, reusable templates should generate documentation from structured patient/encounter data rather than duplicating the same information as uncontrolled text everywhere.

### 7. Notes can contain both structured and narrative information

The research shows two complementary forms of clinical information:

- **Structured data:** diagnosis, vital signs, measurements, allergies, medications, problems, dates, statuses.
- **Narrative documentation:** assessment, clinical reasoning, progress notes, summaries and other prose.

The MVP should support both. Structured fields should be used where the information has predictable meaning; narrative text should be used where clinicians need flexible documentation.

## Proposed MVP documentation model

The current recommendation is to support a small, clear set of clinical documentation types rather than trying to model every possible hospital document.

### Core document types to investigate with the clinician

- Consultation / clinical note
- Progress note
- Diagnosis documentation
- Treatment / plan note
- Medical report / summary
- Referral or other supporting report if the clinical stakeholder says it is necessary

These are candidates, not final requirements.

### Proposed lifecycle

```text
Draft / In Progress
        │
        ↓
     Signed / Final
        │
        ├── Amendment
        │      ↓
        │   Amended version
        │
        └── Correction / entered-in-error handling
```

The exact terminology displayed to users should be chosen after stakeholder validation.

## What we should NOT build yet

- Full enterprise document management
- Complex legal-signature infrastructure
- Voice transcription
- AI-generated clinical notes
- Advanced scanned-document ingestion
- Full CDA/CCDA document exchange
- Complete FHIR DocumentReference API
- A huge template authoring engine

These can remain future directions unless the project scope changes.

## Design decisions to carry forward

### Adopt

- Patient-linked clinical documentation
- Encounter/visit context where applicable
- Author and timestamps
- Document type
- Explicit lifecycle state
- Signing/finalization concept
- Preservation of historical finalized information
- Separation between document metadata and content as a future-ready concept

### Simplify

- Small set of document types
- Simple template support
- Basic version/amendment handling
- Simple document storage for the MVP

### Future

- Full document repository
- Binary/file storage service
- Advanced amendment/correction workflows
- FHIR DocumentReference/Binary integration
- External document exchange

### Innovate

- A patient timeline that makes clinical documents easy to find in chronological context
- A focused "Needs Attention" list for unfinished documentation and other clinician tasks

## Open questions for clinical validation

1. What exact notes/reports does the clinician create most often?
2. Which information is entered as structured fields versus narrative text?
3. Which documents require a signature?
4. Can a finalized document be edited directly, or must an amendment/correction be created?
5. Who may create, sign, amend, correct or view each document type?
6. Which documents should be visible to the patient in a future patient portal?
7. Are attachments/scanned reports needed in the first release?
8. What information must appear automatically in a consultation note?

## Sources

- Oracle Health EHR User Guide — Documents
- Oracle Health EHR User Guide — Create a Note
- Oracle Health EHR User Guide — Sign a Document
- Oracle Health EHR User Guide — Edit a Document
- Epic on FHIR — Clinical Notes / DocumentReference APIs
- HL7 FHIR R4 — DocumentReference
- OpenMRS O3 Patient Chart documentation

## Bottom line

The medical-record module should be designed as **clinical documentation connected to the patient's care journey**, not as a generic CRUD notes table. The MVP should be small, but its data model should preserve authorship, context, status and history so that more advanced clinical documentation can be added later without redesigning the foundation.
