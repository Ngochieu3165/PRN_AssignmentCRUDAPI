using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Azure.Storage;

namespace EcommerceAPI.Services
{
    public class AzureStorageService
    {
        private readonly BlobServiceClient? _blobServiceClient;
        private readonly string _containerName;
        private readonly ILogger<AzureStorageService> _logger;

        public AzureStorageService(IConfiguration configuration, ILogger<AzureStorageService> logger)
        {
            _logger = logger;
            var connectionString = configuration.GetConnectionString("AzureStorage");
            _containerName = configuration["AzureStorage:ContainerName"] ?? "product-images";
            
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogWarning("Azure Storage connection string not found");
                return;
            }

            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public async Task<string> GenerateUploadSasTokenAsync(string fileName)
        {
            if (_blobServiceClient == null)
            {
                throw new InvalidOperationException("Azure Storage is not configured");
            }

            try
            {
                // Ensure container exists
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                await containerClient.CreateIfNotExistsAsync(Azure.Storage.Blobs.Models.PublicAccessType.Blob);

                // Generate unique filename if not provided
                if (string.IsNullOrEmpty(fileName))
                {
                    fileName = $"product-{DateTime.UtcNow:yyyyMMdd-HHmmss}-{Guid.NewGuid():N}.jpg";
                }

                var blobClient = containerClient.GetBlobClient(fileName);

                // Check if the blob client can generate SAS tokens
                if (!blobClient.CanGenerateSasUri)
                {
                    throw new InvalidOperationException("BlobClient cannot generate SAS tokens. Ensure you are using account key authentication.");
                }

                // Generate SAS token with upload permissions
                var sasBuilder = new BlobSasBuilder
                {
                    BlobContainerName = _containerName,
                    BlobName = fileName,
                    Resource = "b", // blob
                    ExpiresOn = DateTimeOffset.UtcNow.AddHours(1), // Token expires in 1 hour
                };

                // Set permissions
                sasBuilder.SetPermissions(BlobSasPermissions.Create | BlobSasPermissions.Write);

                var sasToken = blobClient.GenerateSasUri(sasBuilder);

                return sasToken.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating SAS token for file: {FileName}", fileName);
                throw;
            }
        }

        public async Task<bool> DeleteBlobAsync(string blobUrl)
        {
            if (_blobServiceClient == null)
            {
                _logger.LogWarning("Azure Storage is not configured");
                return false;
            }

            try
            {
                var uri = new Uri(blobUrl);
                var blobName = Path.GetFileName(uri.LocalPath);
                
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                var blobClient = containerClient.GetBlobClient(blobName);
                
                var response = await blobClient.DeleteIfExistsAsync();
                return response.Value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting blob: {BlobUrl}", blobUrl);
                return false;
            }
        }

        public string GetBlobUrl(string fileName)
        {
            if (_blobServiceClient == null)
            {
                throw new InvalidOperationException("Azure Storage is not configured");
            }

            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            return blobClient.Uri.ToString();
        }
    }
}