# Industrial Practice Report

This directory is the production workspace for the final Industrial Practice Report for the Open Clinical Record (OCR) internship project.

## Final PDF

**Industrial Internship Report (PDF):**

- [`Open-Clinical-Record-Industrial-Internship-Report.md`](./Open-Clinical-Record-Industrial-Internship-Report.md) — summary pointer
- `Open-Clinical-Record-Industrial-Internship-Report.pdf` — full report (~119 pages)

The current PDF package exists in the repository. It should be regenerated after the timeline and visual-design corrections below are incorporated into the final report.

## Internship Timeline Rule

The internship was **four weeks total, with two tasks in each week**:

| Week | Task 1 | Task 2 |
|---|---|---|
| **1** | Project Initiation, Requirement Analysis & Design | Project Foundation |
| **2** | Patient Management Module | Medical Records Module |
| **3** | Appointment & Consultation Module | Additional Features & Enhancements |
| **4** | Testing, Bug Fixing & Refactoring | Finalization & Presentation |

The final report must never describe these as eight internship weeks.

## OCR Visual Design System

The final report should use the **same visual language as the OCR application**, rather than introducing an unrelated report palette.

Primary OCR dark-theme tokens from `src/frontend/open-clinical-record-web/src/index.css`:

| Token | Hex | Report use |
|---|---|---|
| Background | `#0C1310` | Cover, chapter opener backgrounds, dark figure panels |
| Surface | `#121A15` | Cards, panels, tables, figure containers |
| Surface 2 | `#16201A` | Secondary panels, code/evidence blocks |
| Line | `#1E2B23` | Borders, dividers, table rules |
| Text | `#EEF3EF` | Text on dark surfaces |
| Text dim | `#A7BDAE` | Secondary text |
| Text faint | `#6D8577` | Captions, metadata |
| OCR teal | `#3DDC97` | Primary accent, headings, key diagrams, progress indicators |
| OCR teal dim | `#29A874` | Secondary accent |
| OCR amber | `#EAB35A` | Warnings, timeline highlights, secondary emphasis |
| OCR red | `#E8778A` | Limitations, negative/error states only |

**Do not use the previous navy/gold palette.** The report should look like an extension of OCR itself: dark clinical/technical, restrained, modern, and teal-led.

Typography should follow the application direction where practical: **Space Grotesk** for major display headings and **Inter** for body text, tables, captions, and technical content.

## Working principles

1. Evidence before prose.
2. Never present planned or designed functionality as implemented functionality.
3. Document both the industrial experience and the engineering work.
4. Develop the report in phases: evidence first, writing second, publication last.
5. Use professional figures, tables, citations, cross-references, and appendices.
6. The report may exceed 100 pages when justified by the available evidence and university requirements; we will not add filler merely to increase the page count.

## Production phases

- 00-foundation — university requirements, report strategy, metadata, scope, and evidence rules
- 01-internship-record — detailed reconstruction of the internship
- 02-organization — company and internship placement
- 03-project-analysis — OCR domain, problem, objectives, scope, requirements, and workflows
- 04-system-engineering — architecture, database, backend, frontend, security, and UI/UX
- 05-implementation — implemented modules and technical decisions
- 06-quality-assurance — testing, verification, defects, fixes, and results
- 07-learning-and-reflection — skills, university-to-industry mapping, challenges, and lessons
- 08-final-report — final chapters, references, figures, tables, and appendices
- 09-publication — PDF build, visual QA, and submission checklist

## Status

**PDF package exists in the repository.** Screenshot placeholders still need synthetic captures before university binding.
