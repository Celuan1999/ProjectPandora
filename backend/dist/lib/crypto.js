"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRequestId = exports.generateInviteKey = exports.decryptData = exports.encryptData = void 0;
// backend/src/utils/crypto.ts
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const encryptData = (data) => {
    const iv = (0, crypto_1.randomBytes)(16);
    const cipher = (0, crypto_1.createCipheriv)('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), iv);
    const encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex') + cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};
exports.encryptData = encryptData;
const decryptData = (encrypted) => {
    const [ivHex, encryptedData] = encrypted.split(':');
    if (!ivHex || !encryptedData)
        throw new Error('Invalid encrypted data format');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), iv);
    return JSON.parse(decipher.update(encryptedData, 'hex', 'utf8') + decipher.final('utf8'));
};
exports.decryptData = decryptData;
const generateInviteKey = (resourceId) => {
    const payload = { resourceId, timestamp: Date.now() };
    return jsonwebtoken_1.default.sign(payload, process.env.INVITE_SECRET, { expiresIn: '7d' });
};
exports.generateInviteKey = generateInviteKey;
const generateRequestId = () => {
    return (0, crypto_1.randomUUID)();
};
exports.generateRequestId = generateRequestId;
