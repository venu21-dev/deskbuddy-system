using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace DeskBuddy.Api.Filters;

public class ApiKeyAuthFilter : IActionFilter
{
    private const string ApiKeyHeader = "X-Api-Key";
    private readonly IConfiguration _config;

    public ApiKeyAuthFilter(IConfiguration config)
    {
        _config = config;
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.HttpContext.Request.Headers.TryGetValue(ApiKeyHeader, out var providedKey))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "API key missing." });
            return;
        }

        var expectedKey = _config["Device:ApiKey"];

        if (providedKey != expectedKey)
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Invalid API key." });
        }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}
