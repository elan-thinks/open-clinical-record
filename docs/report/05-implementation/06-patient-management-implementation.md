# 5.6 Patient Management Implementation

## 5.6.1 Purpose

Patient Management is one of the three primary MVP capabilities. It provides the stable patient identity around which appointments and longitudinal clinical visits are organized.

The implementation treats registration as a controlled identity operation rather than simply creating a row from a form.

## 5.6.2 Patient Registration

Registration captures the required demographic/contact information and creates a patient record with a Medical Record Number (MRN). The MRN provides a stable identifier used to locate the patient throughout the application.

Validation is applied before persistence. Required fields, data formats, and lifecycle constraints are handled through the application boundary rather than relying exclusively on browser-side validation.

### [SCREENSHOT INSERT — Figure 5.11: Patient registration form]

**Capture:** Running OCR patient registration page with the form visible and populated with synthetic/demo data.

**What must be visible:** page title, major demographic fields, MRN behavior if displayed, validation controls, and Save/Register action.

**Do not show:** real patient information.

**Purpose:** Demonstrates the implemented patient-registration workflow.

**Suggested caption:** *Figure 5.11. Patient registration interface using controlled demographic and contact information.*

## 5.6.3 Patient Search and List

A practical EMR requires users to locate existing patients quickly. The patient-management implementation therefore includes patient listing/search functionality rather than forcing users to navigate through unrelated records.

Search is especially important because registration should occur once per patient. A user should be able to identify an existing record before creating a duplicate.

### [SCREENSHOT INSERT — Figure 5.12: Patient list/search]

**Capture:** Patient list page with search/filter controls and several synthetic patient records.

**What must be visible:** search field, list/table columns, patient identifier/MRN, patient status if shown, and navigation/action controls.

**Purpose:** Demonstrates the operational workflow for locating an existing patient.

**Suggested caption:** *Figure 5.12. OCR patient list and search interface.*

## 5.6.4 Patient Profile and Updates

The patient profile provides the demographic and lifecycle context used by other modules. Permitted demographic/contact updates can be performed without creating a second patient identity.

The implementation distinguishes demographic identity from clinical history. A change to a phone number, for example, should not create a new clinical visit or erase previous documentation.

## 5.6.5 Patient Lifecycle

Patient status includes Active, Inactive, and Deceased. Deceased status is a controlled lifecycle state rather than a deletion operation.

The application also applies role restrictions to lifecycle changes. Nurses cannot mark patients deceased; doctors, administrators, and receptionists can perform the relevant permitted operation.

### [SCREENSHOT INSERT — Figure 5.13: Patient lifecycle/status action]

**Capture:** Patient profile showing the status field/action used for a lifecycle change. Use a synthetic patient and demonstrate the visible state after the action if safe.

**Purpose:** Provides visual evidence that lifecycle status is represented in the patient-management workflow.

**Suggested caption:** *Figure 5.13. Patient lifecycle status within the OCR patient-management workflow.*

## 5.6.6 Historical Integrity

The implementation does not treat patient management as permission to delete or overwrite the clinical history. Patient identity is the anchor for multiple appointments and visits.

This distinction becomes particularly important in the Patient Chart module, where the same patient can have multiple clinical encounters over time.

## 5.6.7 Validation and Error Handling

Validation occurs at multiple levels:

- frontend input validation for immediate feedback;
- API validation for untrusted requests;
- business-rule validation for domain constraints;
- database constraints and persistence behavior.

This layered validation prevents the UI from becoming the only place where important rules are enforced.

## 5.6.8 Evidence Summary

Patient Management therefore provides the identity foundation for the rest of OCR. Its implementation is successful only when registration, search, profile context, lifecycle state, and downstream appointment/chart relationships work together.
