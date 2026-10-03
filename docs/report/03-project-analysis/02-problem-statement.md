# 3.2 Problem Statement

## 3.2.1 Context

Healthcare information systems manage information whose meaning depends on workflow, chronology, user role, and clinical context. A patient record is not simply a static collection of demographic fields. It evolves through appointments, attendance, clinical observations, diagnoses, notes, and subsequent visits.

For an internship-scale EMR, the engineering challenge is therefore to preserve meaningful relationships between these activities while keeping the system understandable and implementable.

## 3.2.2 Problem Addressed by OCR

OCR addresses the need for a focused digital workflow for managing core outpatient patient information and clinical visits.

The system brings together:

- patient registration and identification;
- patient search and demographic management;
- longitudinal patient-chart information;
- appointments and their status changes;
- check-in and queue progression;
- clinical visit documentation;
- vital signs;
- diagnoses;
- clinical notes and plans;
- role-based access;
- audit information;
- basic operational dashboard information.

## 3.2.3 The Central Information Problem

The central problem is not merely replacing paper with electronic forms.

The deeper problem is maintaining **continuity and integrity of information across time**.

If a patient returns to a facility, the system should not replace the previous clinical record with the new one. A new attendance should create a new visit while preserving the historical record.

Likewise, an appointment should not be treated as equivalent to a completed clinical encounter. An appointment represents planned attendance, while the visit represents clinical activity associated with an attendance.

These distinctions were incorporated into OCR's domain model.

## 3.2.4 Workflow Problem

The system models the progression from administrative scheduling to clinical documentation.

A simplified workflow is:

1. patient registration;
2. appointment creation;
3. patient arrival/check-in;
4. queue progression;
5. creation or association of a draft visit;
6. clinical documentation;
7. finalization;
8. completion of the linked appointment;
9. preservation of the visit in the patient's longitudinal chart.

The workflow prevents the major business concepts from becoming disconnected CRUD modules.

## 3.2.5 Security and Responsibility Problem

Different staff members perform different activities. OCR therefore needed to distinguish operational access from clinical authorship.

The MVP uses four roles:

- Receptionist;
- Nurse;
- Doctor;
- Administrator.

Authorization is enforced at the API in addition to frontend visibility controls. This is important because hiding a button in a web interface is not sufficient to protect a clinical operation.

## 3.2.6 Historical Integrity

Healthcare records require historical continuity. OCR therefore treats previous visits as retained records rather than disposable data.

A finalized visit is immutable in the MVP. If a new clinical event needs to be documented later, the system creates a new visit rather than silently overwriting an earlier one.

This simplified model does not claim to reproduce the complete amendment/correction workflows of enterprise clinical systems. Instead, it establishes a clear MVP rule: finalized clinical content is closed and preserved.

## 3.2.7 Scope Constraint

The problem was intentionally bounded.

OCR does not attempt to solve the entire hospital information problem. Laboratory, pharmacy, radiology, billing, patient portals, external FHIR exchange, multi-facility scheduling, and AI clinical decision support were excluded from MVP acceptance.

This boundary is part of the solution, because uncontrolled scope would have conflicted with the one-month internship constraint.

## 3.2.8 Problem Statement in One Sentence

**OCR was developed as a focused outpatient EMR MVP to provide a coherent, role-aware workflow for managing patients, appointments, and longitudinal clinical visits while preserving historical records and enforcing basic access and integrity rules within an internship-scale implementation.**
