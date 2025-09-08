"use strict";
// src/lib/responses.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.json = json;
exports.problemJson = problemJson;
/**
 * Sends a standardized JSON response
 * @param res Express Response object
 * @param statusCode HTTP status code
 * @param data Response data (optional)
 * @param error Error details (optional)
 */
function json(res, statusCode, data, error) {
    const response = {
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
function problemJson(res, statusCode, problem) {
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
