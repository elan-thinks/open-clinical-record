# 7.6 Debugging and Problem Solving

## Debugging as a reasoning process

The internship changed debugging from simply finding the failing line toward a broader process:

Observe → Reproduce → Localize → Form a hypothesis → Change the relevant part → Verify → Record the lesson

This matters in multi-layer applications because an apparent UI problem may originate in routing, authorization, API behavior, service logic, persistence, or data state.

## Workflow debugging

OCR made workflow bugs particularly instructive. A state transition can be correct in the interface but incorrect in the backend, or correct in isolation but inconsistent with a related entity.

Checking in a patient, for example, affects appointment state and the clinical-visit lifecycle. Debugging therefore requires examining the complete operation rather than only the visible control.

## Environment problems

The internship also exposed practical development-environment issues. When a development machine or environment is unavailable, engineering work may continue through repository inspection, documentation, another available machine, or focused planning.

This demonstrated that source control and documentation preserve enough project context to make work recoverable.

## AI-assisted debugging

AI assistants were useful for explaining errors, suggesting implementation approaches, reviewing UI ideas, and accelerating investigation. Generated suggestions were not treated as evidence of correctness.

A reliable debugging loop remained:
1. reproduce the issue;
2. inspect the actual project state;
3. understand the proposed change;
4. apply the smallest appropriate change;
5. run relevant verification;
6. inspect the resulting behavior.

## Evidence

**Figure 7.11 — Genuine debugging evidence**

Use one real before/after debugging example from repository history or development notes. Include the original symptom, actual error or behavior, actual fix, and verification result.

Do not manufacture an error screenshot. If no clean documented defect exists, replace this with repository-history evidence and state the limitation.

**Figure 7.12 — Repository history as problem-solving evidence**

Capture a Git history view showing a meaningful fix, workflow change, or refactor, with commit message and date visible.

## Reflection

Debugging quality depends on understanding the system boundary. Faster typing does not compensate for an incorrect mental model of the workflow.