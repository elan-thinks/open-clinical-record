using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace OpenClinicalRecord.Api.Tests;

/// <summary>
/// Role matrix: wrong role → 403; correct role → not 403 (200/400/404 acceptable).
/// </summary>
public class RoleAuthorizationTests : IClassFixture<OcrWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public RoleAuthorizationTests(OcrWebApplicationFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
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
        Assert.False(string.IsNullOrWhiteSpace(body?.AccessToken));
        return body!.AccessToken;
    }

    private static HttpRequestMessage WithBearer(HttpMethod method, string path, string token, object? json = null)
    {
        var req = new HttpRequestMessage(method, path);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (json is not null)
        {
            req.Content = JsonContent.Create(json);
        }
        return req;
    }

    [Fact]
    public async Task Users_list_Admin_ok_others_403()
    {
        var admin = await LoginAsync("admin@clinic.local");
        var doctor = await LoginAsync("doctor@clinic.local");
        var nurse = await LoginAsync("nurse@clinic.local");
        var desk = await LoginAsync("desk@clinic.local");

        var ok = await _client.SendAsync(WithBearer(HttpMethod.Get, "/api/users", admin));
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);

        foreach (var token in new[] { doctor, nurse, desk })
        {
            var res = await _client.SendAsync(WithBearer(HttpMethod.Get, "/api/users", token));
            Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
        }
    }

    [Fact]
    public async Task Roles_list_Admin_ok_Doctor_403()
    {
        var admin = await LoginAsync("admin@clinic.local");
        var doctor = await LoginAsync("doctor@clinic.local");

        Assert.Equal(HttpStatusCode.OK,
            (await _client.SendAsync(WithBearer(HttpMethod.Get, "/api/roles", admin))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,
            (await _client.SendAsync(WithBearer(HttpMethod.Get, "/api/roles", doctor))).StatusCode);
    }

    [Fact]
    public async Task Register_patient_clinical_roles_403()
    {
        var doctor = await LoginAsync("doctor@clinic.local");
        var nurse = await LoginAsync("nurse@clinic.local");
        var payload = new { firstName = "Auth", lastName = "Test", sex = "Female", dateOfBirth = "1990-01-15" };

        Assert.Equal(HttpStatusCode.Forbidden,
            (await _client.SendAsync(WithBearer(HttpMethod.Post, "/api/patients", doctor, payload))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,
            (await _client.SendAsync(WithBearer(HttpMethod.Post, "/api/patients", nurse, payload))).StatusCode);
    }

    [Fact]
    public async Task Chart_allergy_Receptionist_403_Doctor_not_403()
    {
        var desk = await LoginAsync("desk@clinic.local");
        var doctor = await LoginAsync("doctor@clinic.local");
        var patientId = Guid.NewGuid();
        var allergy = new { substance = "Penicillin", severity = "Severe" };

        Assert.Equal(HttpStatusCode.Forbidden,
            (await _client.SendAsync(WithBearer(HttpMethod.Post,
                $"/api/patients/{patientId}/chart/allergies", desk, allergy))).StatusCode);

        var doctorRes = await _client.SendAsync(WithBearer(HttpMethod.Post,
            $"/api/patients/{patientId}/chart/allergies", doctor, allergy));
        Assert.NotEqual(HttpStatusCode.Forbidden, doctorRes.StatusCode);
        Assert.NotEqual(HttpStatusCode.Unauthorized, doctorRes.StatusCode);
    }

    private sealed class LoginBody
    {
        public string AccessToken { get; set; } = string.Empty;
    }
}
