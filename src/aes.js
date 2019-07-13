import aesjs from 'aes-js';
import pbkdf2 from 'pbkdf2';
import { Uint8ArrayToBase64, base64ToUint8Array } from './b64Uint8ArrayConversions';

export default {
  crypto: (self.crypto || self.msCrypto),
  quota: 65536,
  saltBytes: 16,
  ivBytes: 16,
  // Stolen and adapted from here: https://gist.github.com/alexdiliberto/39a4ad0453310d0a69ce
  randomBytes: function(n) {
    const a = new Uint8Array(n);
    for (let i = 0; i < n; i += this.quota) {
      this.crypto.getRandomValues(a.subarray(i, i + Math.min(n - i, this.quota)));
    }
    return a;
  },
  encrypt: function(payload, password) {
    return new Promise((resolve, reject) => {
      // We want to output a base64 string in the end.
      // I should probably document the specificities of the encryption 
      // somewhere though it can all be found here, basically.
      const iv = this.randomBytes(this.blockBytes);
      const salt = this.randomBytes(this.saltBytes);
      pbkdf2.pbkdf2(password, salt, 10000, 32, 'sha1', (err, dKey) => {
        if (err) reject(err);
        else {
          const aesCbc = new aesjs.ModeOfOperation.cbc(dKey, iv);
          const encryptedBytes = aesCbc.encrypt(
            aesjs.padding.pkcs7.pad(aesjs.utils.utf8.toBytes(payload))
          );
          const fullBytes = new Uint8Array(encryptedBytes.length + salt.length + iv.length);
          fullBytes.set(salt);
          fullBytes.set(iv, salt.length);
          fullBytes.set(encryptedBytes, salt.length + iv.length);
          resolve(Uint8ArrayToBase64(fullBytes));
        }
      });
    });
  },
  decrypt: function(payload, password) {
    return new Promise((resolve, reject) => {
      // We expect payload to be base64.
      
    });
  },
  /**
   * Stole this from here: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
   */
  hexString: function(buffer) {
    const byteArray = new Uint8Array(buffer);

    const hexCodes = [...byteArray].map(value => {
      const hexCode = value.toString(16);
      const paddedHexCode = hexCode.padStart(2, '0');
      return paddedHexCode;
    });
  
    return hexCodes.join('');
  },
  hash: function(source) {
    // Source has to be converted ty a byte array.
    // We can use aesjs.utils.utf8.toBytes.
    return this.crypto.subtle.digest(
      'SHA-1',
      aesjs.utils.utf8.toBytes(source)
    )
    .then(value => this.hexString(value))
    .catch(() => this.hexString(this.randomBytes(20)));
  }
    
};