> **Historical note:** Point-in-time engineering log. Current rules: `docs/03-requirements/clinical-domain-rules.md`, structure: `docs/04-architecture/project-structure.md`.

# Phase 4 — Appointment workflows (2026-09-19)

## Reschedule API

`PATCH /api/appointments/{id}/reschedule`

Allowed when status is Scheduled, Waiting, Cancelled, or NoShow.  
Blocked for CheckedIn, InProgress, Completed.

Writes `AppointmentEvent` and optional audit. Cancel requires a reason. See live transition table in `clinical-domain-rules.md`.
