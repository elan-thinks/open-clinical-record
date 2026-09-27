# Final project presentation — outline

**Suggested length:** 10–15 minutes + 5 minutes Q&A  
**Demo:** live application preferred

---

## Slide 1 — Title

- Open Clinical Record (OCR)  
- Outpatient EMR internship project  
- Your name · organization · date  

## Slide 2 — Problem

- Fragmented paper/ad-hoc outpatient records  
- Need a **focused** digital path: register → schedule → check-in → document → history  

## Slide 3 — MVP scope

Three modules only:

1. Patient management  
2. Patient chart  
3. Appointments + check-in  

Explicitly **out**: pharmacy, lab, FHIR, full hospital EMR  

## Slide 4 — Users & roles

| Role | Responsibility |
|------|----------------|
| Receptionist | Register, book, check-in |
| Nurse | Vitals, chart support |
| Doctor | Document & finalize |
| Admin | Users, audit |

Backend enforces permissions (not only hidden buttons).

## Slide 5 — Clinical model

Patient → **Visit** → vitals / diagnoses / notes  

- One registration, many visits  
- **Never overwrite** prior visits  
- Final visit → appointment **Completed**  

## Slide 6 — Architecture

React SPA → ASP.NET Core API → PostgreSQL  
JWT · EF Core · GitHub Actions CI  

## Slide 7 — Live demo

Follow Week 8 demo script (desk → nurse → doctor → second visit).

## Slide 8 — Quality

- Automated tests (access, appointments, clinical, longitudinal)  
- CI green on `main`  
- Domain rules + user guide documented  

## Slide 9 — Challenges & learning

- EF InMemory vs real provider testing  
- Role claims / JWT  
- Queue status aligned with finalized visits  
- Doc drift → consistency pass  

## Slide 10 — Future work

- Deeper reports, stronger frontend tests  
- Production hardening (secrets, hosting)  
- Interoperability only after MVP is solid  

## Slide 11 — Closing

- Deliverables: code, SRS, DB script, technical docs, user guide  
- Repository link  
- Thank you / questions  

---

## Speaker notes (demo timing)

| Min | Action |
|-----|--------|
| 0–2 | Problem + scope |
| 2–4 | Roles + model |
| 4–6 | Architecture |
| 6–12 | Live demo |
| 12–14 | Tests + lessons |
| 14–15 | Close |
