import crypto from 'crypto';
import { LoggingService } from '../logging/LoggingService';

export class EncryptionService {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly keyLength = 32;
  private static readonly ivLength = 16;
  private static readonly saltLength = 64;
  private static readonly tagLength = 16;

  private static encryptionKey: Buffer;

  static initialize(): void {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    this.encryptionKey = crypto.scryptSync(
      process.env.ENCRYPTION_KEY,
      'salt',
      this.keyLength
    );
  }

  static encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const salt = crypto.randomBytes(this.saltLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag();

      const result = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);
      return result.toString('base64');
    } catch (error) {
      LoggingService.error('Encryption failed', error as Error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const buffer = Buffer.from(encryptedText, 'base64');
      
      const salt = buffer.subarray(0, this.saltLength);
      const iv = buffer.subarray(this.saltLength, this.saltLength + this.ivLength);
      const tag = buffer.subarray(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength);
      const encrypted = buffer.subarray(this.saltLength + this.ivLength + this.tagLength);

      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      LoggingService.error('Decryption failed', error as Error);
      throw new Error('Failed to decrypt data');
    }
  }

  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex') + ':' + salt;
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [hash, salt] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
} 