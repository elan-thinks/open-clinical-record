# 9. Functional Scope Analysis

## 9.1 Final MVP Scope

The final implementation scope was reduced to three connected business modules:

1. **Patient Management**
2. **Patient Chart**
3. **Appointment Management**

These modules form one workflow rather than three independent subsystems.

## 9.2 Patient Management

The module covers:

- patient registration;
- MRN assignment;
- patient listing;
- patient search;
- patient detail viewing;
- patient information updates;
- lifecycle status handling;
- prevention of new appointments for deceased patients.

The purpose is to establish a reliable persistent patient identity for downstream workflow.

## 9.3 Patient Chart

The chart provides longitudinal clinical context around a patient. It includes the patient's clinical visits and the documentation associated with those visits.

Core content includes:

- vital signs;
- diagnoses;
- clinical notes;
- visit status;
- historical visits.

The chart is therefore designed as a timeline/context workspace rather than a second copy of the patient registration screen.

## 9.4 Appointment Management

The appointment module covers:

- appointment creation;
- appointment type;
- scheduling;
- search/filtering;
- check-in;
- queue-oriented status;
- cancellation with reason;
- rescheduling within permitted states;
- no-show handling;
- completion through the clinical workflow.

## 9.5 Supporting Functions

The MVP also includes supporting engineering capabilities:

- authentication;
- role-based authorization;
- user management;
- audit events;
- dashboard information;
- validation;
- automated backend tests;
- manual end-to-end verification.

These are supporting capabilities rather than separate business modules.

## 9.6 Scope Boundary

A feature was considered inside the MVP when it directly supported the three core modules or was necessary to operate them safely. A feature was considered outside the MVP when it introduced a separate clinical/administrative subsystem whose implementation would materially expand the project.

This boundary is important for evaluating the internship fairly: the project should be assessed against the final approved scope, not against the broader initial idea.
