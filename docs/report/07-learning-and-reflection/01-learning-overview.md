# 7.1 Learning Overview

## Purpose

The internship was an opportunity to experience a complete software-development lifecycle under a constrained industrial schedule. Learning therefore needs to be evaluated across requirements analysis, domain understanding, architecture, implementation, testing, documentation, collaboration, and professional practice.

The most important learning outcome was a change in how software problems were framed. The project initially looked like a set of screens and CRUD operations. Through research, requirements analysis, workflow modeling, implementation, and testing, it became clearer that an EMR is a connected system in which the meaning of a record depends on state, role, chronology, and relationships.

## Main areas of growth

| Area | Initial tendency | Learning demonstrated |
|---|---|---|
| Requirements | Think in features/screens | Connect requirements to workflows and business rules |
| Domain analysis | Treat records as data objects | Model patient, appointment, visit, and documentation as related concepts |
| Architecture | Focus on making code run | Consider responsibility, persistence, authorization, and testability |
| Database design | Think mainly about tables | Consider history, relationships, state, and integrity |
| Security | Associate security mainly with login | Understand authentication, authorization, validation, and auditability |
| Testing | Verify happy paths | Test roles, invalid transitions, history, and boundaries |
| Documentation | Document after implementation | Use documentation as a design and reasoning tool |
| AI assistance | Use AI mainly for help | Treat AI output as a candidate requiring verification |
| Professional practice | Work mainly around assignments | Work with scope, meetings, evidence, and progress reporting |

## Most significant learning

Software quality is often determined before implementation. Clarifying the domain, scope, workflow, constraints, and acceptance conditions made later implementation decisions easier to evaluate.

For example, checking in a patient is not merely a button. It changes appointment state, may create a clinical visit, affects the active queue, and establishes a new longitudinal record.

## Evidence

**Figure 7.1 — Learning progression**

Capture a composite figure containing the original internship plan, final requirements artifact, architecture/workflow diagram, automated test result, and final application workflow. The sequence should visually show assignment → analysis → design → implementation → verification.

The report should not claim that one month produced complete professional mastery. It should show demonstrated growth and remaining gaps.