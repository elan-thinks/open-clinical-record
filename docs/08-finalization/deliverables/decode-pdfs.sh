#!/usr/bin/env bash
# Decode submission PDFs from base64 sidecars (GitHub text-safe storage)
set -euo pipefail
cd "$(dirname "$0")"
for f in OCR-SRS-v2.pdf OCR-User-Manual.pdf OCR-Technical-Documentation.pdf; do
  if [[ -f "${f}.b64" ]]; then
    base64 -d "${f}.b64" > "$f"
    echo "Wrote $f ($(wc -c < "$f") bytes)"
  fi
done
echo "Done. Open the PDF files in this folder."
