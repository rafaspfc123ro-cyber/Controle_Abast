import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

/**
 * Generates a salted scrypt hash in the format "salt:hash".
 */
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(String(password), salt, 64).toString('hex')
  return `${salt}:${derived}`
}

/**
 * Verifies a plaintext password against a stored "salt:hash" value.
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false
  const [salt, keyHex] = storedHash.split(':')
  const keyBuffer = Buffer.from(keyHex, 'hex')
  const derivedBuffer = scryptSync(String(password), salt, 64)
  if (keyBuffer.length !== derivedBuffer.length) return false
  return timingSafeEqual(keyBuffer, derivedBuffer)
}
