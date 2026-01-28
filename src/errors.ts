/**
 * Custom error classes for the transliteration library
 */

export class TransliterationError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'TransliterationError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends TransliterationError {
  constructor(message: string, cause?: unknown) {
    super(message, 'VALIDATION_ERROR', cause);
    this.name = 'ValidationError';
  }
}

export class SecurityError extends TransliterationError {
  constructor(message: string, cause?: unknown) {
    super(message, 'SECURITY_ERROR', cause);
    this.name = 'SecurityError';
  }
}

/**
 * Error codes
 */
export const ERROR_CODES = {
  INVALID_INPUT_TYPE: 'INVALID_INPUT_TYPE',
  INPUT_TOO_LONG: 'INPUT_TOO_LONG',
  INPUT_EMPTY: 'INPUT_EMPTY',
  INVALID_CHARACTERS: 'INVALID_CHARACTERS',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
} as const;
