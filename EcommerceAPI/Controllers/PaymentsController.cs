using EcommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;

namespace EcommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly IConfiguration _config;

        public PaymentsController(OrderService orderService, IConfiguration config)
        {
            _orderService = orderService;
            _config = config;
        }

        public class CheckoutRequest { public string OrderId { get; set; } = string.Empty; }

        [HttpPost("checkout-session")]
        [Authorize]
        public async Task<ActionResult<object>> CreateCheckoutSession([FromBody] CheckoutRequest body)
        {
            StripeConfiguration.ApiKey = _config["Stripe:SecretKey"];

            var order = await _orderService.GetAsync(body.OrderId, User.FindFirst("sub")?.Value ?? "");
            if (order == null) return NotFound();

            var domain = _config["App:FrontendBaseUrl"] ?? "http://localhost:3000";

            var options = new SessionCreateOptions
            {
                Mode = "payment",
                SuccessUrl = $"{domain}/checkout/success",
                CancelUrl = $"{domain}/checkout/cancel",
                LineItems = order.Items.Select(i => new SessionLineItemOptions
                {
                    Quantity = i.Quantity,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "usd",
                        UnitAmountDecimal = i.Price * 100, // cents
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = i.Name,
                            Images = string.IsNullOrEmpty(i.Image) ? null : new List<string> { i.Image }
                        }
                    }
                }).ToList()
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);
            await _orderService.SetStripeSessionAsync(order.Id!, session.Id);
            return Ok(new { url = session.Url });
        }

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            try
            {
                var signatureHeader = Request.Headers["Stripe-Signature"]; 
                var secret = _config["Stripe:WebhookSecret"];
                var stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, secret);

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;
                    if (session != null)
                    {
                        await _orderService.MarkPaidBySessionAsync(session.Id);
                    }
                }
                return Ok();
            }
            catch (StripeException)
            {
                return BadRequest();
            }
        }
    }
}

