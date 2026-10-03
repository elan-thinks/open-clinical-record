# 4. Stakeholder Analysis

## 4.1 Purpose

Stakeholder analysis identifies the people and organizational roles affected by OCR, the responsibilities they have within the workflow, and the information or controls they require. The analysis is intentionally limited to the internship MVP rather than attempting to model every stakeholder found in a full hospital information system.

## 4.2 Primary Stakeholders

| Stakeholder | Relationship to OCR | Main concern |
|---|---|---|
| Receptionist / Front Desk | Operational user | Accurate patient registration, appointment booking, check-in and queue handling |
| Nurse / Clinical Staff | Clinical workflow user | Accurate vitals and supporting clinical documentation |
| Doctor / Clinician | Clinical decision/documentation user | Reviewing history and documenting diagnoses, notes and final clinical records |
| Administrator | System/operational user | User management, operational access, audit visibility and configuration |
| Mentor / Project Supervisor | Engineering reviewer | Scope, architecture, progress, quality and feasibility |
| Intern / Developer | System designer and implementer | Requirements, implementation, testing, documentation and learning |
| Internship Organization | Project host | A coherent demonstrable EMR MVP and professional engineering practice |
| Academic Institution | Assessment stakeholder | Evidence of industrial practice, learning and application of software engineering principles |

## 4.3 Stakeholder Needs

The receptionist needs a fast path from patient registration to appointment and check-in. The nurse needs access to the information required to support the visit without receiving permissions intended for clinicians or administrators. The doctor needs longitudinal chart visibility and controlled clinical write operations. The administrator needs operational control without being treated as the default author of clinical content.

The mentor and organization require a system whose scope is achievable within the internship period. This was particularly important because the initial project idea was broader than one month allowed. The academic stakeholder requires evidence that the internship involved more than coding: requirements analysis, design, implementation, testing, documentation, presentation, reflection and exposure to an industrial development environment.

## 4.4 Stakeholder-to-Workflow Mapping

| Workflow stage | Receptionist | Nurse | Doctor | Admin |
|---|---:|---:|---:|---:|
| Register patient | Primary | — | — | Operational access |
| Book appointment | Primary | — | — | Operational access |
| Check in | Primary | Supporting/operational | — | Operational access |
| Record vitals | — | Primary | — | Not default clinical author |
| Review chart | Operational context | Supporting | Primary | Operational access |
| Add clinical diagnosis | — | — | Primary | Not default clinical author |
| Add clinical note | — | Supporting documentation | Primary | Not default clinical author |
| Finalize visit | — | — | Primary | According to implemented authorization |
| Manage users | — | — | — | Primary |
| Audit/system review | — | — | — | Primary |

The table describes the intended business responsibility represented by the implemented role model; it should not be read as a claim that every role has unrestricted access to every underlying database object.

## 4.5 Stakeholder Analysis Result

The central result is that OCR is a workflow system rather than a collection of independent CRUD screens. Each role participates at a different point in the patient journey, and authorization therefore has to reflect business responsibility. This analysis directly informed the role model, service-layer rules, workflow transitions and test scenarios.
