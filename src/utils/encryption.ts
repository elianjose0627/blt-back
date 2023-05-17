import crypto from 'crypto'

const algorithm = 'aes-256-ecb'
const secretKey = String(process.env.COMPANY_INVITE_SECRET_KEY)
const iv = null // Initialization Vector

export const encryptUUID = (uuid: string): string => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  let encrypted = cipher.update(uuid, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

export const decryptUUID = (encryptedUUID: string): string => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, null)
  let decrypted = decipher.update(encryptedUUID, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
