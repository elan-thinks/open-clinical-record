# Clinical model: Patient → Visit → Encounter

Open Clinical Record follows an OpenMRS / FHIR-inspired longitudinal model.

## Rules

1. **A patient is registered once.** Returns never create a new patient record.
2. **Each attendance is a new Visit.** Prior visits are never overwritten.
3. **Encounter content hangs off the Visit** (vitals, diagnoses, notes, plan).

See source for full workflow documentation.
