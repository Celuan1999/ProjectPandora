// src/lib/validation.ts

import { z, ZodError } from 'zod';

// Example schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  age: z.number().int().min(18, 'Must be at least 18').optional(),
});

export const resourceSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  createdAt: z.date().default(() => new Date()),
});

export type User = z.infer<typeof userSchema>;
export type Resource = z.infer<typeof resourceSchema>;

// Validation result interface (now exported)
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: ZodError;
}

/**
 * Validates data against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validation result with parsed data or error
 */
export function parse<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const parsedData = schema.parse(data);
    return { success: true, data: parsedData };
  } catch (error) {
    return { success: false, error: error instanceof ZodError ? error : undefined };
  }
}

/**
 * Safely validates and transforms data, returning null on failure
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Parsed data or null
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}