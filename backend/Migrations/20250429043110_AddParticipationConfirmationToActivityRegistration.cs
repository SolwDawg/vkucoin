using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddParticipationConfirmationToActivityRegistration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsParticipationConfirmed",
                table: "ActivityRegistrations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ParticipationConfirmedAt",
                table: "ActivityRegistrations",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsParticipationConfirmed",
                table: "ActivityRegistrations");

            migrationBuilder.DropColumn(
                name: "ParticipationConfirmedAt",
                table: "ActivityRegistrations");
        }
    }
}
