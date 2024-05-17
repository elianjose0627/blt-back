import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'
import { IUserProductAccessControlGroup, IUser } from '../types'

class UserProductAccessControlGroupService extends BaseService {
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
    const foundProductCategoryTagProductAccessControlGroups = await db[this.model].findAndCountAll({
      where: {
        productAccessControlGroupId,
        userId: foundUserIds
      },
      paranoid: false // To get soft deleted record
    })

    const newUserIds = foundUserIds
      .filter((userId: string) => foundProductCategoryTagProductAccessControlGroups.rows
        .map((row: IUserProductAccessControlGroup) => row.userId)
        .includes(userId) === false)
    const existingUserIds = foundUserIds
      .filter((userId: string) => foundProductCategoryTagProductAccessControlGroups.rows
        .map((row: IUserProductAccessControlGroup) => row.userId)
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
}

export default UserProductAccessControlGroupService
