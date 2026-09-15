using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace OpenClinicalRecord.Api.Tests;

public class HealthEndpointTests : IClassFixture<OcrWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(OcrWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Get_Health_ReturnsOkAndStatusOk()
    {
        var response = await _client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<HealthResponse>();
        Assert.NotNull(body);
        Assert.Equal("ok", body!.Status);
    }

    private sealed class HealthResponse
    {
        public string Status { get; set; } = string.Empty;
    }
}
