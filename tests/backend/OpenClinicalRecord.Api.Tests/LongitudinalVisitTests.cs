using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace OpenClinicalRecord.Api.Tests;

/// <summary>
/// Critical Week 4 acceptance: Visit 1 data must remain unchanged after Visit 2 is created.
/// </summary>
public class LongitudinalVisitTests : IClassFixture<OcrWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public LongitudinalVisitTests(OcrWebApplicationFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });
    }

    private async Task<string> LoginAsync(string email)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = OcrWebApplicationFactory.SeedPassword
        });
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<LoginBody>(JsonOpts);
        return body!.AccessToken;
    }

    private static HttpRequestMessage Req(HttpMethod method, string path, string token, object? json = null)
    {
        var req = new HttpRequestMessage(method, path);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (json is not null) req.Content = JsonContent.Create(json);
        return req;
    }

    [Fact]
    public async Task Two_visits_preserve_independent_vitals()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var nurse = await LoginAsync("nurse@clinic.local");

        var createPatient = await _client.SendAsync(Req(HttpMethod.Post, "/api/patients", desk, new
        {
            firstName = "Longitudinal",
            lastName = "Test",
            sex = "Female",
            dateOfBirth = "1995-04-12"
        }));
        Assert.True(createPatient.IsSuccessStatusCode, await createPatient.Content.ReadAsStringAsync());
        var patientId = JsonDocument.Parse(await createPatient.Content.ReadAsStringAsync()).RootElement.GetProperty("id").GetGuid();

        var v1Res = await _client.SendAsync(Req(HttpMethod.Post, $"/api/patients/{patientId}/chart/visits", nurse, new
        {
            visitType = "Vitals",
            temperatureC = 38.1m,
            pulse = 90,
            clinicalNote = "Visit 1 information",
            status = "Final"
        }));
        Assert.True(v1Res.IsSuccessStatusCode, await v1Res.Content.ReadAsStringAsync());
        using var v1Doc = JsonDocument.Parse(await v1Res.Content.ReadAsStringAsync());
        var visit1Id = v1Doc.RootElement.GetProperty("id").GetGuid();
        Assert.Equal(38.1m, v1Doc.RootElement.GetProperty("vitalSigns").GetProperty("temperatureC").GetDecimal());
        Assert.Equal(90, v1Doc.RootElement.GetProperty("vitalSigns").GetProperty("pulse").GetInt32());

        var v2Res = await _client.SendAsync(Req(HttpMethod.Post, $"/api/patients/{patientId}/chart/visits", nurse, new
        {
            visitType = "Vitals",
            temperatureC = 36.8m,
            pulse = 74,
            clinicalNote = "Visit 2 information",
            status = "Final"
        }));
        Assert.True(v2Res.IsSuccessStatusCode, await v2Res.Content.ReadAsStringAsync());
        using var v2Doc = JsonDocument.Parse(await v2Res.Content.ReadAsStringAsync());
        var visit2Id = v2Doc.RootElement.GetProperty("id").GetGuid();
        Assert.NotEqual(visit1Id, visit2Id);

        var get1 = await _client.SendAsync(
            Req(HttpMethod.Get, $"/api/patients/{patientId}/chart/visits/{visit1Id}", nurse));
        Assert.Equal(HttpStatusCode.OK, get1.StatusCode);
        using var get1Doc = JsonDocument.Parse(await get1.Content.ReadAsStringAsync());
        Assert.Equal(38.1m, get1Doc.RootElement.GetProperty("vitalSigns").GetProperty("temperatureC").GetDecimal());
        Assert.Equal(90, get1Doc.RootElement.GetProperty("vitalSigns").GetProperty("pulse").GetInt32());

        var get2 = await _client.SendAsync(
            Req(HttpMethod.Get, $"/api/patients/{patientId}/chart/visits/{visit2Id}", nurse));
        Assert.Equal(HttpStatusCode.OK, get2.StatusCode);
        using var get2Doc = JsonDocument.Parse(await get2.Content.ReadAsStringAsync());
        Assert.Equal(36.8m, get2Doc.RootElement.GetProperty("vitalSigns").GetProperty("temperatureC").GetDecimal());
        Assert.Equal(74, get2Doc.RootElement.GetProperty("vitalSigns").GetProperty("pulse").GetInt32());
    }

    [Fact]
    public async Task Get_visit_wrong_patient_returns_404()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var nurse = await LoginAsync("nurse@clinic.local");

        var p1 = await _client.SendAsync(Req(HttpMethod.Post, "/api/patients", desk, new
        {
            firstName = "Alice",
            lastName = "Owner",
            sex = "Female",
            dateOfBirth = "1990-01-01"
        }));
        p1.EnsureSuccessStatusCode();
        var p1Id = JsonDocument.Parse(await p1.Content.ReadAsStringAsync()).RootElement.GetProperty("id").GetGuid();

        var p2 = await _client.SendAsync(Req(HttpMethod.Post, "/api/patients", desk, new
        {
            firstName = "Bob",
            lastName = "Other",
            sex = "Male",
            dateOfBirth = "1991-02-02"
        }));
        p2.EnsureSuccessStatusCode();
        var p2Id = JsonDocument.Parse(await p2.Content.ReadAsStringAsync()).RootElement.GetProperty("id").GetGuid();

        var visit = await _client.SendAsync(Req(HttpMethod.Post, $"/api/patients/{p1Id}/chart/visits", nurse, new
        {
            visitType = "Vitals",
            pulse = 70,
            status = "Final"
        }));
        visit.EnsureSuccessStatusCode();
        var visitId = JsonDocument.Parse(await visit.Content.ReadAsStringAsync()).RootElement.GetProperty("id").GetGuid();

        var wrong = await _client.SendAsync(
            Req(HttpMethod.Get, $"/api/patients/{p2Id}/chart/visits/{visitId}", nurse));
        Assert.Equal(HttpStatusCode.NotFound, wrong.StatusCode);
    }

    [Fact]
    public async Task Receptionist_cannot_create_visit()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var create = await _client.SendAsync(Req(HttpMethod.Post, "/api/patients", desk, new
        {
            firstName = "Desk",
            lastName = "Blocked",
            sex = "Male",
            dateOfBirth = "1980-01-01"
        }));
        create.EnsureSuccessStatusCode();
        var patientId = JsonDocument.Parse(await create.Content.ReadAsStringAsync()).RootElement.GetProperty("id").GetGuid();

        var visit = await _client.SendAsync(Req(HttpMethod.Post, $"/api/patients/{patientId}/chart/visits", desk, new
        {
            visitType = "Vitals",
            pulse = 80
        }));
        Assert.Equal(HttpStatusCode.Forbidden, visit.StatusCode);
    }

    private sealed class LoginBody
    {
        public string AccessToken { get; set; } = string.Empty;
    }
}
