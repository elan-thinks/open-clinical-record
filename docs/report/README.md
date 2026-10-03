# Industrial Practice Report

This directory is the production workspace for the final Industrial Practice Report for the Open Clinical Record (OCR) internship project.

## Final PDF

**Industrial Internship Report (PDF):**

- [`Open-Clinical-Record-Industrial-Internship-Report.md`](./Open-Clinical-Record-Industrial-Internship-Report.md) — summary pointer
- `Open-Clinical-Record-Industrial-Internship-Report.pdf` — full report (~119 pages)

Add the PDF to this folder on `main` if it is not already present:

```bash
# from a clean clone of open-clinical-record
mkdir -p docs/report
cp /path/to/Open-Clinical-Record-Industrial-Internship-Report.pdf docs/report/
git add docs/report/Open-Clinical-Record-Industrial-Internship-Report.pdf
git commit -m "docs(report): add Industrial Internship Report PDF"
git push origin main
```

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
- 09-publication — LaTeX/PDF build, visual QA, and submission checklist

## Status

**Final PDF packaged for submission.** Screenshot placeholders still need synthetic captures before university binding.
