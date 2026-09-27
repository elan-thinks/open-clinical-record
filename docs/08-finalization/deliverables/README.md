# Submission PDFs

## Ready-to-submit files (full quality)

These three PDFs should live in this folder:

| File | Description |
|------|-------------|
| `OCR-SRS-v2.pdf` | Software Requirements Specification v2.0 (9 pages) |
| `OCR-User-Manual.pdf` | User Manual (7 pages) |
| `OCR-Technical-Documentation.pdf` | Technical Documentation (8 pages) |

### Option A — from your machine (recommended)

```bash
git pull origin main
# copy the three PDFs into docs/08-finalization/deliverables/
git add docs/08-finalization/deliverables/*.pdf
git commit -m "docs(final): add submission PDFs"
git push origin main
```

### Option B — GitHub website

1. Open `docs/08-finalization/deliverables/` on GitHub
2. **Add file → Upload files**
3. Drop the three PDFs → Commit

### Rebuild from LaTeX

```bash
cd latex
pdflatex ocr-srs.tex && pdflatex ocr-srs.tex
pdflatex ocr-user-manual.tex && pdflatex ocr-user-manual.tex
pdflatex ocr-technical-documentation.tex && pdflatex ocr-technical-documentation.tex
```

> **Note:** Automation cannot push raw binary PDFs through the text file API without corruption (UTF-8). Local `git push` or the GitHub web uploader handles binaries correctly.

LaTeX sources are in `latex/` (restored and non-empty).
