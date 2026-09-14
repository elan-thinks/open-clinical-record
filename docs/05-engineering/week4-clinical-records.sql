-- Week 4: expand Patients + clinical records tables
-- Safe to re-run: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS (Postgres)

ALTER TABLE "Patients" ADD COLUMN IF NOT EXISTS "Status" character varying(32) NOT NULL DEFAULT 'Active';
ALTER TABLE "Patients" ADD COLUMN IF NOT EXISTS "NationalId" character varying(64) NULL;
ALTER TABLE "Patients" ADD COLUMN IF NOT EXISTS "SecondaryPhone" character varying(40) NULL;
ALTER TABLE "Patients" ADD COLUMN IF NOT EXISTS "Address" character varying(256) NULL;
ALTER TABLE "Patients" ADD COLUMN IF NOT EXISTS "City" character varying(100) NULL;
ALTER TABLE "Patients" ADD COLUMN IF NOT EXISTS "EmergencyContactName" character varying(120) NULL;
ALTER TABLE "Patients" ADD COLUMN IF NOT EXISTS "PreferredLanguage" character varying(64) NULL;
ALTER TABLE "Patients" ADD COLUMN IF NOT EXISTS "InsuranceScheme" character varying(120) NULL;
ALTER TABLE "Patients" ADD COLUMN IF NOT EXISTS "Notes" character varying(500) NULL;

CREATE TABLE IF NOT EXISTS "PatientAllergies" (
    "Id" uuid NOT NULL,
    "PatientId" uuid NOT NULL,
    "Substance" character varying(200) NOT NULL,
    "Reaction" character varying(200) NULL,
    "Severity" character varying(32) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_PatientAllergies" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_PatientAllergies_Patients_PatientId" FOREIGN KEY ("PatientId") REFERENCES "Patients" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_PatientAllergies_PatientId" ON "PatientAllergies" ("PatientId");

CREATE TABLE IF NOT EXISTS "MedicalHistoryItems" (
    "Id" uuid NOT NULL,
    "PatientId" uuid NOT NULL,
    "Category" character varying(32) NOT NULL,
    "Description" character varying(500) NOT NULL,
    "OnsetDate" date NULL,
    "IsActive" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_MedicalHistoryItems" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_MedicalHistoryItems_Patients_PatientId" FOREIGN KEY ("PatientId") REFERENCES "Patients" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_MedicalHistoryItems_PatientId" ON "MedicalHistoryItems" ("PatientId");

CREATE TABLE IF NOT EXISTS "ClinicalVisits" (
    "Id" uuid NOT NULL,
    "PatientId" uuid NOT NULL,
    "VisitDate" timestamp with time zone NOT NULL,
    "VisitType" character varying(40) NOT NULL,
    "Status" character varying(32) NOT NULL,
    "ChiefComplaint" character varying(500) NULL,
    "Plan" character varying(1000) NULL,
    "Instructions" character varying(500) NULL,
    "ClinicianUserId" character varying(450) NULL,
    "ClinicianName" character varying(200) NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NULL,
    CONSTRAINT "PK_ClinicalVisits" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ClinicalVisits_Patients_PatientId" FOREIGN KEY ("PatientId") REFERENCES "Patients" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_ClinicalVisits_PatientId" ON "ClinicalVisits" ("PatientId");
CREATE INDEX IF NOT EXISTS "IX_ClinicalVisits_VisitDate" ON "ClinicalVisits" ("VisitDate");

CREATE TABLE IF NOT EXISTS "VitalSigns" (
    "Id" uuid NOT NULL,
    "VisitId" uuid NOT NULL,
    "BloodPressure" character varying(20) NULL,
    "Pulse" integer NULL,
    "TemperatureC" numeric(4,1) NULL,
    "Spo2" integer NULL,
    "WeightKg" numeric(6,2) NULL,
    "HeightCm" numeric(5,1) NULL,
    "RecordedByUserId" character varying(450) NULL,
    "RecordedByName" character varying(200) NULL,
    "RecordedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_VitalSigns" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_VitalSigns_ClinicalVisits_VisitId" FOREIGN KEY ("VisitId") REFERENCES "ClinicalVisits" ("Id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_VitalSigns_VisitId" ON "VitalSigns" ("VisitId");

CREATE TABLE IF NOT EXISTS "Diagnoses" (
    "Id" uuid NOT NULL,
    "VisitId" uuid NOT NULL,
    "IsPrimary" boolean NOT NULL,
    "Code" character varying(32) NULL,
    "Description" character varying(500) NOT NULL,
    CONSTRAINT "PK_Diagnoses" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Diagnoses_ClinicalVisits_VisitId" FOREIGN KEY ("VisitId") REFERENCES "ClinicalVisits" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_Diagnoses_VisitId" ON "Diagnoses" ("VisitId");

CREATE TABLE IF NOT EXISTS "ClinicalNotes" (
    "Id" uuid NOT NULL,
    "VisitId" uuid NOT NULL,
    "NoteType" character varying(32) NOT NULL,
    "Content" text NOT NULL,
    "AuthorUserId" character varying(450) NULL,
    "AuthorName" character varying(200) NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ClinicalNotes" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ClinicalNotes_ClinicalVisits_VisitId" FOREIGN KEY ("VisitId") REFERENCES "ClinicalVisits" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_ClinicalNotes_VisitId" ON "ClinicalNotes" ("VisitId");
