import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'

class CompanyUserGroupService extends BaseService {
  manyRecords (): string {
    return 'companyUserGroups'
  }

  recordName (): string {
    return 'Company User Group'
  }

  async getAll (limit: number, offset: number, search?: string): Promise<any> {
    let where

    if (search !== undefined) {
      where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } }
        ]
      }
    }

    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      distinct: true,
      where,
      include: [
        {
          model: db.User,
          as: 'users',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: {
            as: 'userCompanyUserGroup',
            attributes: ['id']
          }
        },
        {
          model: db.Company,
          as: 'company',
          attributes: ['id', 'name', 'email', 'domain']
        },
        {
          model: db.ProductAccessControlGroup,
          as: 'accessControlGroups',
          attributes: ['id', 'name'],
          through: {
            attributes: []
          }
        }
      ]
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async insert (data: any): Promise<any> {
    const { companyUserGroup } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        name: companyUserGroup.name,
        companyId: companyUserGroup.companyId
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...companyUserGroup })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...companyUserGroup, id: uuidv1() })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default CompanyUserGroupService
