using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace OpenClinicalRecord.Api.Tests;

/// <summary>
/// Phase 4: appointment transitions, reschedule, deceased booking block.
/// </summary>
public class AppointmentWorkflowTests : IClassFixture<OcrWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public AppointmentWorkflowTests(OcrWebApplicationFactory factory)
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
            firstName = "Appt",
            lastName = Guid.NewGuid().ToString("N")[..8],
            sex = "Male",
            dateOfBirth = "1988-03-15",
            phone = "+251911000099"
        }));
        Assert.True(res.IsSuccessStatusCode, await res.Content.ReadAsStringAsync());
        using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("id").GetGuid();
    }

    private async Task<Guid> CreateAppointmentAsync(string token, Guid patientId, DateOnly? date = null)
    {
        var d = date ?? DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(1));
        var res = await _client.SendAsync(Req(HttpMethod.Post, "/api/appointments", token, new
        {
            patientId,
            appointmentDate = d.ToString("yyyy-MM-dd"),
            startTime = "09:00:00",
            durationMinutes = 30,
            appointmentType = "Consultation",
            providerName = "Dr Test"
        }));
        Assert.True(res.IsSuccessStatusCode, await res.Content.ReadAsStringAsync());
        using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("id").GetGuid();
    }

    private async Task PatchStatusAsync(string token, Guid apptId, string status, string? reason = null)
    {
        var body = reason is null
            ? (object)new { status }
            : new { status, reason };
        var res = await _client.SendAsync(Req(HttpMethod.Patch, $"/api/appointments/{apptId}/status", token, body));
        Assert.True(res.IsSuccessStatusCode, await res.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Scheduled_to_CheckedIn_creates_Draft_visit()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var patientId = await RegisterPatientAsync(desk);
        var apptId = await CreateAppointmentAsync(desk, patientId);

        await PatchStatusAsync(desk, apptId, "CheckedIn");

        var chart = await _client.SendAsync(Req(HttpMethod.Get, $"/api/patients/{patientId}/chart", desk));
        Assert.True(chart.IsSuccessStatusCode, await chart.Content.ReadAsStringAsync());
        using var doc = JsonDocument.Parse(await chart.Content.ReadAsStringAsync());
        var visits = doc.RootElement.GetProperty("visits");
        Assert.True(visits.GetArrayLength() >= 1);
        var status = visits[0].GetProperty("status").GetString();
        Assert.Equal("Draft", status);
    }

    [Fact]
    public async Task Completed_is_terminal()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var patientId = await RegisterPatientAsync(desk);
        var apptId = await CreateAppointmentAsync(desk, patientId);

        await PatchStatusAsync(desk, apptId, "CheckedIn");
        await PatchStatusAsync(desk, apptId, "Completed");

        var res = await _client.SendAsync(Req(
            HttpMethod.Patch,
            $"/api/appointments/{apptId}/status",
            desk,
            new { status = "Scheduled" }));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Cancel_requires_reason()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var patientId = await RegisterPatientAsync(desk);
        var apptId = await CreateAppointmentAsync(desk, patientId);

        var res = await _client.SendAsync(Req(
            HttpMethod.Patch,
            $"/api/appointments/{apptId}/status",
            desk,
            new { status = "Cancelled" }));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);

        await PatchStatusAsync(desk, apptId, "Cancelled", "Patient request");
    }

    [Fact]
    public async Task Invalid_transition_Scheduled_to_Completed_rejected()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var patientId = await RegisterPatientAsync(desk);
        var apptId = await CreateAppointmentAsync(desk, patientId);

        var res = await _client.SendAsync(Req(
            HttpMethod.Patch,
            $"/api/appointments/{apptId}/status",
            desk,
            new { status = "Completed" }));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Deceased_patient_cannot_book()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var doctor = await LoginAsync("doctor@clinic.local");
        var patientId = await RegisterPatientAsync(desk);

        var dead = await _client.SendAsync(Req(
            HttpMethod.Post,
            $"/api/patients/{patientId}/deceased",
            doctor,
            new { note = "Phase4 test" }));
        Assert.True(dead.IsSuccessStatusCode, await dead.Content.ReadAsStringAsync());

        var book = await _client.SendAsync(Req(HttpMethod.Post, "/api/appointments", desk, new
        {
            patientId,
            appointmentDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(2)).ToString("yyyy-MM-dd"),
            startTime = "10:00:00",
            durationMinutes = 30
        }));
        Assert.Equal(HttpStatusCode.BadRequest, book.StatusCode);
    }

    [Fact]
    public async Task Reschedule_updates_slot_and_writes_event()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var patientId = await RegisterPatientAsync(desk);
        var apptId = await CreateAppointmentAsync(desk, patientId);

        var newDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(5)).ToString("yyyy-MM-dd");
        var res = await _client.SendAsync(Req(
            HttpMethod.Patch,
            $"/api/appointments/{apptId}/reschedule",
            desk,
            new
            {
                appointmentDate = newDate,
                startTime = "14:30:00",
                durationMinutes = 45,
                reason = "Patient preferred afternoon"
            }));
        Assert.True(res.IsSuccessStatusCode, await res.Content.ReadAsStringAsync());

        using var body = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        Assert.Equal("14:30:00", body.RootElement.GetProperty("startTime").GetString());
        Assert.Equal(45, body.RootElement.GetProperty("durationMinutes").GetInt32());

        var eventsRes = await _client.SendAsync(Req(HttpMethod.Get, $"/api/appointments/{apptId}/events", desk));
        Assert.True(eventsRes.IsSuccessStatusCode);
        using var events = JsonDocument.Parse(await eventsRes.Content.ReadAsStringAsync());
        Assert.True(events.RootElement.GetArrayLength() >= 2);
        var reasons = events.RootElement.EnumerateArray()
            .Select(e => e.TryGetProperty("reason", out var r) ? r.GetString() ?? "" : "")
            .ToList();
        Assert.Contains(reasons, r => r.Contains("Rescheduled", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task Reschedule_blocked_after_CheckedIn()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var patientId = await RegisterPatientAsync(desk);
        var apptId = await CreateAppointmentAsync(desk, patientId);
        await PatchStatusAsync(desk, apptId, "CheckedIn");

        var res = await _client.SendAsync(Req(
            HttpMethod.Patch,
            $"/api/appointments/{apptId}/reschedule",
            desk,
            new
            {
                appointmentDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(7)).ToString("yyyy-MM-dd"),
                startTime = "11:00:00",
                durationMinutes = 30
            }));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    private sealed class LoginBody
    {
        public string AccessToken { get; set; } = "";
    }
}
