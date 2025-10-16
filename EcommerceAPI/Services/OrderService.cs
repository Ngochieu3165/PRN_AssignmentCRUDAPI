using EcommerceAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace EcommerceAPI.Services
{
    public class OrderService
    {
        private readonly IMongoCollection<Order> _orders;

        public OrderService(IOptions<DatabaseSettings> databaseSettings)
        {
            var mongoClient = new MongoClient(databaseSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(databaseSettings.Value.DatabaseName);
            _orders = mongoDatabase.GetCollection<Order>(databaseSettings.Value.OrdersCollectionName);
        }

        public async Task<Order> CreateFromCartAsync(string userId, Cart cart)
        {
            var total = cart.Items.Sum(i => i.Price * i.Quantity);
            var order = new Order
            {
                UserId = userId,
                Items = cart.Items,
                TotalAmount = total,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };
            await _orders.InsertOneAsync(order);
            return order;
        }

        public async Task<List<Order>> GetByUserAsync(string userId) =>
            await _orders.Find(o => o.UserId == userId).SortByDescending(o => o.CreatedAt).ToListAsync();

        public async Task<Order?> GetAsync(string id, string userId) =>
            await _orders.Find(o => o.Id == id && o.UserId == userId).FirstOrDefaultAsync();

        public async Task SetStripeSessionAsync(string orderId, string sessionId)
        {
            var update = Builders<Order>.Update.Set(o => o.StripeSessionId, sessionId);
            await _orders.UpdateOneAsync(o => o.Id == orderId, update);
        }

        public async Task MarkPaidBySessionAsync(string sessionId)
        {
            var update = Builders<Order>.Update.Set(o => o.Status, "paid");
            await _orders.UpdateOneAsync(o => o.StripeSessionId == sessionId, update);
        }
    }
}

