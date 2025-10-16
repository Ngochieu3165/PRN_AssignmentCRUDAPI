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
    public class CartController : ControllerBase
    {
        private readonly CartService _cartService;

        public CartController(CartService cartService)
        {
            _cartService = cartService;
        }

        private string GetUserId()
        {
            return User.FindFirstValue("sub") ?? string.Empty;
        }

        [HttpGet]
        public async Task<ActionResult<Cart>> Get()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var cart = await _cartService.GetOrCreateAsync(userId);
            return Ok(cart);
        }

        public class ModifyItemDto { public string ProductId { get; set; } = string.Empty; public int Quantity { get; set; } }

        [HttpPost("items")]
        public async Task<ActionResult<Cart>> AddOrUpdateItem([FromBody] ModifyItemDto body)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var cart = await _cartService.AddOrUpdateItemAsync(userId, body.ProductId, body.Quantity);
            return Ok(cart);
        }

        [HttpDelete("items/{productId}")]
        public async Task<ActionResult<Cart>> RemoveItem(string productId)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var cart = await _cartService.RemoveItemAsync(userId, productId);
            return Ok(cart);
        }

        [HttpDelete]
        public async Task<IActionResult> Clear()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            await _cartService.ClearAsync(userId);
            return NoContent();
        }
    }
}

