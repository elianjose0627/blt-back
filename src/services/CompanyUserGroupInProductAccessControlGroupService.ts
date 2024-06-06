import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'
import { ICompanyUserGroup, ICompanyUserGroupInProductAccessControlGroup } from '../types'

class CompanyUserGroupInProductAccessControlGroupService extends BaseService {
  recordName (): string {
    return 'Company User Group in Product Access Control Group'
  }

  manyRecords (): string {
    return 'productAccessControlGroupCompanyUserGroups'
  }

  async insert (data: any): Promise<any> {
    const { companyUserGroupIds, productAccessControlGroupId } = data
    let updated = []
    let added = []

    const foundCompanyUserGroups = await db.CompanyUserGroup.findAndCountAll({
      where: {
        id: companyUserGroupIds
      }
    })

    const foundCompanyUserGroupIds = foundCompanyUserGroups.rows.map((companyUserGroup: ICompanyUserGroup) => companyUserGroup.id)
    const foundCompanyUserGroupInProductAccessControlGroups = await db[this.model].findAndCountAll({
      where: {
        productAccessControlGroupId,
        companyUserGroupId: foundCompanyUserGroupIds
      },
      paranoid: false // To get soft deleted record
    })

    const newCompanyUserGroupIds = foundCompanyUserGroupIds
      .filter((companyUserGroupId: string) => foundCompanyUserGroupInProductAccessControlGroups.rows
        .map((row: ICompanyUserGroupInProductAccessControlGroup) => row.companyUserGroupId)
        .includes(companyUserGroupId) === false)
    const existingCompanyUserGroupIds = foundCompanyUserGroupIds
      .filter((companyUserGroupId: string) => foundCompanyUserGroupInProductAccessControlGroups.rows
        .map((row: ICompanyUserGroupInProductAccessControlGroup) => row.companyUserGroupId)
        .includes(companyUserGroupId))

    if (existingCompanyUserGroupIds.length > 0) {
      const updatedResponse = await db[this.model].restore({
        where: {
          companyUserGroupId: {
            [Op.in]: foundCompanyUserGroupIds
          },
          productAccessControlGroupId
        },
        returning: true
      })
      updated = updatedResponse.map((response: any) => response.toJSONFor())
    }

    if (newCompanyUserGroupIds.length > 0) {
      const bulkInsertData = newCompanyUserGroupIds.map((companyUserGroupId: string) => ({
        companyUserGroupId,
        id: uuidv1(),
        productAccessControlGroupId
      }))

      const addedResponse = await db[this.model].bulkCreate(bulkInsertData, { returning: true })
      added = addedResponse.map((response: any) => response.toJSONFor())
    }

    return { response: { updated, added }, status: 200 }
  }

  async getAllCompanyUserGroupsInProductAccessControlGroup (limit: number, offset: number, productAccessControlGroupId: string, search?: string): Promise<any> {
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
      where: {
        productAccessControlGroupId
      },
      include: [
        {
          model: db.CompanyUserGroup,
          as: 'companyUserGroup',
          attributes: ['id', 'name'],
          where,
          include: [
            {
              model: db.Company,
              as: 'company',
              attributes: ['id', 'name', 'domain']
            }
          ]
        }
      ],
      distinct: true
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default CompanyUserGroupInProductAccessControlGroupService
