# 7. Research Methodology and Findings

## 7.1 Purpose of the Research

Research was conducted before finalizing requirements and architecture. The objective was not to copy a mature EMR but to understand the domain concepts that should influence a small internship-scale implementation.

The project research focused on four questions:

1. How are patients and longitudinal charts represented?
2. How are appointments distinguished from clinical encounters/visits?
3. What workflow and lifecycle concepts matter in clinical documentation?
4. Which architectural and interoperability ideas are relevant without making them mandatory MVP features?

## 7.2 Research Sources

The repository research log identifies the principal reference categories as:

- Oracle Health documentation and public healthcare product material;
- OpenMRS;
- Epic;
- World Health Organization material;
- HL7 FHIR.

These sources were treated as reference points for domain understanding rather than as implementation specifications.

## 7.3 Research Method

The research process was:

**Question → Source Review → Finding → Interpretation → Scope Decision → Requirement / Design Implication**

Findings were classified into:

- **Adopt** — concept important enough to implement in the MVP;
- **Simplify** — useful concept reduced to internship-scale form;
- **Innovate** — project-specific interpretation;
- **Future** — valuable but deferred;
- **Reject** — unnecessary for the defined scope.

This classification prevented the research phase from expanding the project beyond its time constraint.

## 7.4 Major Findings

### Finding 1 — The Patient Chart Is More Than Demographics

A patient chart is a clinical workspace containing longitudinal information. This influenced OCR's separation of demographic Patient data from ClinicalVisit and clinical documentation.

**Decision:** Adopt the separation, simplify the depth of clinical content.

### Finding 2 — Appointment and Clinical Visit Are Different

Scheduling and clinical documentation represent different stages of the patient's journey.

**Decision:** Adopt the distinction and connect the entities through workflow.

### Finding 3 — Clinical Records Have Lifecycle

Clinical documentation can be in progress and later finalized.

**Decision:** Simplify the mature lifecycle into Draft and Final states.

### Finding 4 — Historical Continuity Matters

Clinical history should remain longitudinal rather than being overwritten by the latest visit.

**Decision:** Adopt historical visit preservation.

### Finding 5 — Patient Lifecycle Status Matters

Deceased status is a controlled lifecycle state rather than a deletion action.

**Decision:** Adopt explicit patient status and restrictions on subsequent activity.

### Finding 6 — Interoperability Should Influence Design

Interoperability concepts can influence entity boundaries and terminology even when full standards implementation is outside the MVP.

**Decision:** Future/deferred. The MVP does not claim FHIR interoperability.

## 7.5 Research-to-Engineering Chain

The most important outcome of the research was the chain:

**External/domain research → domain concepts → simplified requirements → architecture → implementation rules → tests**

This helped prevent premature coding. It also provided a defensible explanation for why particular features exist and why other mature-EMR capabilities were intentionally excluded.
