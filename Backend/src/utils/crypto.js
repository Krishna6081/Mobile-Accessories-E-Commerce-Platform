const crypto = require('crypto');

const getSecretKey = () => {
  const key = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
  return Buffer.from(key.padEnd(32, '0').slice(0, 32));
};

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', getSecretKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText) {
  if (!encryptedText) return null;
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv('aes-256-gcm', getSecretKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
}

function maskSecret(text) {
  if (!text) return '••••••••';
  const visible = text.slice(-4);
  return '••••••••' + visible;
}

module.exports = {
  encrypt,
  decrypt,
  maskSecret,
};
