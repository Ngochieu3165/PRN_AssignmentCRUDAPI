using EcommerceAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace EcommerceAPI.Services
{
    public class CartService
    {
        private readonly IMongoCollection<Cart> _carts;
        private readonly IMongoCollection<Product> _products;

        public CartService(IOptions<DatabaseSettings> databaseSettings)
        {
            var mongoClient = new MongoClient(databaseSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(databaseSettings.Value.DatabaseName);
            _carts = mongoDatabase.GetCollection<Cart>(databaseSettings.Value.CartsCollectionName);
            _products = mongoDatabase.GetCollection<Product>(databaseSettings.Value.ProductsCollectionName);
        }

        public async Task<Cart> GetOrCreateAsync(string userId)
        {
            var cart = await _carts.Find(c => c.UserId == userId).FirstOrDefaultAsync();
            if (cart == null)
            {
                cart = new Cart { UserId = userId, Items = new List<CartItem>() };
                await _carts.InsertOneAsync(cart);
            }
            return cart;
        }

        public async Task<Cart> AddOrUpdateItemAsync(string userId, string productId, int quantity)
        {
            var product = await _products.Find(p => p.Id == productId).FirstOrDefaultAsync();
            if (product == null)
            {
                throw new KeyNotFoundException("Product not found");
            }

            var cart = await GetOrCreateAsync(userId);
            var existing = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (existing == null)
            {
                cart.Items.Add(new CartItem
                {
                    ProductId = productId,
                    Name = product.Name,
                    Price = product.Price,
                    Image = product.Image,
                    Quantity = Math.Max(1, quantity)
                });
            }
            else
            {
                var newQty = existing.Quantity + Math.Max(1, quantity);
                existing.Quantity = newQty;
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
            return cart;
        }

        public async Task<Cart> RemoveItemAsync(string userId, string productId)
        {
            var cart = await GetOrCreateAsync(userId);
            cart.Items = cart.Items.Where(i => i.ProductId != productId).ToList();
            cart.UpdatedAt = DateTime.UtcNow;
            await _carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
            return cart;
        }

        public async Task ClearAsync(string userId)
        {
            var cart = await GetOrCreateAsync(userId);
            cart.Items.Clear();
            cart.UpdatedAt = DateTime.UtcNow;
            await _carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
        }
    }
}

