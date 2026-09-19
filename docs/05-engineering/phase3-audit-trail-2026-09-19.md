# Phase 3 — Audit trail (2026-09-19)

Closes **ISSUE-002 (P0)**.

## Table: `AuditEvents` (append-only)

Action, EntityType, EntityId, ActorUserId, ActorName, Summary (≤500), CreatedAt.

Migration: `20260919120000_AddAuditEvents`

```bash
dotnet ef database update --project src/backend/OpenClinicalRecord.Api
```

## API

`GET /api/audit?entityType=&entityId=&take=50` — **Admin only**.

## Wired

Auth.Login / LoginFailed, Patient.*, Appointment.Create/StatusChange, Visit.Create/Document.
