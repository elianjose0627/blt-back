import { v1 as uuidv1 } from 'uuid'
import { initializeApp, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import path from 'path'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // replace `\` and `n` character pairs w/ single `\n` character
    privateKey: String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n')
  })
})

const storageBucket = process.env.STORAGE_BUCKET
const bucket = getStorage().bucket(storageBucket)

const createPersistentDownloadUrl = (bucketName: string, pathToFile: string, downloadToken: string): string => {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
    pathToFile
  )}?alt=media&token=${downloadToken}`
}

const createThumbnailUrl = async (bucketName: string, pathToFile: string, prefix: string): Promise<string> => {
  const filenameExt = path.basename(pathToFile)
  const ext = filenameExt.slice((filenameExt.lastIndexOf('.') - 1 >>> 0) + 2)
  const filename = filenameExt.split('.').slice(0, -1).join('.')

  let thumbnailPathToFile = `cards/companies/thumbnails/${filename}_595x842.${ext}`
  if (prefix === 'cards/general/') {
    thumbnailPathToFile = `cards/thumbnails/${filename}_595x842.${ext}`
  }

  return `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(
    thumbnailPathToFile
  )}`
}

class PictureService extends BaseService {
  async insert (data: any): Promise<any> {
    const { bundle, picture } = data
    let response: any

    response = await db[this.model].findOne({
      include: generateInclude(this.model),
      where: {
        filename: picture.filename,
        url: picture.url,
        bundleId: bundle.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...picture })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...picture, id: uuidv1(), bundleId: bundle.id })

    return { response: response.toJSONFor(), status: 201 }
  }

  async purge (record: any): Promise<any> {
    // Hard delete records
    const response = await record.destroy({
      force: true
    })

    const posterFileName = String(record.filename)
    const firebaseStorageEnvironment = process.env.FIREBASE_STORAGE_ENVIRONMENT as string
    const file = bucket.file(`${firebaseStorageEnvironment}/bundles/images/${posterFileName}`)

    try {
      await file.delete()
    } catch (error) {}

    return response
  }

  async getCardsFromFirebase (limit: number, pageToken?: string, companyId?: string): Promise<any> {
    const prefix = companyId != null ? `cards/companies/${companyId}/` : 'cards/general/'
    const queryOptions = {
      prefix, // Filter files with the specified folderName as the prefix
      maxResults: limit, // Limit the number of results to the page size
      pageToken // Use the provided page token to start from a specific point
    }
    const [files, nextPage]: any = await bucket.getFiles(queryOptions)

    const downloadUrls: Array<{ id: string, url: string, name: string, signedUrl: string, thumbnailUrl: string }> = []

    const options: any = {
      version: 'v4', // Use version 4 of signed URLs
      action: 'read', // Allow read access to the files
      expires: Date.now() + 60 * 60 * 1000 // URL expires in 60 minutes (adjust as needed)
    }

    for (const file of files) {
      if (file.name.match(/\.(jpg|jpeg|png|gif|bmp)$/i) != null) {
        const [signedUrl] = await file.getSignedUrl(options)
        const [metadata] = await file.getMetadata()
        const downloadUrl = createPersistentDownloadUrl(metadata.bucket, metadata.name, metadata.metadata.firebaseStorageDownloadTokens)

        const thumbnailUrl = await createThumbnailUrl(metadata.bucket, metadata.name, prefix)
        const filename = path.basename(file.name)
        downloadUrls.push({ id: uuidv1(), url: downloadUrl, name: filename, signedUrl, thumbnailUrl })
      }
    }

    const nextPageToken = nextPage?.pageToken ?? undefined

    const [allFiles] = await bucket.getFiles({
      prefix
    })
    const count = Math.max(allFiles.length - 1, 0)

    return { rows: downloadUrls, count, nextPage: nextPageToken }
  }
}

export default PictureService
