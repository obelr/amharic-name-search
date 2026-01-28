/**
 * Input validation and sanitization utilities
 */

import { ValidationError, SecurityError, ERROR_CODES } from './errors';

/**
 * Maximum input length to prevent DoS attacks
 */
export const MAX_INPUT_LENGTH = 1000;

/**
 * Maximum query length for search operations
 */
export const MAX_QUERY_LENGTH = 500;

/**
 * Control characters that should be removed for security
 */
const CONTROL_CHARACTERS_REGEX = /[\x00-\x1F\x7F-\x9F]/g;

/**
 * Validates and sanitizes input string
 */
export function validateAndSanitizeInput(
  input: unknown,
  maxLength: number = MAX_INPUT_LENGTH,
  fieldName: string = 'input'
): string {
  // Type validation
  if (typeof input !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string, received ${typeof input}`,
      ERROR_CODES.INVALID_INPUT_TYPE
    );
  }

  // Empty check
  if (input.length === 0) {
    throw new ValidationError(
      `${fieldName} cannot be empty`,
      ERROR_CODES.INPUT_EMPTY
    );
  }

  // Length validation
  if (input.length > maxLength) {
    throw new ValidationError(
      `${fieldName} exceeds maximum length of ${maxLength} characters`,
      ERROR_CODES.INPUT_TOO_LONG
    );
  }

  // Sanitize: Remove control characters
  let sanitized = input.replace(CONTROL_CHARACTERS_REGEX, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Check if result is empty after sanitization
  if (sanitized.length === 0) {
    throw new ValidationError(
      `${fieldName} contains only invalid characters`,
      ERROR_CODES.INVALID_CHARACTERS
    );
  }

  return sanitized;
}

/**
 * Validates input for search queries (more lenient)
 */
export function validateSearchQuery(
  query: unknown,
  fieldName: string = 'query'
): string {
  // Allow empty queries for search (return empty array)
  if (query === null || query === undefined || query === '') {
    return '';
  }

  // Handle whitespace-only strings
  if (typeof query === 'string' && query.trim().length === 0) {
    return '';
  }

  try {
    return validateAndSanitizeInput(query, MAX_QUERY_LENGTH, fieldName);
  } catch (error) {
    // If validation fails for search query, return empty string instead of throwing
    // This allows search to gracefully handle invalid inputs
    if (error instanceof ValidationError && error.code === 'INVALID_CHARACTERS') {
      return '';
    }
    throw error;
  }
}

/**
 * Checks if string contains potentially dangerous patterns
 */
export function containsDangerousPatterns(input: string): boolean {
  // SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(UNION|OR|AND)\b.*\b(SELECT|INSERT|UPDATE|DELETE)\b)/i,
  ];

  // XSS patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
  ];

  const allPatterns = [...sqlPatterns, ...xssPatterns];

  return allPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitizes input with security checks
 */
export function sanitizeInput(input: string): string {
  // Check for dangerous patterns
  if (containsDangerousPatterns(input)) {
    throw new SecurityError(
      'Input contains potentially dangerous patterns',
      ERROR_CODES.SECURITY_VIOLATION
    );
  }

  // Remove control characters
  let sanitized = input.replace(CONTROL_CHARACTERS_REGEX, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}
