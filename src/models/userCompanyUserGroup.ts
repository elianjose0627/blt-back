import { Model } from 'sequelize'
import type { IUserCompanyUserGroup } from '../types'

const UserCompanyUserGroupModel = (sequelize: any, DataTypes: any): any => {
  interface UserCompanyUserGroupAttributes {
    id: string
  }

  class UserCompanyUserGroup extends Model<UserCompanyUserGroupAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IUserCompanyUserGroup {
      return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  UserCompanyUserGroup.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'UserCompanyUserGroup'
  })

  return UserCompanyUserGroup
}

module.exports = UserCompanyUserGroupModel
