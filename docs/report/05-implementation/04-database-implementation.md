# 5.4 Database Implementation

## 5.4.1 Persistence Strategy

PostgreSQL was used as the database engine for the OCR MVP. Entity Framework Core 8 provided ORM capabilities while Npgsql supplied PostgreSQL integration.

The database implementation was derived from the domain model rather than treating the UI forms as the primary source of structure.

## 5.4.2 Core Persistence Model

The implemented model includes entities supporting the longitudinal clinical workflow. Major concepts include:

- Patient
- Appointment
- AppointmentEvent
- ClinicalVisit
- VitalSigns
- Diagnosis
- ClinicalNote
- PatientDeathRecord
- AuditEvent

The important relationship is that a patient can have multiple appointments and multiple clinical visits over time. A clinical visit can contain its own clinical documentation rather than replacing previous visits.

### [SCREENSHOT INSERT — Figure 5.6: Database model / ERD]

**Capture:** Use the project's ERD/database design figure or a clean database diagram generated from the current implementation. It should show Patient, Appointment, ClinicalVisit, VitalSigns, Diagnosis, ClinicalNote, AppointmentEvent, AuditEvent, and PatientDeathRecord where applicable.

**Critical requirement:** If you generate a new ERD for the report, state that it is a report visualization derived from the implemented model and not a substitute for the migration/source-of-truth.

**Purpose:** Visually demonstrate the longitudinal data model.

**Suggested caption:** *Figure 5.6. Implemented OCR persistence model supporting longitudinal patient records and workflow events.*

## 5.4.3 Entity Framework Core

EF Core provides the application with typed access to PostgreSQL and manages schema evolution through migrations. This avoids embedding routine SQL operations throughout the service layer and keeps the persistence model close to the C# domain representation.

The repository contains migration artifacts, including appointment-related migrations and the model snapshot.

### [SCREENSHOT INSERT — Figure 5.7: EF Core migration history]

**Capture:** GitHub or VS Code showing the `Data/Migrations` directory and at least one migration associated with the appointment/domain evolution.

**Purpose:** Demonstrates that the schema evolved through versioned migration artifacts.

**Suggested caption:** *Figure 5.7. Entity Framework Core migrations used to evolve the OCR database schema.*

## 5.4.4 Longitudinal Record Preservation

A central database decision was to avoid overwriting previous clinical visits. A patient represents the person; a ClinicalVisit represents a specific attendance/clinical episode. New clinical content therefore belongs to a new visit rather than silently replacing an older visit.

This model supports chronological chart presentation and protects the basic historical meaning of the record.

## 5.4.5 Deceased Patient State

Patient lifecycle state is stored separately from the historical clinical record. Marking a patient deceased changes controlled patient status and creates death-related historical information; it does not delete the patient or their prior visits.

The implementation also applies workflow constraints to this state, including preventing new appointments for deceased patients.

## 5.4.6 Transactional Integrity

Clinical and workflow operations can involve more than one persistence change. The implementation therefore required consideration of transactional integrity and appropriate ACID guarantees for clinically significant operations.

The internship implementation does not claim complete enterprise-grade concurrency hardening. In particular, MRN generation and appointment conflict checks remain documented limitations requiring stronger concurrency strategies for production-scale use.

## 5.4.7 Database Verification

Database correctness was assessed through automated application tests and manual end-to-end verification against PostgreSQL. Automated tests use the EF Core InMemory provider, so they should not be interpreted as a complete substitute for testing the real PostgreSQL engine.

That distinction is explicitly important in a professional report.
