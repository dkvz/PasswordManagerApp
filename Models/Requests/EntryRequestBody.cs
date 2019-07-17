
using System;

namespace PasswordManagerApp.Models.Requests
{
  [Serializable]
  public class EntryRequestBody : RequestBody
  {
    /// Encrypted new password to save:
    public string Password { get; set; }
    /// Requested data file
    public string Name { get; set; }
    public int EntryId { get; set; }
    public EntryRequestBody(string sessionId, string password, string name, int entryId) 
      : base(sessionId)
    {
      Password = password;
      Name = name;
      EntryId = entryId;
    }
  }
}