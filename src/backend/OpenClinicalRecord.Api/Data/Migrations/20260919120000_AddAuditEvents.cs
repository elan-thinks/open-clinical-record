using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OpenClinicalRecord.Api.Data.Migrations;

/// <inheritdoc />
public partial class AddAuditEvents : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "AuditEvents",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Action = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                EntityType = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                EntityId = table.Column<Guid>(type: "uuid", nullable: true),
                ActorUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                ActorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                Summary = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                CorrelationId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AuditEvents", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_AuditEvents_Action",
            table: "AuditEvents",
            column: "Action");

        migrationBuilder.CreateIndex(
            name: "IX_AuditEvents_CreatedAt",
            table: "AuditEvents",
            column: "CreatedAt");

        migrationBuilder.CreateIndex(
            name: "IX_AuditEvents_EntityType_EntityId",
            table: "AuditEvents",
            columns: new[] { "EntityType", "EntityId" });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "AuditEvents");
    }
}
