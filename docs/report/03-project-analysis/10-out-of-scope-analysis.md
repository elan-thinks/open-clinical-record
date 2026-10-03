# 10. Out-of-Scope and Deferred Features

## 10.1 Rationale

The mentor explicitly reduced the initial scope to Patient Management, Patient Chart and Appointment Management because a broader EMR could not reasonably be completed within the one-month internship period. Out-of-scope analysis therefore represents deliberate engineering prioritization.

## 10.2 Excluded Subsystems

| Feature | Status | Reason |
|---|---|---|
| Pharmacy | Out of scope | Separate clinical/operational subsystem |
| Laboratory | Out of scope | Requires additional workflows and result models |
| Radiology | Out of scope | Requires imaging/order/report workflows |
| Billing | Out of scope | Different financial domain and controls |
| Patient portal | Out of scope | Separate patient-facing product surface |
| FHIR exchange | Deferred | Valuable interoperability capability but unnecessary for MVP delivery |
| Multi-facility | Deferred | Adds tenancy, facility and scheduling complexity |
| Advanced BI | Deferred | MVP only requires basic data presentation |
| AI clinical decision support | Out of scope | Not necessary for core record workflow |
| Rich amendment/versioning | Deferred | Mature clinical-record governance exceeds internship scope |

## 10.3 Scope Does Not Mean Technical Irrelevance

An excluded feature can still influence architectural thinking. For example, interoperability research encouraged clear entity boundaries even though FHIR exchange was not implemented. Similarly, understanding pharmacy and laboratory workflows helped define what should not be mixed into the core patient chart.

## 10.4 Risk of Scope Expansion

Adding subsystems late in a short project would create several risks:

- incomplete workflows;
- shallow testing;
- inconsistent authorization;
- rushed database changes;
- inadequate documentation;
- reduced time for defect correction;
- a larger but less coherent demonstration.

The final scope therefore prioritized completeness of the central workflow over the number of modules.

## 10.5 Future Expansion Boundary

A future version could add new subsystems around the existing patient identity and visit foundation. Such expansion should occur only after reviewing data relationships, authorization boundaries, audit requirements and workflow transitions rather than simply adding new screens.
