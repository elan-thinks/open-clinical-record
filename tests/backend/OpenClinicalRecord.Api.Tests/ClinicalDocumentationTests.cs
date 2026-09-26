using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace OpenClinicalRecord.Api.Tests;

/// <summary>
/// Week 7 functional tests: draft documentation, finalize, reject edit of closed visit.
/// </summary>
public class ClinicalDocumentationTests : IClassFixture<OcrWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public ClinicalDocumentationTests(OcrWebApplicationFactory factory)
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

    private HttpRequestMessage Req(HttpMethod method, string path, string token, object? json = null)
    {
        var req = new HttpRequestMessage(method, path);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (json is not null) req.Content = JsonContent.Create(json);
        return req;
    }

    private async Task<Guid> RegisterPatientAsync(string deskToken)
    {
        var res = await _client.SendAsync(Req(HttpMethod.Post, "/api/patients", deskToken, new
        {
            firstName = "Consult",
            lastName = Guid.NewGuid().ToString("N")[..8],
            sex = "Female",
            dateOfBirth = "1990-06-01",
            phone = "+251911000088"
        }));
        res.EnsureSuccessStatusCode();
        using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("id").GetGuid();
    }

    [Fact]
    public async Task Document_draft_visit_then_finalize_succeeds()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var doctor = await LoginAsync("doctor@clinic.local");
        var patientId = await RegisterPatientAsync(desk);

        // Create open Draft visit
        var create = await _client.SendAsync(Req(HttpMethod.Post, $"/api/patients/{patientId}/chart/visits", doctor, new
        {
            visitType = "Consultation",
            chiefComplaint = "Headache",
            status = "Draft"
        }));
        Assert.True(create.IsSuccessStatusCode, await create.Content.ReadAsStringAsync());
        using var createDoc = JsonDocument.Parse(await create.Content.ReadAsStringAsync());
        var visitId = createDoc.RootElement.GetProperty("id").GetGuid();
        Assert.Equal("Draft", createDoc.RootElement.GetProperty("status").GetString());

        // Document (PATCH) with vitals + primary diagnosis + finalize
        var patch = await _client.SendAsync(Req(HttpMethod.Patch, $"/api/patients/{patientId}/chart/visits/{visitId}", doctor, new
        {
            chiefComplaint = "Headache — worsening",
            bloodPressure = "120/80",
            pulse = 72,
            temperatureC = 36.8,
            spo2 = 98,
            primaryDiagnosis = "Tension headache",
            primaryDiagnosisCode = "G44.2",
            clinicalNote = "Advise rest and hydration.",
            status = "Final"
        }));
        Assert.True(patch.IsSuccessStatusCode, await patch.Content.ReadAsStringAsync());
        using var patchDoc = JsonDocument.Parse(await patch.Content.ReadAsStringAsync());
        Assert.Equal("Final", patchDoc.RootElement.GetProperty("status").GetString());
        Assert.Equal("Tension headache", patchDoc.RootElement.GetProperty("diagnoses")[0].GetProperty("description").GetString());
        Assert.Equal(72, patchDoc.RootElement.GetProperty("vitalSigns").GetProperty("pulse").GetInt32());
    }

    [Fact]
    public async Task Document_finalized_visit_returns_conflict()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var doctor = await LoginAsync("doctor@clinic.local");
        var patientId = await RegisterPatientAsync(desk);

        var create = await _client.SendAsync(Req(HttpMethod.Post, $"/api/patients/{patientId}/chart/visits", doctor, new
        {
            visitType = "Consultation",
            chiefComplaint = "Closed case",
            primaryDiagnosis = "Resolved",
            status = "Final"
        }));
        Assert.True(create.IsSuccessStatusCode, await create.Content.ReadAsStringAsync());
        using var createDoc = JsonDocument.Parse(await create.Content.ReadAsStringAsync());
        var visitId = createDoc.RootElement.GetProperty("id").GetGuid();

        var patch = await _client.SendAsync(Req(HttpMethod.Patch, $"/api/patients/{patientId}/chart/visits/{visitId}", doctor, new
        {
            chiefComplaint = "Should not apply",
            primaryDiagnosis = "Illegal edit"
        }));

        Assert.Equal(HttpStatusCode.Conflict, patch.StatusCode);
    }

    [Fact]
    public async Task Dashboard_stats_returns_ok_for_authenticated_user()
    {
        var token = await LoginAsync("doctor@clinic.local");
        var res = await _client.SendAsync(Req(HttpMethod.Get, "/api/dashboard/stats", token));
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        Assert.True(doc.RootElement.TryGetProperty("activePatients", out _));
        Assert.True(doc.RootElement.TryGetProperty("appointmentsToday", out _));
        Assert.True(doc.RootElement.TryGetProperty("todaysSchedule", out _));
    }

    private sealed class LoginBody
    {
        public string AccessToken { get; set; } = "";
    }
}
