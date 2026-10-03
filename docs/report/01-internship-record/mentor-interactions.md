# Mentor Interactions and Scope Management

## Purpose

This document records mentor guidance that materially affected the direction and feasibility of the OCR internship project.

## Reporting Timeline and Scope Review

For consistency, the original four-week plan is mapped to eight report weeks, one task per week: Week 1 = Week 1/Task 1 through Week 8 = Week 4/Task 2.

## Scope Review

The initial project plan included a broad set of EMR functions. During the internship, the mentor reviewed the scope against the available project period and advised reducing it.

The mentor's guidance was:

> “It would be difficult to achieve everything you mentioned in the document within one month, especially since some of the available days have already passed. Could you please revise the scope to fit within the remaining one-month period? There’s no need to align the project with any international standards, since this is an internship project. For now, please focus on the core functionality we agreed on: Patient Management, Patient Chart, and Appointment Management. If there is enough time after completing these features, we can incorporate the other functionalities later.”

## Engineering Significance

This interaction became an important practical lesson in scope management.

Instead of treating the original plan as fixed, the project scope was reconsidered according to:

- available development time;
- complexity of healthcare workflows;
- internship-level objectives;
- the need to produce a working and demonstrable system;
- the difference between a useful MVP and a full enterprise EMR.

The resulting project baseline concentrated on:

1. **Patient Management**
2. **Patient Chart**
3. **Appointment Management**

The final SRS and technical documentation confirm this three-module scope.

## Mentor Guidance and Learning

The mentor's feedback demonstrated that requirements and project scope are not static documents. They can be revised when feasibility, time, or project context changes.

This also reinforced a broader lesson: a smaller coherent system with functioning workflows is more useful for an internship than a much larger system with many incomplete features.

## Documentation Before Implementation

The internship also demonstrated the practical value of working through different technical documents before extensive implementation. Research notes, requirements, domain rules, architecture decisions, data design, and testing plans provided a clearer path into coding.

The repository itself preserves this progression:

**Research → Requirements → Architecture/Data → Engineering → Testing → Finalization**

The experience showed that documentation was not merely an academic requirement. It acted as a working map for implementation.

## Evidence

Primary repository evidence includes:

- `docs/01-research/`
- `docs/03-requirements/`
- `docs/04-architecture/`
- `docs/05-data/`
- `docs/06-engineering/`
- `docs/09-testing/`
- `docs/08-finalization/`
