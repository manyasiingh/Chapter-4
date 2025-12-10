using System.IO;

public static class DbSeeder
{
    public static void SeedFromFile(string sourceDbPath, string targetDbPath)
    {
        // Extract actual path from connection string
        targetDbPath = targetDbPath.Replace("Data Source=", "").Trim();
        
        // Ensure directory exists
        var directory = Path.GetDirectoryName(targetDbPath);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
            Console.WriteLine($"Created directory: {directory}");
        }
        
        // Copy database if target doesn't exist
        if (!File.Exists(targetDbPath) && File.Exists(sourceDbPath))
        {
            Console.WriteLine($"📦 Seeding database from {sourceDbPath} to {targetDbPath}");
            File.Copy(sourceDbPath, targetDbPath, true);
            Console.WriteLine("✅ Database seeded successfully!");
        }
        else if (File.Exists(targetDbPath))
        {
            Console.WriteLine($"✅ Database already exists at {targetDbPath}");
        }
        else
        {
            Console.WriteLine($"❌ Source database not found at {sourceDbPath}");
        }
    }
}