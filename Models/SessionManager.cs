using System;
using System.Collections.Generic;
using System.Net;

namespace PasswordManagerApp.Models 
{
  /**
    Not thread safe. But I don't really care.
   */
  public class SessionManager : ISessionManager, IDisposable
  {
    // Max Age in minutes. I don't think it can go over 60. 
    // Maybe. I don't know.
    public const int MAX_SESSION_AGE = 15;
    public List<SecureSession> Sessions { get; set; }

    public int Count => Sessions.Count;

    private bool _cleaningUp = false;
    private TimeSpan _max_age = TimeSpan.FromMinutes(SessionManager.MAX_SESSION_AGE);

    public SessionManager() 
    {
      Sessions = new List<SecureSession>();
    }
    public SecureSession CreateSession(IPAddress clientIp) 
    {
      var sess = new SecureSession(clientIp);
      Sessions.Add(sess);
      return sess;
    }
    public void CleanUpSessions() 
    {
      if (!_cleaningUp)
      {
        _cleaningUp = true;
        Sessions.RemoveAll(s => DateTime.Now - s.Created > _max_age);
        _cleaningUp = false;
      }
    }
    public void Dispose() 
    {
      Sessions.ForEach(s => s.Dispose());
    }
  }
}