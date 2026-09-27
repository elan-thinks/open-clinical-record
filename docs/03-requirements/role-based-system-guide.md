# Role-Based System Guide

**Product:** Open Clinical Record (OCR)  
**Document:** Role-Based System Guide  
**Status:** Current product/UX guide (aligned 2026-09-27)  
**Scope:** Patient Management, Patient Chart, Appointment Management  
**Roles covered:** Clinician / Doctor, Nurse / Clinical Staff, Receptionist / Front Desk, System Administrator

> This guide defines how the product should behave and what each role should see and do after login. **Four application roles** are implemented (including System Administrator). API enforcement matrix: `docs/05-engineering/access-control-report.md`. Domain statuses: `docs/03-requirements/clinical-domain-rules.md`.

---

## 1. Product Principle

Open Clinical Record is a role-aware clinical application. Users should not receive the same workspace with a few buttons hidden. After authentication, the system should load a workspace designed around the user's responsibilities.

The four roles have different goals:

| Role | Primary goal |
|---|---|
| **Clinician / Doctor** | Review patient information and perform authorized clinical/chart work |
| **Nurse / Clinical Staff** | Support patient care, observations, and visit workflow |
| **Receptionist / Front Desk** | Register patients, manage appointments, and handle arrival/check-in |
| **System Administrator** | Manage users, permissions, configuration, security, and system operations |

### Core authorization rule

**The frontend controls what the user can see; the backend controls what the user is allowed to do.**

Hiding a button is not security. Every protected API operation must independently enforce authorization.

---

For the full role UX sections (Doctor, Nurse, Receptionist, Admin dashboards, matrices, and flows), this document previously contained detailed design guidance that remains valid. Prefer the **access-control-report** for live API permissions and **clinical-domain-rules** for appointment/visit status transitions.

## Quick links

| Doc | Use |
|-----|-----|
| `docs/README.md` | Index of current vs historical docs |
| `docs/05-engineering/access-control-report.md` | Seed users + endpoint matrix |
| `docs/03-requirements/clinical-domain-rules.md` | Statuses and domain rules |
| `docs/clinical-visit-model.md` | Longitudinal visit model |
