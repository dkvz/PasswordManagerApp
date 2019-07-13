
using System;

namespace PasswordManagerApp.Models.Requests
{
  [Serializable]
  public class LoginRequestBody
  {
    /// SessionId is a hash(hash(sequence) + Original Session ID)
    public string SessionId { get; set; }
    /// Encrypted master password
    public string Password { get; set; }
    /// Requested data file
    public int DataFile { get; set; }
    public LoginRequestBody(string sessionId, string password, int dataFile) {
      SessionId = sessionId;
      Password = password;
      DataFile = dataFile;
    }
  }
}