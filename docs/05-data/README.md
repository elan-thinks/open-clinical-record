# Data Model

This directory contains the persistent data-model baseline for the Open Clinical Record MVP.

## Current MVP boundary

The data model supports exactly three business areas:

1. Patient Management
2. Patient Chart
3. Appointment Management

Cross-cutting data supports authentication/authorization and minimal auditability.

## ERD

The current MVP ERD is maintained at:

`docs/03-requirements/ER/OCR_MVP_ERD.html`

That ERD is the logical data-model baseline until the physical database design is selected.

## Core entities

- Patient
- User
- Allergy
- Medication History
- Patient Alert
- Appointment
- Appointment History Event
- Visit
- Audit Event

Optional entities such as vital signs/observations require explicit confirmation before being added to the MVP.

## Explicit exclusions

The MVP data model does not include implementation commitments for diagnosis, treatment/care plans, prescriptions, medical reports/documents, document amendments, laboratory, pharmacy, billing, insurance, radiology, patient portal, FHIR/international-standard integration, enterprise scheduling, or AI clinical decision support.

## Design principle

Keep the model normalized, understandable, database-independent, and small enough to implement and test within the remaining internship period.
