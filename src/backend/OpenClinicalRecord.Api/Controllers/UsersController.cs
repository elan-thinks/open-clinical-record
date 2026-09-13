using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.DTOs.Users;
using OpenClinicalRecord.Api.Models.Entities;
using OpenClinicalRecord.Api.Models.Enums;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public UsersController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
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
            result.Add(new UserListItemDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                IsActive = user.IsActive,
                Roles = roles.ToList(),
                CreatedAt = user.CreatedAt
            });
        }

        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(UserListItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var invalidRoles = request.Roles.Where(r => !AppRoles.All.Contains(r)).ToList();
        if (invalidRoles.Count > 0)
        {
            return BadRequest(new { message = $"Invalid role(s): {string.Join(", ", invalidRoles)}" });
        }

        var existing = await _userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
        {
            return BadRequest(new { message = "A user with this email already exists." });
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            FullName = request.FullName,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(new { message = string.Join("; ", createResult.Errors.Select(e => e.Description)) });
        }

        await _userManager.AddToRolesAsync(user, request.Roles.Distinct());

        var roles = await _userManager.GetRolesAsync(user);
        var dto = new UserListItemDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            IsActive = user.IsActive,
            Roles = roles.ToList(),
            CreatedAt = user.CreatedAt
        };

        return CreatedAtAction(nameof(List), new { id = user.Id }, dto);
    }

    [HttpPut("{id}/roles")]
    [ProducesResponseType(typeof(UserListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRoles(string id, [FromBody] UpdateUserRolesRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        var invalidRoles = request.Roles.Where(r => !AppRoles.All.Contains(r)).ToList();
        if (invalidRoles.Count > 0)
        {
            return BadRequest(new { message = $"Invalid role(s): {string.Join(", ", invalidRoles)}" });
        }

        var current = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, current);
        await _userManager.AddToRolesAsync(user, request.Roles.Distinct());

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new UserListItemDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            IsActive = user.IsActive,
            Roles = roles.ToList(),
            CreatedAt = user.CreatedAt
        });
    }

    [HttpPut("{id}/active")]
    [ProducesResponseType(typeof(UserListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetActive(string id, [FromBody] SetUserActiveRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        user.IsActive = request.IsActive;
        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new UserListItemDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            IsActive = user.IsActive,
            Roles = roles.ToList(),
            CreatedAt = user.CreatedAt
        });
    }
}
