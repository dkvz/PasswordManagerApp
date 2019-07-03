using System;

namespace PasswordManagerApp.Models 
{
  public class SessionManager : ISessionManager, IDisposable
  {
    public int Counter { get; set; } = 0;
    public int CreateSession() {
      return ++Counter;
    }
    public void Dispose() {
      Console.WriteLine("Would have disposed the SessionManager");
    }
  }
}