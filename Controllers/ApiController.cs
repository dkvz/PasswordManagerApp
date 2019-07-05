using Microsoft.AspNetCore.Mvc;
using System;
using PasswordManagerApp.Models;
using PasswordManager.Models;
using PasswordManagerApp.Models.Requests;

namespace PasswordManagerApp.Controllers
{

  /// API Controller used by the client side JavaScript
  ///
  /// I thought of not using object bindings for JSON POST 
  /// requests since it's copying more immutable sensible
  /// strings around in memory, but using it is not only
  /// much more convenient but I also learn to write better
  /// dotnet core code which was the side goal of this 
  /// project. So, now you know (?).
  ///
  [Produces("application/json")]
  [Route("api/v1/[action]")]
  public class ApiController : Controller
  {

    [HttpGet]
    public JsonResult Test()
    {
      Console.WriteLine("In the API endpoint...");
      return Json("hello");
    }

    [HttpPost]
    public JsonResult Posterz([FromBody]TestRequest pwd)
    {
      Console.WriteLine($"POSTED DATA HERE: {pwd.Name} - {pwd.Password}");
      return Json(pwd);
    }

  }

}