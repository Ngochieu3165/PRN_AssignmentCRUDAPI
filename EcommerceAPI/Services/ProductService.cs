using EcommerceAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace EcommerceAPI.Services
{
    public class ProductService
    {
        private readonly IMongoCollection<Product> _products;

        public ProductService(IOptions<DatabaseSettings> databaseSettings)
        {
            var mongoClient = new MongoClient(databaseSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(databaseSettings.Value.DatabaseName);
            _products = mongoDatabase.GetCollection<Product>(databaseSettings.Value.ProductsCollectionName);
        }

        public async Task<List<Product>> GetAsync() =>
            await _products.Find(_ => true).ToListAsync();

        public async Task<Product?> GetAsync(string id) =>
            await _products.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Product newProduct)
        {
            newProduct.CreatedAt = DateTime.UtcNow;
            newProduct.UpdatedAt = DateTime.UtcNow;
            await _products.InsertOneAsync(newProduct);
        }

        public async Task UpdateAsync(string id, Product updatedProduct)
        {
            updatedProduct.UpdatedAt = DateTime.UtcNow;
            await _products.ReplaceOneAsync(x => x.Id == id, updatedProduct);
        }

        public async Task RemoveAsync(string id) =>
            await _products.DeleteOneAsync(x => x.Id == id);
    }
}