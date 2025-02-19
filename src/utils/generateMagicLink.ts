
import { encryptUUID } from './encryption'

const secretKey = String(process.env.MAGIC_LINK_SECRET_KEY)

const generateMagicLink = (userId: string): string => {
  const magicLink = encryptUUID(userId, 'base64', secretKey)

  return magicLink
}

export default generateMagicLink
