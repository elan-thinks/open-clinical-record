using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OpenClinicalRecord.Api.DTOs.Auth;
using OpenClinicalRecord.Api.Models.Entities;
using OpenClinicalRecord.Api.Services;
using OpenClinicalRecord.Api.Services.Audit;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IJwtTokenService _tokenService;
    private readonly IAuditService _audit;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IJwtTokenService tokenService,
        IAuditService audit)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _audit = audit;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var email = request.Email?.Trim() ?? string.Empty;
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null || !user.IsActive)
        {
            await _audit.WriteAsync(
                "Auth.LoginFailed", "Auth", null,
                actorUserId: null, actorName: email,
                summary: "Unknown user or inactive account", cancellationToken);
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            await _audit.WriteAsync(
                "Auth.LoginFailed", "Auth", null,
                user.Id, user.FullName,
                result.IsLockedOut ? "Account locked out" : "Invalid password",
                cancellationToken);
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var (token, expiresAt) = _tokenService.CreateToken(user, roles);

        await _audit.WriteAsync(
            "Auth.Login", "Auth", null,
            user.Id, user.FullName,
            $"Roles: {string.Join(',', roles)}; MustChangePassword={user.MustChangePassword}",
            cancellationToken);

        return Ok(new LoginResponse
        {
            AccessToken = token,
            ExpiresAt = expiresAt,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Roles = roles.ToList(),
            MustChangePassword = user.MustChangePassword
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
            return Unauthorized();

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new MeResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Roles = roles.ToList(),
            MustChangePassword = user.MustChangePassword
        });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var user = await GetCurrentUserAsync();
        if (user is null)
            return Unauthorized();

        var result = await _userManager.ChangePasswordAsync(
            user, request.CurrentPassword, request.NewPassword);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = string.Join("; ", result.Errors.Select(e => e.Description))
            });
        }

        user.MustChangePassword = false;
        await _userManager.UpdateAsync(user);

        await _audit.WriteAsync(
            "Auth.ChangePassword", "Auth", null,
            user.Id, user.FullName, "Password changed", default);

        return Ok(new { message = "Password updated successfully.", mustChangePassword = false });
    }

    private async Task<ApplicationUser?> GetCurrentUserAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrEmpty(userId))
            return null;

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null || !user.IsActive)
            return null;
        return user;
    }
}
