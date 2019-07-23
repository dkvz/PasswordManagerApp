using NUnit.Framework;
using PasswordManager.Security;
using System.Text;
using System.Linq;
using System;

namespace PasswordManagerApp.Tests
{
    public class EncryptionTests
    {
        [SetUp]
        public void Setup()
        {
        }

        [Test]
        public void EncryptAndDecryptCheckZeroPadding()
        {
          string encrypted = AES256.Encrypt("test", "password");
          byte[] decrypted = AES256.DecryptToByteArray(
            encrypted, 
            Encoding.UTF8.GetBytes("password")
          );
          Assert.That(
            decrypted, 
            Is.EqualTo(
              new byte[] 
                {116, 101, 115, 116, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
            )
          );
        }
    }
}