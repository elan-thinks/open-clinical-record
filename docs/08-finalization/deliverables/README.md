# Final deliverable documents (LaTeX / PDF)

Professional PDF packages for internship submission. Rebuild with `pdflatex` (run twice for TOC):

```bash
cd docs/08-finalization/deliverables/latex
pdflatex ocr-srs.tex && pdflatex ocr-srs.tex
pdflatex ocr-user-manual.tex && pdflatex ocr-user-manual.tex
pdflatex ocr-technical-documentation.tex && pdflatex ocr-technical-documentation.tex
```

| Document | LaTeX source | Output PDF (build locally or use submission copies) |
|----------|--------------|------------------------------------------------------|
| **Software Requirements Specification v2.0** | `latex/ocr-srs.tex` | OCR-SRS-v2.pdf |
| **User Manual** | `latex/ocr-user-manual.tex` | OCR-User-Manual.pdf |
| **Technical Documentation** | `latex/ocr-technical-documentation.tex` | OCR-Technical-Documentation.pdf |

Markdown counterparts remain under `docs/03-requirements/srs/SRS.md`, `docs/08-finalization/user-guide.md`, and `docs/08-finalization/technical-documentation.md`.
