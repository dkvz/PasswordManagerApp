using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using PasswordManagerApp.Models;

namespace PasswordManagerApp.Pages
{
  public class IndexModel : PageModel
  {
    private readonly ISessionManager _sessionManager;
    public IndexModel(ISessionManager sessionManager)
    {
      _sessionManager = sessionManager;
    }
    public void OnGet()
    {
      Console.WriteLine(_sessionManager.CreateSession());
    }
  }
}
