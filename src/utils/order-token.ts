/**
 * Generates a unique order token
 * Format: 6 characters (A-Z, 0-9)
 * Example: 4FUG5A, B7K2M9, etc.
 */
export function generateOrderToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''

  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * Validates order token format
 */
export function isValidOrderToken(token: string): boolean {
  return /^[A-Z0-9]{6}$/.test(token)
}
