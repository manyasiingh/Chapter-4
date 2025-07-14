using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Models;

public class BookJsonConverter : JsonConverter<Book>
{
    public override Book Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using var jsonDoc = JsonDocument.ParseValue(ref reader);
        var root = jsonDoc.RootElement;

        if (!root.TryGetProperty("category", out var categoryProp))
            throw new JsonException("Missing 'category' property.");

        var categoryValue = categoryProp.GetString();
        if (string.IsNullOrWhiteSpace(categoryValue))
            throw new JsonException("Category is null or empty.");

        var category = categoryValue.ToLower();

        return category switch
        {
            "medical" => JsonSerializer.Deserialize<MedicalBook>(root.GetRawText(), options)
                ?? throw new JsonException("Failed to deserialize MedicalBook."),
            "fiction" => JsonSerializer.Deserialize<FictionBook>(root.GetRawText(), options)
                ?? throw new JsonException("Failed to deserialize FictionBook."),
            "educational" => JsonSerializer.Deserialize<EducationalBook>(root.GetRawText(), options)
                ?? throw new JsonException("Failed to deserialize EducationalBook."),
            "indian" => JsonSerializer.Deserialize<IndianBook>(root.GetRawText(), options)
                ?? throw new JsonException("Failed to deserialize IndianBook."),
            _ => throw new JsonException($"Unknown category: {category}")
        };
    }

    public override void Write(Utf8JsonWriter writer, Book value, JsonSerializerOptions options)
    {
        JsonSerializer.Serialize(writer, (object)value, value.GetType(), options);
    }
}
