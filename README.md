# Open Clinical Record

**Open Clinical Record (OCR)** is a focused outpatient EMR internship project built around three core workflows:

1. **Patient Management**
2. **Patient Chart**
3. **Appointment Management**

The MVP is intentionally limited to functionality that can realistically be implemented, tested, and demonstrated within the internship period.

## Project Direction

```text
Patient Management
       ↓
Patient Chart
       ↓
Appointment Management
       ↓
Check-in / Visit History
```

### Application Roles

| Role | Identity claim | Primary responsibility |
|------|----------------|------------------------|
| **Receptionist / Front Desk** | `Receptionist` | Registration, appointments, check-in |
| **Nurse / Clinical Staff** | `Nurse` | Chart support, vitals, visit workflow |
| **Clinician / Doctor** | `Doctor` | Chart review and authorized clinical updates |
| **System Administrator** | `Admin` | Users, roles, audit, system configuration |

## MVP Modules

### 1. Patient Management
Register, search, profile, status, deceased mark/clear, duplicate awareness.

### 2. Patient Chart
Demographics, allergies, history, longitudinal **visits** (vitals, diagnoses, notes; Draft/Final).

### 3. Appointment Management
Book, list/calendar, reschedule, cancel (reason), check-in/queue, status events.

## Technology Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** ASP.NET Core 8
- **Database:** PostgreSQL (EF Core + Npgsql)

## Documentation

See **[docs/README.md](docs/README.md)** for the documentation index (current vs historical vs mocks).

## Status

**Week 7 (2026-09-27):** testing/refactoring close-out on `main` — four roles, visit model, appointment workflows, CI.
