var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

// Use CORS before other middleware that might short-circuit
app.UseCors(CorsPolicyName);

// Optional HTTPS redirection — keep off in pure local HTTP if needed;
// development cert is available but frontend calls http by default.
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

// Make the Program class accessible for integration tests
public partial class Program { }
