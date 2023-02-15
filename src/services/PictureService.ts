import { v1 as uuidv1 } from 'uuid'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'

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
}

export default PictureService
