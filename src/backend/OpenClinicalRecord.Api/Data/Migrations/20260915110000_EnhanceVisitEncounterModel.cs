using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OpenClinicalRecord.Api.Data.Migrations;

/// <inheritdoc />
public partial class EnhanceVisitEncounterModel : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "AppointmentId",
            table: "ClinicalVisits",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "EpisodeLabel",
            table: "ClinicalVisits",
            type: "character varying(200)",
            maxLength: 200,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Location",
            table: "ClinicalVisits",
            type: "character varying(120)",
            maxLength: 120,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Department",
            table: "ClinicalVisits",
            type: "character varying(120)",
            maxLength: 120,
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "CheckInAt",
            table: "ClinicalVisits",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "CheckOutAt",
            table: "ClinicalVisits",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_ClinicalVisits_AppointmentId",
            table: "ClinicalVisits",
            column: "AppointmentId");

        migrationBuilder.AddForeignKey(
            name: "FK_ClinicalVisits_Appointments_AppointmentId",
            table: "ClinicalVisits",
            column: "AppointmentId",
            principalTable: "Appointments",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_ClinicalVisits_Appointments_AppointmentId",
            table: "ClinicalVisits");

        migrationBuilder.DropIndex(
            name: "IX_ClinicalVisits_AppointmentId",
            table: "ClinicalVisits");

        migrationBuilder.DropColumn(name: "AppointmentId", table: "ClinicalVisits");
        migrationBuilder.DropColumn(name: "EpisodeLabel", table: "ClinicalVisits");
        migrationBuilder.DropColumn(name: "Location", table: "ClinicalVisits");
        migrationBuilder.DropColumn(name: "Department", table: "ClinicalVisits");
        migrationBuilder.DropColumn(name: "CheckInAt", table: "ClinicalVisits");
        migrationBuilder.DropColumn(name: "CheckOutAt", table: "ClinicalVisits");
    }
}
