using System.Net;
using System.Collections.Generic;
using PasswordManagerApp.Models.Requests;

namespace PasswordManagerApp.Models 
{
  public interface ISessionManager
  {
    int Count { get; }
    int GridHeight { get; }
    int GridWidth { get; }
    SecureSession CreateSession(IPAddress clientIp);
    OpenSessionResult OpenSession(LoginRequestBody login, IPAddress clientIp);
    void CleanUpSessions();
    List<string> GetAvailableDataFiles();
  }
}