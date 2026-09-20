namespace OpenClinicalRecord.Api.Services.Common;

/// <summary>
/// Business calendar for OCR. Clinic operates on Africa/Addis_Ababa (UTC+3, no DST).
/// Use for "today", dashboard buckets, and date-of-birth comparisons — not UTC midnight.
/// </summary>
public static class ClinicTime
{
    public static readonly TimeZoneInfo Zone = ResolveZone();

    public static DateTimeOffset Now => TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, Zone);

    public static DateOnly Today => DateOnly.FromDateTime(Now.DateTime);

    public static DateOnly ToClinicDate(DateTimeOffset value) =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(value, Zone).DateTime);

    private static TimeZoneInfo ResolveZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Africa/Addis_Ababa");
        }
        catch (TimeZoneNotFoundException)
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("E. Africa Standard Time");
            }
            catch
            {
                return TimeZoneInfo.CreateCustomTimeZone(
                    "Africa/Addis_Ababa",
                    TimeSpan.FromHours(3),
                    "East Africa Time",
                    "EAT");
            }
        }
    }
}
