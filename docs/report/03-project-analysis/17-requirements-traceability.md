# 17. Requirements Traceability

## 17.1 Purpose

Traceability connects what the project was expected to accomplish with the artifacts used to design, implement and verify it. It is particularly important for an internship report because it demonstrates that the final system was not assembled from undocumented coding decisions.

## 17.2 Traceability Chain

The report uses the following chain:

**Internship Plan → Scope Decision → Domain Finding → Requirement → Design Decision → Implementation → Test Evidence → Documentation**

Each stage answers a different question:

- **Internship Plan:** What was originally expected?
- **Scope Decision:** What was realistically approved?
- **Domain Finding:** What did research show?
- **Requirement:** What should the system do?
- **Design Decision:** How should the requirement be represented?
- **Implementation:** Where was it built?
- **Test Evidence:** How was it checked?
- **Documentation:** How can another person understand it?

## 17.3 Representative Traceability Matrix

| Requirement area | Requirement evidence | Design evidence | Implementation evidence | Verification |
|---|---|---|---|---|
| Patient registration | Patient requirements | Patient model/service | Patient module | Functional/manual test |
| Patient search | Patient requirements | Query/search design | Patient service/API/UI | Search test |
| Longitudinal chart | Chart requirements | ClinicalVisit model | Chart module | Chart workflow test |
| Vital signs | Chart requirements | Visit-to-vitals relationship | Clinical chart service | Role test |
| Diagnosis | Chart requirements | Visit-to-diagnosis relationship | Clinical chart service | Doctor-role test |
| Appointment booking | Appointment requirements | Appointment entity/state model | Appointment workflow | Functional test |
| Check-in | Appointment requirements | State transition model | Workflow service | End-to-end test |
| Cancellation | Business rule | State/reason validation | Appointment workflow | Negative test |
| Authorization | Security requirements | Role/service rules | Identity/JWT/API authorization | Unauthorized-access test |
| Audit | Audit requirement | Audit model/service | Audit implementation | Audit verification |

## 17.4 Planned vs. Implemented

Traceability must not silently convert the original internship plan into a claim about the final system. Where the original plan included optional features that were later removed or deferred, the final report should identify the scope decision explicitly.

## 17.5 Evidence Sources

The strongest evidence sources for the final report are:

- approved SRS;
- requirements and business-rule documents;
- ERD and architecture diagrams;
- Git history;
- issue/project history;
- source code;
- automated test results;
- manual test records;
- screenshots;
- user guide;
- technical documentation;
- final presentation.

This evidence-first approach will make the final report substantially stronger than a narrative-only internship report.
