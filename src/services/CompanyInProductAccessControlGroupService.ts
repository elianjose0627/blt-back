import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'
import { ICompany, ICompanyProductAccessControlGroup } from '../types'

class CompanyInProductAccessControlGroupService extends BaseService {
  async insert (data: any): Promise<any> {
    const { companyIds, productAccessControlGroupId } = data
    let updated = []
    let added = []

    const foundCompanies = await db.Company.findAndCountAll({
      where: {
        id: companyIds
      }
    })

    const foundCompanyIds = foundCompanies.rows.map((company: ICompany) => company.id)
    const foundCompanyProductAccessControlGroups = await db[this.model].findAndCountAll({
      where: {
        productAccessControlGroupId,
        companyId: foundCompanyIds
      },
      paranoid: false // To get soft deleted record
    })

    const newCompanyIds = foundCompanyIds
      .filter((companyId: string) => foundCompanyProductAccessControlGroups.rows
        .map((row: ICompanyProductAccessControlGroup) => row.companyId)
        .includes(companyId) === false)
    const existingCompanyIds = foundCompanyIds
      .filter((companyId: string) => foundCompanyProductAccessControlGroups.rows
        .map((row: ICompanyProductAccessControlGroup) => row.companyId)
        .includes(companyId))

    if (existingCompanyIds.length > 0) {
      const updatedResponse = await db[this.model].restore({
        where: {
          companyId: {
            [Op.in]: foundCompanyIds
          },
          productAccessControlGroupId
        },
        returning: true
      })
      updated = updatedResponse.map((response: any) => response.toJSONFor())
    }

    if (newCompanyIds.length > 0) {
      const bulkInsertData = newCompanyIds.map((companyId: string) => ({
        companyId,
        id: uuidv1(),
        productAccessControlGroupId
      }))

      const addedResponse = await db[this.model].bulkCreate(bulkInsertData, { returning: true })
      added = addedResponse.map((response: any) => response.toJSONFor())
    }

    return { response: { updated, added }, status: 200 }
  }
}

export default CompanyInProductAccessControlGroupService
