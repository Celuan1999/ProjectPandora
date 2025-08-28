// src/lib/responses.ts

import { Response } from 'express'; // Assuming Express.js; adjust if using another framework

// Interface for standard JSON response
interface JsonResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Interface for RFC 7807 Problem Details
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown; // Allow additional fields
}

/**
 * Sends a standardized JSON response
 * @param res Express Response object
 * @param statusCode HTTP status code
 * @param data Response data (optional)
 * @param error Error details (optional)
 */
export function json<T>(
  res: Response,
  statusCode: number,
  data?: T,
  error?: { code: string; message: string; details?: unknown }
): void {
  const response: JsonResponse<T> = {
    status: error ? 'error' : 'success',
    data,
    error,
  };
  res.status(statusCode).json(response);
}

/**
 * Sends an RFC 7807 Problem Details JSON response
 * @param res Express Response object
 * @param statusCode HTTP status code
 * @param problem Problem details object
 */
export function problemJson(
  res: Response,
  statusCode: number,
  problem: ProblemDetails
): void {
  res.setHeader('Content-Type', 'application/problem+json');
  res.status(statusCode).json(problem);
}

// Example usage:
/*
json(res, 200, { id: 1, name: 'Example' }); // Success response
json(res, 400, null, { code: 'INVALID_INPUT', message: 'Invalid input provided' }); // Error response
problemJson(res, 404, {
  type: 'https://example.com/probs/resource-not-found',
  title: 'Resource Not Found',
  status: 404,
  detail: 'The requested resource was not found on the server',
  instance: '/api/resource/123',
});
*/