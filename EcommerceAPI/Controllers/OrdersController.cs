using EcommerceAPI.Models;
using EcommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly CartService _cartService;

        public OrdersController(OrderService orderService, CartService cartService)
        {
            _orderService = orderService;
            _cartService = cartService;
        }

        private string GetUserId() => User.FindFirstValue("sub") ?? string.Empty;

        [HttpPost]
        public async Task<ActionResult<Order>> Create()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var cart = await _cartService.GetOrCreateAsync(userId);
            if (cart.Items.Count == 0) return BadRequest("Cart is empty");
            var order = await _orderService.CreateFromCartAsync(userId, cart);
            await _cartService.ClearAsync(userId);
            return Ok(order);
        }

        [HttpGet]
        public async Task<ActionResult<List<Order>>> GetMine()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var orders = await _orderService.GetByUserAsync(userId);
            return Ok(orders);
        }

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Order>> GetById(string id)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var order = await _orderService.GetAsync(id, userId);
            if (order == null) return NotFound();
            return Ok(order);
        }
    }
}

