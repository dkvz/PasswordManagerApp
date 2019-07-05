using System;
using System.Collections.Generic;
using System.Net;
using Microsoft.Extensions.Configuration;
using PasswordManagerApp.Security;

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
    /**
    I'm not using a dictionnary to store sessions because I like
    to think using a list makes it harder to find the session IDs.
    Yeah I don't know.
    */
    public List<SecureSession> Sessions { get; set; }
    public int Count => Sessions.Count;
    private bool _cleaningUp = false;
    private IConfiguration _config;
    private TimeSpan _max_age = TimeSpan.FromMinutes(SessionManager.MAX_SESSION_AGE);
    private List<string> _dataFiles;
    private string _dataPath;
    private byte[] _sequence;

    public SessionManager(IConfiguration config) 
    {
      Sessions = new List<SecureSession>();
      _config = config;
      var files = _config.GetSection("dataFiles").Get<List<string>>();
      _dataPath = _config.GetValue<string>("dataPath") ?? "var/";
      // We don't need to keep the sequence in clear text, hash it:
      string sequence = _config.GetValue<string>("sequence") ?? "1,2;99,99";
      _sequence = HashUtils.HashStringToBytes(sequence);
      if (files != null) _dataFiles = files;
      else _dataFiles = new List<string>();
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
    public List<string> GetAvailableDataFiles() 
    {
      return _dataFiles;
    }
    public void Dispose() 
    {
      Sessions.ForEach(s => s.Dispose());
      // We could clear the sequence but since it's in cleartext on
      // the filesystem, I won't bother.
    }
  }
}