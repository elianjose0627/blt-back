import { getStorage } from 'firebase-admin/storage'

const storageBucket = String(process.env.GETEC_STORAGE_BUCKET)
const bucket = getStorage().bucket(storageBucket)

export const uploadToGCS = async (fileName: string, fileBuffer: Buffer): Promise<string> => {
  const file = bucket.file(fileName)

  await file.save(fileBuffer, {
    metadata: {
      contentType: 'application/xml'
    }
  })

  return `https://storage.cloud.google.com/${storageBucket}/${fileName}`
}
