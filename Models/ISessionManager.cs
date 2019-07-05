using System.Net;
using System.Collections.Generic;

namespace PasswordManagerApp.Models 
{
  public interface ISessionManager
  {
    int Count { get; }
    SecureSession CreateSession(IPAddress clientIp);
    void CleanUpSessions();
    List<string> GetAvailableDataFiles();
  }
}