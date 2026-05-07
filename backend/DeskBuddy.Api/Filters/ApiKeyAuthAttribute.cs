using Microsoft.AspNetCore.Mvc;

namespace DeskBuddy.Api.Filters;

public class ApiKeyAuthAttribute : ServiceFilterAttribute
{
    public ApiKeyAuthAttribute() : base(typeof(ApiKeyAuthFilter)) { }
}
