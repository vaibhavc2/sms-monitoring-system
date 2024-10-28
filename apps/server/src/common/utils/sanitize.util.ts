export function sanitize(value: unknown): string {
  // Convert the value to string and handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Convert any input to string
  const stringValue = String(value);

  // Remove special characters
  return stringValue.replace(/[^a-zA-Z0-9-_]/g, '');
}

/**
 * Sanitizes a parameter to be used in a Redis key to prevent injection attacks.
 * This is a basic implementation and might need to be adjusted based on your security requirements.
 *
 * @param params The parameters to sanitize.
 * @returns The sanitized parameters.
 */
export function sanitizeParams(params: unknown[]): string[] {
  // Handle case where params is undefined or null
  if (!Array.isArray(params)) {
    return [];
  }

  return params.map((str) => sanitize(str));
}
