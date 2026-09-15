# OCR data / database docs

| File | Purpose |
|------|--------|
| [`ocr-complete-database.sql`](./ocr-complete-database.sql) | Full PostgreSQL reference schema matching EF Core (Week 4) |
| [`ocr-database-audit.md`](./ocr-database-audit.md) | Table inventory, conflicts, checklist |

## Apply schema

**Preferred for the running app:**

```bash
cd src/backend/OpenClinicalRecord.Api
dotnet ef database update
```

**Reference script (empty DB / documentation):**

From the **repository root**:

```powershell
psql -U postgres -d open_clinical_record -f docs/05-data/ocr-complete-database.sql
```

If you get `No such file or directory`, you are not in the repo root. Example:

```powershell
cd D:\edHil ╝\Intern\Home_code\open-clinical-record\open-clinical-record
psql -U postgres -d open_clinical_record -f docs/05-data/ocr-complete-database.sql
```

Or use an absolute path to the `.sql` file.
