# OCR database audit notes

**Last reviewed:** 2026-09-27 — EF Core migrations remain the source of truth; reference SQL may lag.

## Purpose

Summarize history-safety and FK choices for the outpatient MVP.

## Core tables

Patients, PatientAllergies, MedicalHistoryItems, ClinicalVisits, VitalSigns, Diagnoses, ClinicalNotes, Appointments, AppointmentEvents, PatientDeathRecords, AuditEvents (+ Identity).

## Clinical history safety

- Patient-owned historical records use **RESTRICT** FKs where deleting a patient must not silently wipe clinical meaning without an explicit process.  
- Appointment → AppointmentEvents: **CASCADE**.  
- Visit → VitalSigns / Diagnoses / ClinicalNotes: **CASCADE**.  
- Visit optional Appointment link: **SET NULL** so removing an appointment does not erase the visit.  
- Death record: provenance for `Status = Deceased`.

Prefer applying **EF migrations** over hand-running `ocr-complete-database.sql`.
