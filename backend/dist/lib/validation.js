"use strict";
// src/lib/validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourceSchema = exports.userSchema = void 0;
exports.parse = parse;
exports.safeParse = safeParse;
const zod_1 = require("zod");
// Example schemas
exports.userSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: zod_1.z.string().email('Invalid email address'),
    age: zod_1.z.number().int().min(18, 'Must be at least 18').optional(),
});
exports.resourceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1, 'Title is required'),
    createdAt: zod_1.z.date().default(() => new Date()),
});
/**
 * Validates data against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validation result with parsed data or error
 */
function parse(schema, data) {
    try {
        const parsedData = schema.parse(data);
        return { success: true, data: parsedData };
    }
    catch (error) {
        return { success: false, error: error instanceof zod_1.ZodError ? error : undefined };
    }
}
/**
 * Safely validates and transforms data, returning null on failure
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Parsed data or null
 */
function safeParse(schema, data) {
    const result = schema.safeParse(data);
    return result.success ? result.data : null;
}
