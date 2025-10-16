using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EcommerceAPI.Services;

namespace EcommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StorageController : ControllerBase
    {
        private readonly AzureStorageService _storageService;
        private readonly ILogger<StorageController> _logger;

        public StorageController(AzureStorageService storageService, ILogger<StorageController> logger)
        {
            _storageService = storageService;
            _logger = logger;
        }

        [HttpPost("upload-token")]
        public async Task<IActionResult> GetUploadToken([FromBody] GetUploadTokenRequest request)
        {
            try
            {
                // Generate unique filename
                var fileExtension = Path.GetExtension(request.FileName) ?? ".jpg";
                var uniqueFileName = $"product-{DateTime.UtcNow:yyyyMMdd-HHmmss}-{Guid.NewGuid():N}{fileExtension}";

                var sasUrl = await _storageService.GenerateUploadSasTokenAsync(uniqueFileName);
                var publicUrl = _storageService.GetBlobUrl(uniqueFileName);

                return Ok(new GetUploadTokenResponse
                {
                    UploadUrl = sasUrl,
                    PublicUrl = publicUrl,
                    FileName = uniqueFileName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating upload token for file: {FileName}", request.FileName);
                return StatusCode(500, new { message = "Failed to generate upload token" });
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteImage([FromBody] DeleteImageRequest request)
        {
            try
            {
                var success = await _storageService.DeleteBlobAsync(request.ImageUrl);
                
                if (success)
                {
                    return Ok(new { message = "Image deleted successfully" });
                }
                else
                {
                    return NotFound(new { message = "Image not found or already deleted" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image: {ImageUrl}", request.ImageUrl);
                return StatusCode(500, new { message = "Failed to delete image" });
            }
        }
    }

    public class GetUploadTokenRequest
    {
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
    }

    public class GetUploadTokenResponse
    {
        public string UploadUrl { get; set; } = string.Empty;
        public string PublicUrl { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
    }

    public class DeleteImageRequest
    {
        public string ImageUrl { get; set; } = string.Empty;
    }
}