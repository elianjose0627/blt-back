
import { encryptUUID } from './encryption'

const secretKey = String(process.env.MAGIC_LINK_SECRET_KEY)

const generateMagicLink = (userId: string): string => {
  const magicLink = encryptUUID(userId, 'hex', secretKey)

  return magicLink
}

export default generateMagicLink
