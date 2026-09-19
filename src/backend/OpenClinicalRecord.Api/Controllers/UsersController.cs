using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.DTOs.Users;
using OpenClinicalRecord.Api.Models.Entities;
using OpenClinicalRecord.Api.Models.Enums;
using OpenClinicalRecord.Api.Services.Audit;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IAuditService _audit;

    public UsersController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IAuditService audit)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _audit = audit;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var users = await _userManager.Users
            .OrderBy(u => u.FullName)
            .ToListAsync(cancellationToken);

        var result = new List<UserListItemDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(Map(user, roles));
        }

        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(UserListItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var invalidRoles = request.Roles.Where(r => !AppRoles.All.Contains(r)).ToList();
        if (invalidRoles.Count > 0)
            return BadRequest(new { message = $"Invalid role(s): {string.Join(", ", invalidRoles)}" });

        var existing = await _userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
            return BadRequest(new { message = "A user with this email already exists." });

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            FullName = request.FullName.Trim(),
            IsActive = true,
            MustChangePassword = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
            return BadRequest(new { message = string.Join("; ", createResult.Errors.Select(e => e.Description)) });

        await _userManager.AddToRolesAsync(user, request.Roles.Distinct());

        var roles = await _userManager.GetRolesAsync(user);
        await _audit.WriteAsync(
            "User.Create", "User", null,
            user.Id, user.FullName,
            $"Created {user.Email}; roles={string.Join(',', roles)}",
            default);

        return CreatedAtAction(nameof(List), new { id = user.Id }, Map(user, roles));
    }

    [HttpPut("{id}/profile")]
    public async Task<IActionResult> UpdateProfile(string id, [FromBody] UpdateUserProfileRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
            return NotFound();

        user.FullName = request.FullName.Trim();
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        var roles = await _userManager.GetRolesAsync(user);
        await _audit.WriteAsync(
            "User.UpdateProfile", "User", null,
            user.Id, user.FullName, "Admin updated display name", default);

        return Ok(Map(user, roles));
    }

    [HttpPut("{id}/roles")]
    public async Task<IActionResult> UpdateRoles(string id, [FromBody] UpdateUserRolesRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
            return NotFound();

        var invalidRoles = request.Roles.Where(r => !AppRoles.All.Contains(r)).ToList();
        if (invalidRoles.Count > 0)
            return BadRequest(new { message = $"Invalid role(s): {string.Join(", ", invalidRoles)}" });

        if (request.Roles.Count == 0)
            return BadRequest(new { message = "At least one role is required." });

        var current = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, current);
        await _userManager.AddToRolesAsync(user, request.Roles.Distinct());

        var roles = await _userManager.GetRolesAsync(user);
        await _audit.WriteAsync(
            "User.UpdateRoles", "User", null,
            user.Id, user.FullName,
            $"Roles → {string.Join(',', roles)}",
            default);

        return Ok(Map(user, roles));
    }

    [HttpPut("{id}/active")]
    public async Task<IActionResult> SetActive(string id, [FromBody] SetUserActiveRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
            return NotFound();

        user.IsActive = request.IsActive;
        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        await _audit.WriteAsync(
            request.IsActive ? "User.Activate" : "User.Deactivate", "User", null,
            user.Id, user.FullName,
            request.IsActive ? "Account activated" : "Account deactivated",
            default);

        return Ok(Map(user, roles));
    }

    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(string id, [FromBody] ResetUserPasswordRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
            return NotFound();

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        user.MustChangePassword = true;
        await _userManager.UpdateAsync(user);

        await _audit.WriteAsync(
            "User.ResetPassword", "User", null,
            user.Id, user.FullName, "Admin set temporary password", default);

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new
        {
            message = "Temporary password set. User must change it on next sign-in.",
            user = Map(user, roles)
        });
    }

    private static UserListItemDto Map(ApplicationUser user, IList<string> roles) => new()
    {
        Id = user.Id,
        Email = user.Email ?? string.Empty,
        FullName = user.FullName,
        IsActive = user.IsActive,
        Roles = roles.ToList(),
        CreatedAt = user.CreatedAt
    };
}
