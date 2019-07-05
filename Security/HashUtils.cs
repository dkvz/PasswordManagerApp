using System;
using System.Text;
using System.Security.Cryptography;

namespace PasswordManagerApp.Security
{
  public class HashUtils
  {

    // Stole the base code from here:
    // https://www.c-sharpcorner.com/article/compute-sha256-hash-in-c-sharp/
    
    public static string HashString(string rawData)
    {
      using (SHA1 shaHash = SHA1.Create())
      {
        // ComputeHash - returns byte array  
        byte[] bytes = HashStringToBytes(rawData);
        return HashUtils.ByteArrayToHexString(bytes);
      }
    }

    public static string ByteArrayToHexString(byte[] bytes)
    {
      // Convert byte array to a string   
      StringBuilder builder = new StringBuilder();
      for (int i = 0; i < bytes.Length; i++)
      {
        builder.Append(bytes[i].ToString("x2"));
      }
      return builder.ToString();
    }

    public static byte[] HashStringToBytes(string rawData)
    {
      using (SHA1 shaHash = SHA1.Create())
      {
        // ComputeHash - returns byte array  
        return shaHash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
      }
    }

    public static void ClearByteArray(byte[] ba)
    {
      Array.Clear(ba, 0, ba.Length);
    }

  }
}