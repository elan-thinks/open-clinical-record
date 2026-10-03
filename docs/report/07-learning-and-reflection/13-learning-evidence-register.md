# 7.13 Learning Evidence Register

This register connects reflective claims to evidence that can be captured or verified.

| ID | Learning claim | Evidence | Action |
|---|---|---|---|
| LE-01 | Scope must fit delivery capacity | Scope/SRS | Capture original and final scope |
| LE-02 | Requirements should be workflow-driven | Requirements | Capture workflow and requirements |
| LE-03 | Documentation can guide implementation | Repository | Capture requirements/architecture/testing tree |
| LE-04 | Patient records are longitudinal | Application | Capture synthetic patient with two visits |
| LE-05 | Role boundaries require backend enforcement | Test | Capture access-control result |
| LE-06 | Architecture assigns responsibility | Architecture/code | Capture architecture and service code |
| LE-07 | Transactional integrity needs explicit reasoning | Code/docs | Verify relevant workflow evidence |
| LE-08 | Testing must include boundaries | Test output | Capture test output and source |
| LE-09 | CI adds repeatable verification | CI | Capture successful workflow |
| LE-10 | AI output requires verification | AI workflow | Capture safe example if available |
| LE-11 | Mentor feedback affects scope | Meeting/SRS | Capture sanitized decision or SRS |
| LE-12 | Industrial work integrates academic concepts | Analysis | Create university-to-OCR matrix |
| LE-13 | Debugging requires system-level reasoning | History | Verify genuine fix evidence |
| LE-14 | Development has remaining gaps | Limitations | Cite QA and architecture limitations |

## Screenshot safety checklist

Use synthetic data. Remove credentials, passwords, tokens, connection strings, personal contact details, private employee communication, and any real patient information.

Screenshots should show enough context to identify the screen or file, remain readable at report page size, and include a figure number and descriptive caption.

## Priority evidence set

Prioritize:
1. final workflow diagram;
2. original-versus-final scope;
3. longitudinal chart with two synthetic visits;
4. service-layer code implementing a real business rule;
5. automated test output;
6. CI verification;
7. challenge-to-lesson matrix.

Together these demonstrate progression from understanding to engineering practice to verification.