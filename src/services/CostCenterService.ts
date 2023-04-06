import { v1 as uuidv1 } from 'uuid'
import sequelize, { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'

class CostCenterService extends BaseService {
  async insert (data: any): Promise<any> {
    const { company, costCenter } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        center: costCenter.center,
        companyId: company.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...costCenter })
      return { response: updatedResponse.toJSONFor(company), status: 200 }
    }

    response = await db[this.model].create({ ...costCenter, id: uuidv1(), companyId: company.id })

    return { response: response.toJSONFor(company), status: 201 }
  }

  async getAllForCompany (limit: number, offset: number, companyId: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        companyId
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async searchCostCenters (limit: any, offset: any, companyId: string, searchString: string): Promise<any> {
    const centers = await db[this.model].findAndCountAll({
      attributes: { exclude: ['companyId', 'deletedAt'] },
      where: {
        [Op.and]: [
          { companyId },
          sequelize.where(
            sequelize.cast(sequelize.col('CostCenter.center'), 'varchar'),
            { [Op.iLike]: `%${searchString}%` }
          )
        ]
      },
      limit,
      offset,
      order: [
        ['createdAt', 'DESC']
      ]
    })

    return centers
  }
}

export default CostCenterService
