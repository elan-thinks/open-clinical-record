# Clinical workflow (discovery)

> **Note (2026-09-27):** This discovery document captures early workflow intent. For authoritative appointment/visit statuses and roles, use `docs/03-requirements/clinical-domain-rules.md` and `docs/clinical-visit-model.md`.

## Intent

Outpatient flow: register → book → check-in → document visit → history accumulates without overwrite.

## Live product summary

1. Receptionist registers patient and books appointment (`Scheduled`).  
2. Check-in moves appointment to `CheckedIn` and creates a **Draft** visit.  
3. Nurse/Doctor documents vitals, diagnoses, notes; may set **Final**.  
4. Final visit marks appointment **Completed** (leaves active queue).  
5. Return visits create **new** visit rows.

Detailed transition tables live in the domain rules document.
