# Submission PDFs

The three internship submission PDFs are stored as **base64 text** (`.pdf.b64`) so they remain intact on GitHub.

## Get the PDF files

```bash
cd docs/08-finalization/deliverables
chmod +x decode-pdfs.sh
./decode-pdfs.sh
```

This creates:

| File | Description |
|------|-------------|
| `OCR-SRS-v2.pdf` | Software Requirements Specification v2.0 |
| `OCR-User-Manual.pdf` | User Manual |
| `OCR-Technical-Documentation.pdf` | Technical Documentation |

LaTeX sources are in `latex/` if you need to rebuild from source.

> **Why `.b64`?** The GitHub file-write API transports content as UTF-8 text. Raw binary PDFs would be corrupted. Base64 is pure ASCII and decodes to the original PDF.
