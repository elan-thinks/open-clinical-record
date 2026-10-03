# 3.1 Project Background and Genesis

## 3.1.1 Internship Assignment

The Open Clinical Record (OCR) project originated from the internship objective of designing and developing a simplified Electronic Medical Record application while experiencing the software development lifecycle.

The assignment was intentionally broader than implementation alone. The intern was expected to move through requirements gathering, analysis, design, implementation, testing, documentation, and presentation. This structure transformed the project from a conventional programming exercise into a compact industrial software-engineering exercise.

## 3.1.2 Initial Direction

At the beginning of the internship, the planned project contained a relatively broad set of healthcare-management capabilities. The original plan included patient management, medical records, appointments and consultation, dashboards, reports, additional enhancements, testing, documentation, and final presentation.

The initial scope was useful as a roadmap, but it was not automatically equivalent to a feasible one-month product scope.

## 3.1.3 Mentor-Guided Scope Reduction

During the internship, the mentor explicitly advised reducing the scope because completing all originally proposed functionality within one month would be difficult. The mentor directed the intern to concentrate on three core areas:

1. Patient Management
2. Patient Chart
3. Appointment Management

Additional functionality could be considered after the core features were complete.

This became one of the most important project-management decisions in the internship. Rather than interpreting scope reduction as a loss of ambition, the project treated it as a means of increasing coherence and completion quality.

## 3.1.4 Why the Project Became an EMR Workflow Problem

The early research changed the intern's understanding of the problem.

A simplistic interpretation of an EMR could be a collection of CRUD screens for patients, appointments, and notes. Research into established systems instead showed that the important challenge is the relationship between these concepts.

The project therefore evolved toward the following conceptual chain:

**Patient → Appointment → Check-in → Visit → Clinical Documentation → Finalized Record**

The chain became a central design principle for OCR.

## 3.1.5 Research Before Implementation

Before substantial implementation, the intern researched established EMR references including Oracle Health, OpenMRS, Epic, WHO digital-health guidance, and HL7 FHIR concepts.

The purpose was not to reproduce these systems. The research was used to identify domain concepts and distinguish features appropriate for the internship MVP from features that should remain simplified or deferred.

The repository's research methodology classified findings as Adopt, Simplify, Innovate, Future, or Reject. This gave the project a documented mechanism for converting research into engineering decisions.

## 3.1.6 Final Project Character

OCR ultimately became a focused outpatient EMR MVP rather than an attempt to reproduce a complete hospital information system.

The final SRS defines three core business modules:

- Patient Management;
- Patient Chart;
- Appointment Management.

The project explicitly excludes pharmacy, laboratory, radiology, billing, patient portal, FHIR exchange, multi-facility enterprise scheduling, and AI clinical decision support.

This distinction is important throughout the report: the project should be evaluated against its internship-scale objectives, not against the feature set of a commercial enterprise EMR.

## 3.1.7 Engineering Significance

The genesis of OCR demonstrates a recurring software-engineering principle: a useful product is not defined by the number of features proposed, but by the coherence of the features that can realistically be designed, implemented, tested, and documented within the available constraints.

The internship therefore produced two connected outcomes:

1. a working EMR MVP; and
2. practical experience in turning a broad software idea into a bounded engineering system.
