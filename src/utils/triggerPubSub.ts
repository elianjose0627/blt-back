import { PubSub } from '@google-cloud/pubsub'
import logger from './logger'

const pubSubClient = new PubSub()

const triggerPubSub = async (topicId: string, functionName = 'Cloud Function', attributes: { [k: string]: string }): Promise<boolean> => {
  const environment = String(process.env.ENVIRONMENT)

  const message = Buffer.from(JSON.stringify({ message: `Trigger ${functionName} for ${environment}` }))

  try {
    const messageId = await pubSubClient
      .topic(topicId)
      .publishMessage({
        data: message,
        attributes: {
          environment,
          ...attributes
        }
      })
    logger.info('Message %s published.', messageId)
    return true
  } catch (error: any) {
    logger.error(error.message)
    return false
  }
}

export default triggerPubSub
