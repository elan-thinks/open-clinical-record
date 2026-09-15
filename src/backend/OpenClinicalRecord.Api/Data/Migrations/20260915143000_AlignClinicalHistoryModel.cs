using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OpenClinicalRecord.Api.Data.Migrations;

/// <inheritdoc />
public partial class AlignClinicalHistoryModel : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Preserve patient-owned clinical history instead of cascading it away.
        migrationBuilder.DropForeignKey(
            name: "FK_PatientAllergies_Patients_PatientId",
            table: "PatientAllergies");

        migrationBuilder.DropForeignKey(
            name: "FK_MedicalHistoryItems_Patients_PatientId",
            table: "MedicalHistoryItems");

        migrationBuilder.DropForeignKey(
            name: "FK_ClinicalVisits_Patients_PatientId",
            table: "ClinicalVisits");

        migrationBuilder.DropForeignKey(
            name: "FK_Appointments_Patients_PatientId",
            table: "Appointments");

        migrationBuilder.AddForeignKey(
            name: "FK_PatientAllergies_Patients_PatientId",
            table: "PatientAllergies",
            column: "PatientId",
            principalTable: "Patients",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_MedicalHistoryItems_Patients_PatientId",
            table: "MedicalHistoryItems",
            column: "PatientId",
            principalTable: "Patients",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_ClinicalVisits_Patients_PatientId",
            table: "ClinicalVisits",
            column: "PatientId",
            principalTable: "Patients",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_Appointments_Patients_PatientId",
            table: "Appointments",
            column: "PatientId",
            principalTable: "Patients",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        // Keep the database-level invariants explicit.
        migrationBuilder.AddCheckConstraint(
            name: "CK_Patients_Status",
            table: "Patients",
            sql: "\"Status\" IN ('Active', 'Inactive', 'Deceased')");

        migrationBuilder.AddCheckConstraint(
            name: "CK_ClinicalVisits_Status",
            table: "ClinicalVisits",
            sql: "\"Status\" IN ('Draft', 'Final', 'Cancelled')");

        // Appointment status changes are retained as an event history.
        migrationBuilder.CreateTable(
            name: "AppointmentEvents",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                AppointmentId = table.Column<Guid>(type: "uuid", nullable: false),
                FromStatus = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                ToStatus = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                ActorUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                ActorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AppointmentEvents", x => x.Id);
                table.ForeignKey(
                    name: "FK_AppointmentEvents_Appointments_AppointmentId",
                    column: x => x.AppointmentId,
                    principalTable: "Appointments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_AppointmentEvents_AppointmentId",
            table: "AppointmentEvents",
            column: "AppointmentId");

        // Death status is provenance, not patient deletion.
        migrationBuilder.CreateTable(
            name: "PatientDeathRecords",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                DateOfDeath = table.Column<DateOnly>(type: "date", nullable: true),
                Note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                RecordedByUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                RecordedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                RecordedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                ClearedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                ClearedByUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                ClearedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                IsActive = table.Column<bool>(type: "boolean", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PatientDeathRecords", x => x.Id);
                table.ForeignKey(
                    name: "FK_PatientDeathRecords_Patients_PatientId",
                    column: x => x.PatientId,
                    principalTable: "Patients",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_PatientDeathRecords_PatientId",
            table: "PatientDeathRecords",
            column: "PatientId");

        migrationBuilder.CreateIndex(
            name: "UX_PatientDeathRecords_ActivePatient",
            table: "PatientDeathRecords",
            column: "PatientId",
            unique: true,
            filter: "\"IsActive\" = TRUE");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "PatientDeathRecords");
        migrationBuilder.DropTable(name: "AppointmentEvents");

        migrationBuilder.DropCheckConstraint(
            name: "CK_ClinicalVisits_Status",
            table: "ClinicalVisits");

        migrationBuilder.DropCheckConstraint(
            name: "CK_Patients_Status",
            table: "Patients");

        migrationBuilder.DropForeignKey(
            name: "FK_PatientAllergies_Patients_PatientId",
            table: "PatientAllergies");

        migrationBuilder.DropForeignKey(
            name: "FK_MedicalHistoryItems_Patients_PatientId",
            table: "MedicalHistoryItems");

        migrationBuilder.DropForeignKey(
            name: "FK_ClinicalVisits_Patients_PatientId",
            table: "ClinicalVisits");

        migrationBuilder.DropForeignKey(
            name: "FK_Appointments_Patients_PatientId",
            table: "Appointments");

        migrationBuilder.AddForeignKey(
            name: "FK_PatientAllergies_Patients_PatientId",
            table: "PatientAllergies",
            column: "PatientId",
            principalTable: "Patients",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_MedicalHistoryItems_Patients_PatientId",
            table: "MedicalHistoryItems",
            column: "PatientId",
            principalTable: "Patients",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_ClinicalVisits_Patients_PatientId",
            table: "ClinicalVisits",
            column: "PatientId",
            principalTable: "Patients",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_Appointments_Patients_PatientId",
            table: "Appointments",
            column: "PatientId",
            principalTable: "Patients",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }
}
