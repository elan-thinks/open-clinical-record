# Clinical visit model (Patient → Visit)

**Status:** Implemented on `main`

## Hierarchy

```text
Patient
  ├── Allergies, Medical history (longitudinal)
  ├── Appointments (+ AppointmentEvents)
  └── ClinicalVisits
         ├── VitalSigns (0..1)
         ├── Diagnoses
         └── ClinicalNotes
```

## Rules

| Rule | Meaning |
|------|--------|
| Appointment ≠ visit | Scheduling is not documentation |
| Check-in creates Draft visit | When applicable |
| Draft is editable | Clinical staff may update |
| Final is immutable | Further care requires a **new** visit |
| History is never overwritten | Multiple visits accumulate |
| Finalize → appointment Completed | Linked appointment leaves the active queue |

## Visit status

| Status | Meaning |
|--------|--------|
| Draft | Editable; default for new visits |
| Final | Immutable; new content requires a new visit |
| Cancelled | Voided |

## Related

- Domain rules: `docs/03-requirements/clinical-domain-rules.md`
- Access matrix: `docs/06-engineering/access-control-report.md`
