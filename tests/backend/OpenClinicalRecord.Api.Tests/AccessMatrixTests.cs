using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace OpenClinicalRecord.Api.Tests;

/// <summary>
/// Complete role × action matrix for patients, appointments, and deceased flows.
/// Expected outcomes are documented in docs/05-engineering/access-control-report.md.
/// </summary>
public class AccessMatrixTests : IClassFixture<OcrWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static int _seq;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public AccessMatrixTests(OcrWebApplicationFactory factory)
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
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        var body = await response.Content.ReadFromJsonAsync<LoginBody>(JsonOpts);
        return body!.AccessToken;
    }

    private HttpRequestMessage Req(HttpMethod method, string path, string? token, object? json = null)
    {
        var req = new HttpRequestMessage(method, path);
        if (token is not null)
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (json is not null)
            req.Content = JsonContent.Create(json);
        return req;
    }

    private async Task<Guid> CreatePatientAsDeskAsync()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var n = Interlocked.Increment(ref _seq);
        var res = await _client.SendAsync(Req(HttpMethod.Post, "/api/patients", desk, new
        {
            firstName = "Matrix",
            lastName = $"P{n}",
            sex = "Male",
            dateOfBirth = "1990-01-15",
            phone = $"+25191{n:D6}"
        }));
        Assert.True(res.IsSuccessStatusCode, await res.Content.ReadAsStringAsync());
        using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("id").GetGuid();
    }

    // ── Anonymous ──────────────────────────────────────────────

    [Theory]
    [InlineData("GET", "/api/patients")]
    [InlineData("POST", "/api/patients")]
    [InlineData("GET", "/api/appointments")]
    [InlineData("POST", "/api/appointments")]
    public async Task Anonymous_is_401(string method, string path)
    {
        var res = await _client.SendAsync(Req(new HttpMethod(method), path, null,
            method == "POST" ? new { } : null));
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    // ── Create patient ─────────────────────────────────────────

    [Theory]
    [InlineData("admin@clinic.local", true)]
    [InlineData("desk@clinic.local", true)]
    [InlineData("doctor@clinic.local", true)]
    [InlineData("nurse@clinic.local", true)]
    public async Task Create_patient_by_role(string email, bool allowed)
    {
        var token = await LoginAsync(email);
        var n = Interlocked.Increment(ref _seq);
        var res = await _client.SendAsync(Req(HttpMethod.Post, "/api/patients", token, new
        {
            firstName = "Create",
            lastName = $"R{n}",
            sex = "Female",
            dateOfBirth = "1985-05-05",
            phone = $"+25192{n:D6}"
        }));

        if (allowed)
            Assert.True(res.IsSuccessStatusCode, $"{email}: {await res.Content.ReadAsStringAsync()}");
        else
            Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    // ── Create appointment ─────────────────────────────────────

    [Theory]
    [InlineData("admin@clinic.local", true)]
    [InlineData("desk@clinic.local", true)]
    [InlineData("doctor@clinic.local", true)]
    [InlineData("nurse@clinic.local", true)]
    public async Task Create_appointment_by_role(string email, bool allowed)
    {
        var patientId = await CreatePatientAsDeskAsync();
        var token = await LoginAsync(email);
        var n = Interlocked.Increment(ref _seq);
        var res = await _client.SendAsync(Req(HttpMethod.Post, "/api/appointments", token, new
        {
            patientId,
            appointmentDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(2 + (n % 10))).ToString("yyyy-MM-dd"),
            startTime = $"{8 + (n % 8):D2}:{(n * 3) % 60:D2}:00",
            durationMinutes = 30,
            appointmentType = "Consultation",
            providerName = $"Prov {email} {n}"
        }));

        if (allowed)
            Assert.True(res.IsSuccessStatusCode, $"{email}: {await res.Content.ReadAsStringAsync()}");
        else
            Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    // ── Mark deceased ──────────────────────────────────────────

    [Theory]
    [InlineData("admin@clinic.local", true)]
    [InlineData("doctor@clinic.local", true)]
    [InlineData("desk@clinic.local", true)]
    [InlineData("nurse@clinic.local", false)]
    public async Task Mark_deceased_by_role(string email, bool allowed)
    {
        var patientId = await CreatePatientAsDeskAsync();
        var token = await LoginAsync(email);
        var res = await _client.SendAsync(Req(
            HttpMethod.Post,
            $"/api/patients/{patientId}/deceased",
            token,
            new { note = "Access matrix test" }));

        if (allowed)
            Assert.True(res.IsSuccessStatusCode, $"{email}: {await res.Content.ReadAsStringAsync()}");
        else
            Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    // ── Clear deceased ─────────────────────────────────────────

    [Theory]
    [InlineData("admin@clinic.local", true)]
    [InlineData("doctor@clinic.local", true)]
    [InlineData("desk@clinic.local", false)]
    [InlineData("nurse@clinic.local", false)]
    public async Task Clear_deceased_by_role(string email, bool allowed)
    {
        var patientId = await CreatePatientAsDeskAsync();
        var doctor = await LoginAsync("doctor@clinic.local");
        var mark = await _client.SendAsync(Req(
            HttpMethod.Post,
            $"/api/patients/{patientId}/deceased",
            doctor,
            new { note = "setup" }));
        Assert.True(mark.IsSuccessStatusCode, await mark.Content.ReadAsStringAsync());

        var token = await LoginAsync(email);
        var res = await _client.SendAsync(Req(
            HttpMethod.Post,
            $"/api/patients/{patientId}/deceased/clear",
            token));

        if (allowed)
            Assert.True(res.IsSuccessStatusCode, $"{email}: {await res.Content.ReadAsStringAsync()}");
        else
            Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    // ── Clinical chart write ───────────────────────────────────

    [Theory]
    [InlineData("doctor@clinic.local", true)]
    [InlineData("nurse@clinic.local", true)]
    [InlineData("desk@clinic.local", false)]
    [InlineData("admin@clinic.local", false)]
    public async Task Create_visit_by_role(string email, bool allowed)
    {
        var patientId = await CreatePatientAsDeskAsync();
        var token = await LoginAsync(email);
        var res = await _client.SendAsync(Req(
            HttpMethod.Post,
            $"/api/patients/{patientId}/chart/visits",
            token,
            new { visitType = "Consultation", chiefComplaint = "matrix" }));

        if (allowed)
            Assert.True(res.IsSuccessStatusCode, $"{email}: {await res.Content.ReadAsStringAsync()}");
        else
            Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    // ── Admin-only users list ──────────────────────────────────

    [Theory]
    [InlineData("admin@clinic.local", true)]
    [InlineData("doctor@clinic.local", false)]
    [InlineData("desk@clinic.local", false)]
    [InlineData("nurse@clinic.local", false)]
    public async Task List_users_admin_only(string email, bool allowed)
    {
        var token = await LoginAsync(email);
        var res = await _client.SendAsync(Req(HttpMethod.Get, "/api/users", token));
        if (allowed)
            Assert.True(res.IsSuccessStatusCode, await res.Content.ReadAsStringAsync());
        else
            Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    // ── Book for deceased blocked ──────────────────────────────

    [Fact]
    public async Task Cannot_book_appointment_for_deceased_patient()
    {
        var patientId = await CreatePatientAsDeskAsync();
        var doctor = await LoginAsync("doctor@clinic.local");
        var mark = await _client.SendAsync(Req(
            HttpMethod.Post,
            $"/api/patients/{patientId}/deceased",
            doctor,
            new { note = "block booking" }));
        Assert.True(mark.IsSuccessStatusCode);

        var desk = await LoginAsync("desk@clinic.local");
        var n = Interlocked.Increment(ref _seq);
        var book = await _client.SendAsync(Req(HttpMethod.Post, "/api/appointments", desk, new
        {
            patientId,
            appointmentDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(60)).ToString("yyyy-MM-dd"),
            startTime = "11:00:00",
            durationMinutes = 30,
            providerName = $"DeceasedBlock {n}"
        }));
        Assert.Equal(HttpStatusCode.BadRequest, book.StatusCode);
    }

    private sealed class LoginBody
    {
        public string AccessToken { get; set; } = "";
    }
}
