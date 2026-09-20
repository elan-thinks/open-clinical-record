namespace OpenClinicalRecord.Api.Services.Common;

/// <summary>
/// Lightweight application-layer result. Controllers map this to HTTP responses.
/// </summary>
public sealed class ServiceResult<T>
{
    public bool Succeeded { get; init; }
    public T? Value { get; init; }
    public string? Error { get; init; }
    public ServiceErrorKind ErrorKind { get; init; } = ServiceErrorKind.None;

    public static ServiceResult<T> Ok(T value) => new() { Succeeded = true, Value = value };

    public static ServiceResult<T> Fail(string message, ServiceErrorKind kind) =>
        new() { Succeeded = false, Error = message, ErrorKind = kind };
}

public enum ServiceErrorKind
{
    None,
    NotFound,
    Validation,
    Conflict,
    Forbidden,
    /// <summary>Infrastructure / unexpected failure → HTTP 500.</summary>
    Internal
}

/// <summary>
/// Authenticated actor context passed from the API layer into application services.
/// </summary>
public readonly record struct ActorContext(string? UserId, string DisplayName);
