# 7.3 Documentation-First Development

## Documentation as an engineering tool

One of the strongest practical lessons from OCR was that documentation is not only a final reporting activity. Requirements, domain rules, workflow diagrams, architecture decisions, traceability, and testing plans were useful while the system was being built.

Writing a rule explicitly made it easier to decide where that rule belonged: database constraint, service logic, authorization policy, UI validation, or test.

## Research before implementation

Research examined reference systems and healthcare-oriented guidance before finalizing the project model. Important distinctions included patient versus appointment, appointment versus clinical visit, current state versus longitudinal history, draft versus finalized documentation, and operational workflow versus future interoperability.

The goal was not to reproduce a mature enterprise EMR. Mature concepts were used as references and then deliberately simplified to an internship-sized system.

## Documentation as a checkpoint

A useful sequence became:

1. State the problem.
2. Identify the domain concept.
3. Write the rule.
4. Define the workflow.
5. Decide architectural responsibility.
6. Implement.
7. Test the rule.
8. Record the evidence.

## Traceability

The project traceability chain is:

Internship Plan → Scope Decision → Domain Finding → Requirement → Design Decision → Implementation → Test Evidence → Documentation

This explains not only what was built but why.

## Evidence

**Figure 7.4 — Documentation-to-implementation traceability**

Capture the repository tree showing docs/03-requirements, docs/04-architecture, docs/09-testing, and relevant implementation directories. Use two screenshots if one cannot remain readable.

**Figure 7.5 — One rule traced through the project**

Use the rule "a deceased patient cannot receive a new appointment." Show its domain-rule statement, related requirement, actual implementation location, corresponding test scenario, and final UI behavior if available. Use actual repository paths; do not invent line numbers.

## Reflection

For workflow-heavy software, writing the rule first can reduce rework because implementation is constrained by an explicit model.