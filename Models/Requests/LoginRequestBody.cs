
using System;

namespace PasswordManagerApp.Models.Requests
{
  [Serializable]
  public class LoginRequestBody
  {
    public string Name { get; set; }
    public string Password { get; set; }
    public DateTime Date { get; set; }
    public LoginRequestBody(string name, string password, DateTime date) {
      Name = name;
      Password = password;
      Date = date;
    }
  }
}