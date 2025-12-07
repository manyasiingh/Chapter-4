using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedPaymentTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "PaymentTransactions");

            migrationBuilder.DropColumn(
                name: "RawResponse",
                table: "PaymentTransactions");

            migrationBuilder.RenameColumn(
                name: "Receipt",
                table: "PaymentTransactions",
                newName: "UserEmail");

            migrationBuilder.RenameColumn(
                name: "AmountPaise",
                table: "PaymentTransactions",
                newName: "Amount");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserEmail",
                table: "PaymentTransactions",
                newName: "Receipt");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "PaymentTransactions",
                newName: "AmountPaise");

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "PaymentTransactions",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RawResponse",
                table: "PaymentTransactions",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
