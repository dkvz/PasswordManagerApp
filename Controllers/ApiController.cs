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

    private ISessionManager _sessionManager;

    public ApiController(ISessionManager sessionManager)
    {
      _sessionManager = sessionManager;
    }

    [HttpGet]
    public JsonResult Test()
    {
      Console.WriteLine("In the API endpoint...");
      return Json("hello");
    }

    [HttpPost]
    public JsonResult Login([FromBody]LoginRequestBody login)
    {
      // - Check that the session exists
      // - Check that it's valid for current IP address
      // -> We then need to call something that will decrypt the file and
      //    re-encrypt it in the session memory - Try catch that appropriately
      
      return Json(login);
    }

  }

}