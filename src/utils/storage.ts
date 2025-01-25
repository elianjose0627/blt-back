import { Storage } from '@google-cloud/storage'

const privateKey = (process.env.FIREBASE_PRIVATE_KEY as string).split(String.raw`\n`).join('\n')

const storage = new Storage(
  {
    projectId: process.env.FIREBASE_PROJECT_ID,
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: privateKey
    }
  }
)
const bucketName = String(process.env.GETEC_STORAGE_BUCKET)

export const uploadToGCS = async (fileName: string, fileBuffer: Buffer): Promise<string> => {
  const bucket = storage.bucket(bucketName)
  const file = bucket.file(fileName)

  await file.save(fileBuffer, {
    metadata: {
      contentType: 'application/xml'
    }
  })

  return `https://storage.cloud.google.com/${bucketName}/${fileName}`
}
