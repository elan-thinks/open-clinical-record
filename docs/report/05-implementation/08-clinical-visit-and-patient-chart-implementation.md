# 5.8 Clinical Visit and Patient Chart Implementation

## 5.8.1 Purpose

The Patient Chart is the clinical core of the OCR MVP. It presents the patient's longitudinal record while allowing the current clinical visit to be documented according to the workflow.

The implementation uses a ClinicalVisit per patient attendance rather than repeatedly overwriting one generic medical-record row.

## 5.8.2 Clinical Visit Lifecycle

Clinical visits have the states:

- Draft
- Final
- Cancelled

A Draft visit can receive appropriate documentation. A Final visit represents completed documentation and is treated as immutable within the simplified MVP model.

If new clinical content is required later, a new visit is created rather than silently modifying the previous finalized record.

### [SCREENSHOT INSERT — Figure 5.18: Patient chart overview]

**Capture:** Open a patient chart for a synthetic patient with at least two historical visits.

**What must be visible:** patient identity/header, chronological visit entries, visit dates/statuses, and navigation into visit details.

**Purpose:** Demonstrates longitudinal record presentation.

**Suggested caption:** *Figure 5.18. Longitudinal patient chart showing multiple clinical visits.*

## 5.8.3 Vital Signs

Clinical staff can record vital signs as part of the visit documentation. Vital signs belong to the clinical visit rather than to the patient's permanent demographic profile.

This is an important modeling distinction because vital signs describe a clinical observation at a particular time.

### [SCREENSHOT INSERT — Figure 5.19: Vital signs entry]

**Capture:** Clinical visit documentation screen with the vital-sign fields visible and populated with clearly synthetic values.

**What must be visible:** the visit context and vital-sign section. Do not use real patient data.

**Purpose:** Demonstrates the relationship between clinical observation and a specific visit.

**Suggested caption:** *Figure 5.19. Vital-sign documentation within a clinical visit.*

## 5.8.4 Diagnoses and Clinical Notes

A ClinicalVisit can contain multiple diagnoses and multiple clinical notes. This avoids reducing a clinical encounter to one free-text field.

The doctor role is responsible for the clinical decision/documentation actions restricted to the clinician workflow. Other clinical staff can support appropriate visit documentation without receiving unrestricted clinical authoring permissions.

### [SCREENSHOT INSERT — Figure 5.20: Clinical documentation]

**Capture:** Clinical visit page showing diagnosis and clinical-note sections. Use synthetic data such as “Upper respiratory symptoms” rather than real patient information.

**Purpose:** Demonstrates actual clinical documentation capability while keeping the example non-sensitive.

**Suggested caption:** *Figure 5.20. Diagnosis and clinical-note documentation within the OCR patient chart.*

## 5.8.5 Finalization

Finalization represents a meaningful lifecycle boundary. The system does not treat finalization as simply another editable flag. It represents the transition from working documentation to finalized historical record.

This design simplifies the internship MVP while preserving the important conceptual distinction between draft and final information.

### [SCREENSHOT INSERT — Figure 5.21: Visit finalization]

**Capture:** Clinical visit screen immediately before or after finalization, showing the Finalize action and the resulting Final state.

**Purpose:** Demonstrates the lifecycle boundary and provides evidence for the immutability discussion.

**Suggested caption:** *Figure 5.21. Clinical visit finalization within the OCR chart workflow.*

## 5.8.6 Chart Chronology

The chart presents multiple visits in chronological context. This is the main practical consequence of the longitudinal data model.

A patient therefore has one identity but potentially many clinical visits, and each visit preserves its own clinical observations and documentation.

## 5.8.7 Engineering Significance

This implementation was one of the most important domain lessons of the internship. The challenge was not simply creating forms for vitals, diagnosis, and notes. The deeper problem was determining which information belongs to the patient, which belongs to an appointment, which belongs to a clinical visit, and which represents a historical event.

That separation makes the resulting application more coherent and provides a foundation for future expansion.
