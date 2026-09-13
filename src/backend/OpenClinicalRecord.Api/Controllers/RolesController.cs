using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.DTOs.Roles;
using OpenClinicalRecord.Api.Models.Entities;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class RolesController : ControllerBase
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public RolesController(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager)
    {
        _roleManager = roleManager;
        _userManager = userManager;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RoleDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var roles = await _roleManager.Roles
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);

        var result = new List<RoleDto>();
        foreach (var role in roles)
        {
            var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name!);
            result.Add(new RoleDto
            {
                Id = role.Id,
                Name = role.Name ?? string.Empty,
                UserCount = usersInRole.Count
            });
        }

        return Ok(result);
    }
}
