import { Model } from 'sequelize'
import type { IUserProductAccessControlGroup } from '../types'

const UserProductAccessControlGroupModel = (sequelize: any, DataTypes: any): any => {
  interface UserProductAccessControlGroupAttributes {
    id: string
  }

  class UserProductAccessControlGroup extends Model<UserProductAccessControlGroupAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IUserProductAccessControlGroup {
      return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  UserProductAccessControlGroup.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'UserProductAccessControlGroup'
  })

  return UserProductAccessControlGroup
}

module.exports = UserProductAccessControlGroupModel
