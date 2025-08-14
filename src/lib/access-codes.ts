import crypto from 'crypto'

const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

/**
 * Generate a random 6-character alphanumeric code
 * @returns A 6-character string containing only A-Z and 0-9
 */
export function make6(): string {
  let s = ""
  for (let i = 0; i < 6; i++) {
    s += ALPHANUM[crypto.randomInt(ALPHANUM.length)]
  }
  return s
}

/**
 * Generate multiple unique access codes
 * @param count Number of codes to generate
 * @returns Array of unique 6-character codes
 */
export function generateMultipleCodes(count: number): string[] {
  const codes: string[] = []
  const usedCodes = new Set<string>()
  
  while (codes.length < count) {
    const code = make6()
    if (!usedCodes.has(code)) {
      usedCodes.add(code)
      codes.push(code)
    }
  }
  
  return codes
}

/**
 * Validate if a code matches the expected format
 * @param code The code to validate
 * @returns True if the code is valid (6 characters, A-Z0-9 only)
 */
export function isValidCodeFormat(code: string): boolean {
  if (!code || code.length !== 6) {
    return false
  }
  
  const validChars = /^[A-Z0-9]{6}$/
  return validChars.test(code.toUpperCase())
}
