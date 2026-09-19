using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OpenClinicalRecord.Api.Data.Migrations;

/// <summary>
/// Repairs ClinicalVisits columns that earlier hand-written migrations never applied
/// because they lacked [Migration] attributes and were not discovered by EF.
/// Uses IF NOT EXISTS so it is safe if columns were added manually.
/// </summary>
[DbContext(typeof(OpenClinicalRecord.Api.Data.AppDbContext))]
[Migration("20260919153000_FixClinicalVisitColumns")]
public partial class FixClinicalVisitColumns : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            ALTER TABLE public."ClinicalVisits" ADD COLUMN IF NOT EXISTS "AppointmentId" uuid NULL;
            ALTER TABLE public."ClinicalVisits" ADD COLUMN IF NOT EXISTS "EpisodeLabel" character varying(200) NULL;
            ALTER TABLE public."ClinicalVisits" ADD COLUMN IF NOT EXISTS "Location" character varying(120) NULL;
            ALTER TABLE public."ClinicalVisits" ADD COLUMN IF NOT EXISTS "Department" character varying(120) NULL;
            ALTER TABLE public."ClinicalVisits" ADD COLUMN IF NOT EXISTS "CheckInAt" timestamp with time zone NULL;
            ALTER TABLE public."ClinicalVisits" ADD COLUMN IF NOT EXISTS "CheckOutAt" timestamp with time zone NULL;
            ALTER TABLE public."ClinicalVisits" ADD COLUMN IF NOT EXISTS "FinalizedAt" timestamp with time zone NULL;
            ALTER TABLE public."ClinicalVisits" ADD COLUMN IF NOT EXISTS "FinalizedByUserId" character varying(450) NULL;
            ALTER TABLE public."ClinicalVisits" ADD COLUMN IF NOT EXISTS "FinalizedByName" character varying(200) NULL;

            CREATE INDEX IF NOT EXISTS "IX_ClinicalVisits_AppointmentId"
              ON public."ClinicalVisits" ("AppointmentId");

            DO $ef$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'FK_ClinicalVisits_Appointments_AppointmentId'
              ) THEN
                ALTER TABLE public."ClinicalVisits"
                  ADD CONSTRAINT "FK_ClinicalVisits_Appointments_AppointmentId"
                  FOREIGN KEY ("AppointmentId") REFERENCES public."Appointments" ("Id")
                  ON DELETE SET NULL;
              END IF;
            END
            $ef$;

            CREATE TABLE IF NOT EXISTS public."AuditEvents" (
              "Id" uuid NOT NULL,
              "Action" character varying(80) NOT NULL,
              "EntityType" character varying(40) NOT NULL,
              "EntityId" uuid NULL,
              "ActorUserId" character varying(450) NULL,
              "ActorName" character varying(200) NULL,
              "Summary" character varying(500) NULL,
              "CorrelationId" character varying(64) NULL,
              "CreatedAt" timestamp with time zone NOT NULL,
              CONSTRAINT "PK_AuditEvents" PRIMARY KEY ("Id")
            );

            CREATE INDEX IF NOT EXISTS "IX_AuditEvents_Action" ON public."AuditEvents" ("Action");
            CREATE INDEX IF NOT EXISTS "IX_AuditEvents_CreatedAt" ON public."AuditEvents" ("CreatedAt");
            CREATE INDEX IF NOT EXISTS "IX_AuditEvents_EntityType_EntityId"
              ON public."AuditEvents" ("EntityType", "EntityId");
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Non-destructive: do not drop columns that may hold clinical data.
    }
}
