import { Op } from 'sequelize'
import { v1 as uuidv1 } from 'uuid'
import BaseService, { generateFilterQuery, generateInclude } from './BaseService'
import db from '../models'
// import * as userRoles from '../utils/userRoles'

class ProductCustomisationService extends BaseService {
  async insert (data: any): Promise<any> {
    const { user, productCustomisation } = data
    let response: any

    const productId = productCustomisation.productId
    const userId = user.id

    response = await db[this.model].findOne({
      where: {
        productId,
        customisationType: productCustomisation.customisationType,
        customisationDetail: productCustomisation.customisationDetail
      },
      paranoid: false
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productCustomisation, userId })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productCustomisation, id: uuidv1(), userId })

    return { response: response.toJSONFor(), status: 201 }
  }

  async getAll (limit: number, offset: number, search?: string, filter = { productId: '' }, user?: any): Promise<any> {
    // let records
    let where = generateFilterQuery(filter)

    // const generateOrder = (sortBy: object): string[][] => {
    //   return Object.entries(sortBy)
    //     .filter(([_, value]) => value !== '')
    //     .map(([key, value]) => [key, value])
    // }

    // const order = generateOrder(sortBy)

    if (search !== undefined && search !== '') {
      where = {
        [Op.and]: [
          {
            [Op.or]: [
              { customisationType: { [Op.iLike]: `%${search}%` } },
              { customisationDetail: { [Op.iLike]: `%${search}%` } }
            ]
          },
          where
        ]
      }
    }

    // if (user.role === userRoles.ADMIN) {
    //   records = await db[this.model].findAndCountAll({
    //     include: generateInclude(this.model),
    //     limit,
    //     offset,
    //     order,
    //     attributes: { exclude: [] },
    //     where,
    //     distinct: true
    //   })
    // } else {
    const records = await db[this.model].findAndCountAll({
      include: generateInclude(this.model),
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        ...where,
        userId: user.id
      },
      distinct: true
    })
    // }
    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default ProductCustomisationService
