# Open Clinical Record — User Guide

**Product:** Open Clinical Record (OCR) outpatient EMR  
**Audience:** Receptionists, nurses, doctors, administrators  
**Version:** Week 8 finalization (2026-09-27)

---

## 1. Getting started

### 1.1 Sign in

1. Open the application in a browser (development: `http://localhost:5173`).  
2. Enter your email and password.  
3. You land on a **role-aware dashboard**.

**Training accounts (development only):**

| Email | Role | Default password |
|-------|------|------------------|
| `desk@clinic.local` | Receptionist | `Dev@12345` |
| `nurse@clinic.local` | Nurse | `Dev@12345` |
| `doctor@clinic.local` | Doctor | `Dev@12345` |
| `admin@clinic.local` | Admin | `Dev@12345` |

Change passwords in production. Never use these credentials outside a lab environment.

### 1.2 Navigation

The left sidebar shows only features your role may use. Common items:

- **Dashboard** — today’s workload  
- **Patients** / **Register patient**  
- **Medical Chart** / **Medical Records**  
- **Appointments** / **New appointment** / **Check-in / Queue**  
- **Profile** — your account  
- **Admin** areas (Admin only) — users, audit  

---

## 2. Receptionist workflows

### 2.1 Register a patient

1. Open **Register patient**.  
2. Enter name, sex, date of birth, contact details as required.  
3. Save. The system assigns a **medical record number** (e.g. OCR-000123).  

Search existing patients first to avoid duplicates.

### 2.2 Book an appointment

1. Open **New appointment**.  
2. Search and select the patient.  
3. Choose **date**, **duration**, and an **available time slot**.  
4. Select **type** (Consultation, Follow-up, Walk-in, …).  
5. Optionally add provider and reason.  
6. **Create appointment**.

You cannot book for a patient marked **Deceased**.

### 2.3 Check-in

1. Open **Check-in / Queue** (or Appointments).  
2. Find today’s patient.  
3. **Check in**. Status becomes **Checked in** and a **Draft visit** is created for clinical staff.

### 2.4 Cancel or reschedule

- **Cancel:** choose Cancel, enter a **reason** (required), confirm.  
- **Reschedule:** choose a new date/time (allowed when not already in progress/completed).  

### 2.5 Mark patient deceased

Receptionists may mark deceased (with death details as prompted). Clearing deceased status is **Admin/Doctor only**.

---

## 3. Nurse workflows

### 3.1 Support the queue

- View **Check-in / Queue** and open the patient’s **chart**.  

### 3.2 Record vitals and notes

1. Open the patient chart.  
2. Select the **Draft** visit (or start a new consultation if allowed).  
3. Enter blood pressure, pulse, temperature, SpO₂, etc.  
4. Add notes if needed.  
5. Save. Leave status **Draft** until the clinician finalizes, or finalize if your clinic policy allows.

Nurses **cannot** mark a patient deceased.

---

## 4. Doctor workflows

### 4.1 Review the chart

Open **Patients** → patient → **Medical Chart**. Review allergies, history, and **visit history**.

### 4.2 Document and finalize a visit

1. Open the active **Draft** visit.  
2. Update chief complaint, diagnoses, plan, vitals as needed.  
3. Set status to **Final** when the consultation is complete.  

**Important:** Final visits cannot be edited. A return visit creates a **new** visit so history is never overwritten.

Finalizing sets the linked appointment to **Completed** and removes the patient from the active queue.

### 4.3 Deceased status

Doctors may **mark** and **clear** deceased status per clinic policy.

---

## 5. Administrator workflows

- Manage users and roles (as implemented).  
- Review **audit** events for important actions.  
- Operational access to patients/appointments without becoming a clinical author for chart content.

---

## 6. Appointment statuses (plain language)

| Status | Meaning |
|--------|---------|
| Scheduled | Booked, not yet arrived |
| Waiting | In waiting area |
| Checked in | Arrived; clinical visit started (Draft) |
| In progress | Being seen |
| Completed | Visit finished |
| Cancelled | Called off (reason recorded) |
| No-show | Did not attend |

---

## 7. Tips and troubleshooting

- **White screen after deploy:** hard refresh (Ctrl+Shift+R) or clear site data; ensure API is online (footer status).  
- **Permission denied:** your role cannot perform that action; use the correct training account.  
- **Cancel blocked:** enter a cancellation reason.  
- **Patient not in queue:** they may already be Completed/Cancelled; change date filter or status filters.  

---

## 8. Privacy

Treat all patient data as confidential. Sign out when leaving a shared workstation.
