import crypto from 'crypto'

const algorithm = 'aes-256-cbc'
const secretKey = String(process.env.COMPANY_INVITE_SECRET_KEY)

type Encoding = 'hex' | 'base64'

export const encodeString = (text: string, encoding: Encoding): string => {
  return Buffer.from(text, 'utf-8').toString(encoding)
}

export const decodeString = (text: string, encoding: Encoding): string => {
  return Buffer.from(text, encoding).toString('utf-8')
}

const generateIV = (value: string): string => {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16)
}

export const encryptUUID = (uuid: string, outputEncoding: Encoding, initializationVectorValue: string): string => {
  const iv = generateIV(initializationVectorValue)
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  let encrypted = cipher.update(uuid, 'utf8', outputEncoding)
  encrypted += cipher.final(outputEncoding)
  return encrypted
}

export const decryptUUID = (encryptedUUID: string, inputEncoding: Encoding, initializationVectorValue: string): string => {
  const iv = generateIV(initializationVectorValue)
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv)
  let decrypted = decipher.update(encryptedUUID, inputEncoding, 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
