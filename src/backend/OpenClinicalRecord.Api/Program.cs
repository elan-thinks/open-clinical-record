using OpenClinicalRecord.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// PostgreSQL + EF Core
builder.Services.AddApplicationDatabase(builder.Configuration);

// CORS for local React development (Vite default port 5173)
const string CorsPolicyName = "LocalDevCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(CorsPolicyName);

// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

// Make the Program class accessible for integration tests
public partial class Program { }
