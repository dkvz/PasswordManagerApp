using System.Net;

namespace PasswordManagerApp.Models 
{
  public interface ISessionManager
  {
    SecureSession CreateSession(IPAddress clientIp);
  }
}