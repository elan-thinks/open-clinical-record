using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OpenClinicalRecord.Api.Data.Migrations;

[DbContext(typeof(OpenClinicalRecord.Api.Data.AppDbContext))]
[Migration("20260919160000_AddMustChangePassword")]
public partial class AddMustChangePassword : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            ALTER TABLE public."AspNetUsers"
              ADD COLUMN IF NOT EXISTS "MustChangePassword" boolean NOT NULL DEFAULT FALSE;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            ALTER TABLE public."AspNetUsers" DROP COLUMN IF EXISTS "MustChangePassword";
            """);
    }
}
