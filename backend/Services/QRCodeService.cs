using System;
using System.IO;
using System.Security.Cryptography;
using QRCoder;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace backend.Services
{
    public class QRCodeService
    {
        private readonly ILogger<QRCodeService> _logger;
        private readonly string _qrCodeBasePath;

        public QRCodeService(ILogger<QRCodeService> logger, IConfiguration configuration)
        {
            _logger = logger;
            
            // Get the base path for storing QR codes from configuration or use a default
            _qrCodeBasePath = configuration["QRCode:BasePath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "qrcodes");
            
            // Ensure the directory exists
            if (!Directory.Exists(_qrCodeBasePath))
            {
                Directory.CreateDirectory(_qrCodeBasePath);
            }
        }

        /// <summary>
        /// Generates a QR code for an activity
        /// </summary>
        /// <param name="activityId">The activity ID</param>
        /// <param name="expirationDate">Expiration date for the QR code</param>
        /// <returns>A tuple containing the token, the URL of the QR code image, and the expiration date</returns>
        public (string token, string qrCodeUrl, DateTime expiration) GenerateQRCodeForActivity(int activityId, DateTime expirationDate)
        {
            try
            {
                // Generate a unique token that includes the activity ID and a random component
                string token = GenerateToken(activityId);
                
                // Create the payload that will be encoded in the QR code
                // Format: activityId|token|expirationTimestamp
                string payload = $"{activityId}|{token}|{((DateTimeOffset)expirationDate).ToUnixTimeSeconds()}";
                
                // Generate the QR code
                using var qrGenerator = new QRCodeGenerator();
                var qrCodeData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
                
                using var qrCode = new PngByteQRCode(qrCodeData);
                byte[] qrCodeBytes = qrCode.GetGraphic(20); // 20 pixels per module
                
                // Save the QR code to a file
                string fileName = $"activity_{activityId}_{DateTime.UtcNow.Ticks}.png";
                string filePath = Path.Combine(_qrCodeBasePath, fileName);
                
                File.WriteAllBytes(filePath, qrCodeBytes);
                
                // Calculate the relative URL for the QR code
                string qrCodeUrl = $"/qrcodes/{fileName}";
                
                _logger.LogInformation($"Generated QR code for activity {activityId} with token {token}, expires on {expirationDate}");
                
                return (token, qrCodeUrl, expirationDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating QR code for activity {activityId}");
                throw;
            }
        }
        
        /// <summary>
        /// Validates a QR code token
        /// </summary>
        /// <param name="activityId">The activity ID</param>
        /// <param name="token">The token from the QR code</param>
        /// <param name="expirationDate">The expiration date to check against</param>
        /// <returns>True if the token is valid and not expired, otherwise false</returns>
        public bool ValidateQRCodeToken(int activityId, string token, DateTime expirationDate)
        {
            if (string.IsNullOrEmpty(token))
                return false;
                
            // Check if the token has expired
            if (DateTime.UtcNow > expirationDate)
                return false;
                
            // Additional validation could be implemented here if needed
            
            return true;
        }
        
        /// <summary>
        /// Parses a QR code payload
        /// </summary>
        /// <param name="payload">The payload from the QR code</param>
        /// <returns>A tuple containing the activity ID, token, and expiration timestamp</returns>
        public (int activityId, string token, DateTime expiration)? ParseQRCodePayload(string payload)
        {
            try
            {
                string[] parts = payload.Split('|');
                if (parts.Length != 3)
                    return null;
                    
                if (!int.TryParse(parts[0], out int activityId))
                    return null;
                    
                string token = parts[1];
                
                if (!long.TryParse(parts[2], out long expirationTimestamp))
                    return null;
                    
                DateTime expiration = DateTimeOffset.FromUnixTimeSeconds(expirationTimestamp).UtcDateTime;
                
                return (activityId, token, expiration);
            }
            catch
            {
                return null;
            }
        }
        
        /// <summary>
        /// Generates a unique token for a QR code
        /// </summary>
        /// <param name="activityId">The activity ID</param>
        /// <returns>A unique token</returns>
        private string GenerateToken(int activityId)
        {
            // Combine the activity ID with a timestamp and random data
            string baseData = $"{activityId}_{DateTime.UtcNow.Ticks}_{Guid.NewGuid()}";
            
            // Hash the data to create a fixed-length token
            using var sha256 = SHA256.Create();
            byte[] hashBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(baseData));
            
            // Convert the hash to a Base64 string and remove any characters that might cause issues in URLs
            string token = Convert.ToBase64String(hashBytes)
                .Replace("/", "_")
                .Replace("+", "-")
                .Replace("=", "")
                .Substring(0, 16); // Use only the first 16 characters for a shorter token
                
            return token;
        }
    }
} 