using System.Net;
using Xunit;

namespace OpenClinicalRecord.Api.Tests;

/// <summary>
/// Smoke checks: protected routes reject unauthenticated callers (401).
/// </summary>
public class AuthorizationSmokeTests : IClassFixture<OcrWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthorizationSmokeTests(OcrWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Theory]
    [InlineData("/api/patients")]
    [InlineData("/api/appointments")]
    [InlineData("/api/dashboard/stats")]
    [InlineData("/api/users")]
    [InlineData("/api/roles")]
    [InlineData("/api/auth/me")]
    public async Task Protected_endpoint_without_token_returns_401(string path)
    {
        var response = await _client.GetAsync(path);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_without_body_is_not_success()
    {
        var response = await _client.PostAsync("/api/auth/login", null);
        Assert.True(
            response.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.UnsupportedMediaType,
            $"Unexpected status: {response.StatusCode}");
    }
}
