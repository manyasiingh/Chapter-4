using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSpinRewardOptionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SpinRewardOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RewardType = table.Column<string>(type: "TEXT", nullable: false),
                    RewardValue = table.Column<string>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpinRewardOptions", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "SpinRewardOptions",
                columns: new[] { "Id", "IsActive", "RewardType", "RewardValue", "SortOrder" },
                values: new object[,]
                {
                    { 1, true, "DISCOUNT", "5%", 1 },
                    { 2, true, "DISCOUNT", "10%", 2 },
                    { 3, true, "DISCOUNT", "20%", 3 },
                    { 4, true, "POINTS", "50", 4 },
                    { 5, true, "POINTS", "100", 5 },
                    { 6, true, "FREE_DELIVERY", "YES", 6 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SpinRewardOptions");
        }
    }
}
