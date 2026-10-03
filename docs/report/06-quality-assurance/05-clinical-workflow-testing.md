# 6.5 Clinical Workflow and Longitudinal History Testing

## 6.5.1 Core Clinical Flow

The principal E2E clinical scenario is:

**Register patient → book appointment → check in → record clinical information → finalize → complete appointment**

The more important longitudinal test extends this to a second attendance:

**First visit → second appointment → second visit → verify both visits remain in chart**

This directly tests the requirement that previous clinical history must not be overwritten.

## 6.5.2 Revisit / Non-Overwrite Test

The repository's E2E checklist specifies:

1. register a patient;
2. book and check in an appointment;
3. record vitals/note;
4. create a second appointment;
5. check in again;
6. record different vitals;
7. verify the chart contains two visits.

### [SCREENSHOT INSERT — Figure 6.11: Two-visit longitudinal verification]

**Capture:** Patient chart after completing the second visit, with both historical visits visible. Ideally show different visit dates and distinct clinical observations.

**What must be visible:** same patient context, two separate visit entries, chronological ordering, and enough detail to show they are distinct.

**Purpose:** Directly proves that a later visit did not overwrite the earlier visit.

**Suggested caption:** *Figure 6.11. Verification that repeated patient visits remain preserved in the longitudinal chart.*

## 6.5.3 Check-In Verification

Check-in is the bridge between scheduling and clinical documentation. The E2E test should verify that the appointment reaches CheckedIn and that the expected Draft ClinicalVisit exists.

### [SCREENSHOT INSERT — Figure 6.12: Check-in creates draft visit]

**Capture:** Patient/appointment immediately after check-in, showing CheckedIn status and the corresponding draft visit if exposed in the UI.

**Purpose:** Demonstrates the transition from operational scheduling to clinical documentation.

**Suggested caption:** *Figure 6.12. Check-in verification showing transition into the draft clinical-visit workflow.*

## 6.5.4 Finalization and Queue Removal

The documented E2E scenario checks that when a clinical visit is finalized, the linked appointment becomes Completed and disappears from the active check-in queue.

### [SCREENSHOT INSERT — Figure 6.13: Finalization and queue completion]

**Capture:** Before/after evidence: patient in active queue before finalization, then completed state with the patient absent from the active queue.

**Purpose:** Demonstrates cross-module workflow consistency.

**Suggested caption:** *Figure 6.13. Finalizing a clinical visit and completing the linked appointment workflow.*

## 6.5.5 Draft/Final Boundary

Testing should also verify that the final state behaves differently from Draft. The simplified MVP treats finalized visits as immutable and requires a new visit for subsequent clinical content.

### [SCREENSHOT INSERT — Figure 6.14: Final visit state]

**Capture:** Finalized visit showing its Final state and the absence/disablement of edit actions that would contradict the implemented lifecycle.

**Purpose:** Provides evidence for the finalization boundary.

**Suggested caption:** *Figure 6.14. Verification of the finalized clinical-visit state.*
