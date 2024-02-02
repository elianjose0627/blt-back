import crypto from 'crypto'

const algorithm = 'aes-256-ecb'
const secretKey = String(process.env.COMPANY_INVITE_SECRET_KEY)
const iv = null // Initialization Vector

type Encoding = 'hex' | 'base64'

export const encryptUUID = (uuid: string, outputEncoding: Encoding): string => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  let encrypted = cipher.update(uuid, 'utf8', outputEncoding)
  encrypted += cipher.final(outputEncoding)
  return encrypted
}

export const decryptUUID = (encryptedUUID: string, inputEncoding: Encoding): string => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, null)
  let decrypted = decipher.update(encryptedUUID, inputEncoding, 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
