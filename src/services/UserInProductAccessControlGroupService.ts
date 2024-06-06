import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'
import { IUserInProductAccessControlGroup, IUser } from '../types'

class UserInProductAccessControlGroupService extends BaseService {
  recordName (): string {
    return 'User in Product Access Control Group'
  }

  manyRecords (): string {
    return 'productAccessControlGroupUsers'
  }

  async insert (data: any): Promise<any> {
    const { userIds, productAccessControlGroupId } = data
    let updated = []
    let added = []

    const foundUsers = await db.User.findAndCountAll({
      where: {
        id: userIds
      }
    })

    const foundUserIds = foundUsers.rows.map((user: IUser) => user.id)
    const foundUserProductAccessControlGroups = await db[this.model].findAndCountAll({
      where: {
        productAccessControlGroupId,
        userId: foundUserIds
      },
      paranoid: false // To get soft deleted record
    })

    const newUserIds = foundUserIds
      .filter((userId: string) => foundUserProductAccessControlGroups.rows
        .map((row: IUserInProductAccessControlGroup) => row.userId)
        .includes(userId) === false)
    const existingUserIds = foundUserIds
      .filter((userId: string) => foundUserProductAccessControlGroups.rows
        .map((row: IUserInProductAccessControlGroup) => row.userId)
        .includes(userId))

    if (existingUserIds.length > 0) {
      const updatedResponse = await db[this.model].restore({
        where: {
          userId: {
            [Op.in]: foundUserIds
          },
          productAccessControlGroupId
        },
        returning: true
      })
      updated = updatedResponse.map((response: any) => response.toJSONFor())
    }

    if (newUserIds.length > 0) {
      const bulkInsertData = newUserIds.map((userId: string) => ({
        userId,
        id: uuidv1(),
        productAccessControlGroupId
      }))

      const addedResponse = await db[this.model].bulkCreate(bulkInsertData, { returning: true })
      added = addedResponse.map((response: any) => response.toJSONFor())
    }

    return { response: { updated, added }, status: 200 }
  }

  async getAllUsersInProductAccessControlGroup (limit: number, offset: number, productAccessControlGroupId: string, search?: string): Promise<any> {
    let where

    if (search !== undefined) {
      where = {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
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
          model: db.User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          where
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

export default UserInProductAccessControlGroupService
