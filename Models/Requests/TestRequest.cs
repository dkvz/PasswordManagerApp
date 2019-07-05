using System;

namespace PasswordManagerApp.Models.Requests
{
  [Serializable]
  public class TestRequest
  {
    public string Name { get; set; }
    public string Password { get; set; }
    public DateTime Date { get; set; }
    public TestRequest(string name, string password, DateTime date) 
    {
      Name = name;
      Password = password;
      Date = date;
    }
  }
}