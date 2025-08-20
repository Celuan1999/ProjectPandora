// backend/src/utils/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

export const encryptData = (data: any): string => {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY!), iv);
  const encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex') + cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

export const decryptData = (encrypted: string): any => {
  const [ivHex, encryptedData] = encrypted.split(':');
  if (!ivHex || !encryptedData) throw new Error('Invalid encrypted data format');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY!), iv);
  return JSON.parse(decipher.update(encryptedData, 'hex', 'utf8') + decipher.final('utf8'));
};

export const generateInviteKey = (resourceId: string): string => {
  const payload = { resourceId, timestamp: Date.now() };
  return jwt.sign(payload, process.env.INVITE_SECRET!, { expiresIn: '7d' });
};

export const generateRequestId = (): string => {
  return randomUUID();
};