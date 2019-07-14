using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using PasswordManagerApp.Models;
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
      return Json("hello");
    }

    [HttpPost]
    public JsonResult Names([FromBody]LoginRequestBody sess)
    {
      if (sess != null && sess.SessionId != null && sess.SessionId.Length > 0)
      {
        var session = _sessionManager.GetSession(
          sess.SessionId, 
          Request.HttpContext.Connection.RemoteIpAddress
        );
        if (session != null)
        {
          return Json(session.Data.PasswordEntries.Select(e => e.Name));
        }
      }

      var res = new JsonResult(new { result = "Non authorized" });
      res.StatusCode = 403;
      return res;
    }

    [HttpPost]
    public JsonResult Login([FromBody]LoginRequestBody login)
    {
      // - Check that the session exists
      // - Check that it's valid for current IP address
      // -> We then need to call something that will decrypt the file and
      //    re-encrypt it in the session memory - Try catch that appropriately

      // See JS function postLogin in api.js as to what is going
      // to use this endpoint.

      var res = new JsonResult(null);

      try
      {
        // Check if the request body is valid:
        if (login != null)
        {
          var result = _sessionManager.OpenSession(
            login,
            Request.HttpContext.Connection.RemoteIpAddress
          );
          // We should consider invalid IP address and invalid session to be
          // the same thing as far as the result status goes.
          switch (result)
          {
            case OpenSessionResult.DataFileError:
            case OpenSessionResult.InvalidPasswordOrFSError:
              res.Value = new { result = "Invalid password or data file error" };
              res.StatusCode = 403;
              break;
            case OpenSessionResult.InvalidSessionId:
              res.Value = new { result = "Invalid session ID" };
              res.StatusCode = 401;
              break;
            case OpenSessionResult.Success:
              res.Value = new { result = "Success" };
              res.StatusCode = 200;
              break;
            default:
              res.Value = new { result = "Unknown error" };
              res.StatusCode = 403;
              break;
          }
        }
        else
        {
          res.Value = new { result = "Invalid arguments" };
          res.StatusCode = 400;
        }
      }
      catch (Exception ex)
      {
        Console.Error.WriteLine("Error when opening session");
        Console.Error.WriteLine(ex.StackTrace);
        Console.Error.WriteLine(ex.ToString());
        res.Value = new { result = "Server error" };
        res.StatusCode = 500;
      }

      return res;
    }

  }

}