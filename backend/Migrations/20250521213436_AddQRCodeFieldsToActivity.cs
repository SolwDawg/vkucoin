using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddQRCodeFieldsToActivity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "QrCodeIdentifier",
                table: "Activities",
                newName: "QrCodeUrl");

            migrationBuilder.AddColumn<DateTime>(
                name: "QrCodeExpiration",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QrCodeToken",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QrCodeExpiration",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "QrCodeToken",
                table: "Activities");

            migrationBuilder.RenameColumn(
                name: "QrCodeUrl",
                table: "Activities",
                newName: "QrCodeIdentifier");
        }
    }
}
