/**
  I called this "SecureSession" because Session doesn't exist in .NET Core.
  But in retrospect I could've just called it Session.
 */

using System;
using System.Net;
using System.Security.Cryptography;

namespace PasswordManagerApp.Models 
{
  public class SecureSession: IDisposable
  {
    public const int SESSION_ID_SIZE = 32;
    public IPAddress ClientIp { get; private set; }
    public byte[] SessionId { get; private set; }
    public DateTime Created { get; private set; }

    public SecureSession(IPAddress clientIp) 
    {
      ClientIp = clientIp;
      Created = DateTime.Now;
      var prov = new RNGCryptoServiceProvider();
      SessionId = new byte[SecureSession.SESSION_ID_SIZE];
      prov.GetBytes(SessionId);
    }

    public void Dispose() 
    {
      Array.Clear(SessionId, 0, SessionId.Length);
    }

    public override string ToString() 
    {
      return Convert.ToBase64String(SessionId);
    }
  }
}