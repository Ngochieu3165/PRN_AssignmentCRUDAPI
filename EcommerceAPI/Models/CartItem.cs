using MongoDB.Bson.Serialization.Attributes;

namespace EcommerceAPI.Models
{
    public class CartItem
    {
        [BsonElement("productId")]
        public string ProductId { get; set; } = string.Empty;

        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("price")]
        public decimal Price { get; set; }

        [BsonElement("image")]
        public string? Image { get; set; }

        [BsonElement("quantity")]
        public int Quantity { get; set; }
    }
}

