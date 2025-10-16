using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthTestController : ControllerBase
    {
        [HttpGet("public")]
        public IActionResult Public()
        {
            return Ok(new { message = "This is a public endpoint", timestamp = DateTime.UtcNow });
        }

        [HttpGet("protected")]
        [Authorize]
        public IActionResult Protected()
        {
            var userId = User.FindFirstValue("sub");
            var email = User.FindFirstValue("email");
            var role = User.FindFirstValue("role");

            return Ok(new
            {
                message = "This is a protected endpoint",
                userId = userId,
                email = email,
                role = role,
                isAuthenticated = User.Identity?.IsAuthenticated,
                claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList(),
                timestamp = DateTime.UtcNow
            });
        }
    }
}