import { v1 as uuidv1 } from 'uuid'
import { initializeApp, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
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
}

export default PictureService
