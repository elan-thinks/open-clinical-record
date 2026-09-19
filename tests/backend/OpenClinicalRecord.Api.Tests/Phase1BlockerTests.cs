using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace OpenClinicalRecord.Api.Tests;

/// <summary>
/// Phase 1 blockers: Draft default, deceased path only.
/// Admin is allowed appointment status updates (same staff set as create).
/// </summary>
public class Phase1BlockerTests : IClassFixture<OcrWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public Phase1BlockerTests(OcrWebApplicationFactory factory)
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
            firstName = "Phase1",
            lastName = Guid.NewGuid().ToString("N")[..8],
            sex = "Female",
            dateOfBirth = "1991-06-01",
            phone = "+251900000001"
        }));
        Assert.True(res.IsSuccessStatusCode, await res.Content.ReadAsStringAsync());
        using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("id").GetGuid();
    }

    [Fact]
    public async Task CreateVisit_without_status_defaults_to_Draft()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var nurse = await LoginAsync("nurse@clinic.local");
        var patientId = await RegisterPatientAsync(desk);

        var res = await _client.SendAsync(Req(HttpMethod.Post, $"/api/patients/{patientId}/chart/visits", nurse, new
        {
            visitType = "Consultation",
            chiefComplaint = "Phase1 draft default",
            temperatureC = 37.0m,
            pulse = 72
        }));
        Assert.True(res.IsSuccessStatusCode, await res.Content.ReadAsStringAsync());
        using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        Assert.Equal("Draft", doc.RootElement.GetProperty("status").GetString());
    }

    [Fact]
    public async Task Put_patient_cannot_set_Deceased_without_death_endpoint()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var patientId = await RegisterPatientAsync(desk);

        var res = await _client.SendAsync(Req(HttpMethod.Put, $"/api/patients/{patientId}", desk, new
        {
            firstName = "Phase1",
            lastName = "DeceasedBlocked",
            sex = "Female",
            dateOfBirth = "1991-06-01",
            phone = "+251900000002",
            status = "Deceased"
        }));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var body = await res.Content.ReadAsStringAsync();
        Assert.Contains("deceased", body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Admin_and_desk_can_update_appointment_status()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var admin = await LoginAsync("admin@clinic.local");
        var patientId = await RegisterPatientAsync(desk);

        var createAppt = await _client.SendAsync(Req(HttpMethod.Post, "/api/appointments", desk, new
        {
            patientId,
            appointmentDate = DateOnly.FromDateTime(DateTime.UtcNow.Date),
            startTime = "10:00:00",
            durationMinutes = 30,
            appointmentType = "Consultation",
            reason = "Phase1 admin status"
        }));
        Assert.True(createAppt.IsSuccessStatusCode, await createAppt.Content.ReadAsStringAsync());
        using var doc = JsonDocument.Parse(await createAppt.Content.ReadAsStringAsync());
        var apptId = doc.RootElement.GetProperty("id").GetGuid();

        var adminStatus = await _client.SendAsync(Req(
            HttpMethod.Patch,
            $"/api/appointments/{apptId}/status",
            admin,
            new { status = "Waiting" }));
        Assert.Equal(HttpStatusCode.OK, adminStatus.StatusCode);

        var deskStatus = await _client.SendAsync(Req(
            HttpMethod.Patch,
            $"/api/appointments/{apptId}/status",
            desk,
            new { status = "CheckedIn" }));
        Assert.Equal(HttpStatusCode.OK, deskStatus.StatusCode);
    }

    private sealed class LoginBody
    {
        public string AccessToken { get; set; } = string.Empty;
    }
}
