# Phase 4 — Appointment workflows (2026-09-19)

## Reschedule API

`PATCH /api/appointments/{id}/reschedule` — Roles: **Admin, Receptionist**

Allowed when status is Scheduled, Waiting, Cancelled, or NoShow.
Blocked for CheckedIn, InProgress, Completed.

Writes `AppointmentEvent` (`Rescheduled: old → new`) and optional audit `Appointment.Reschedule`.

## Tests

`AppointmentWorkflowTests`: check-in Draft visit, Completed terminal, cancel reason, invalid transitions, deceased booking block, reschedule + event history.
