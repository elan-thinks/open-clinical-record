using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using OpenClinicalRecord.Api.Configuration;
using OpenClinicalRecord.Api.Models.Entities;

namespace OpenClinicalRecord.Api.Services;

public interface IJwtTokenService
{
    (string Token, DateTimeOffset ExpiresAt) CreateToken(ApplicationUser user, IEnumerable<string> roles);
}

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtOptions _options;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public (string Token, DateTimeOffset ExpiresAt) CreateToken(ApplicationUser user, IEnumerable<string> roles)
    {
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_options.ExpirationMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.FullName),
            new("fullName", user.FullName),
            new(ClaimTypes.Email, user.Email ?? string.Empty)
        };

        // Emit roles only as short "role" so JwtBearer RoleClaimType matches after MapInboundClaims=false.
        foreach (var role in roles.Where(r => !string.IsNullOrWhiteSpace(r)).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            claims.Add(new Claim("role", role.Trim()));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        // Do not rewrite claim types on write (avoids role claim disappearing / renaming).
        var handler = new JwtSecurityTokenHandler { MapInboundClaims = false };
        handler.OutboundClaimTypeMap.Clear();

        var written = handler.WriteToken(token);
        return (written, expiresAt);
    }
}
