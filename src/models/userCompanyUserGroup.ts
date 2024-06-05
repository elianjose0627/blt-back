import { Model } from 'sequelize'
import type { IUser, IUserCompanyUserGroup } from '../types'

const UserCompanyUserGroupModel = (sequelize: any, DataTypes: any): any => {
  interface UserCompanyUserGroupAttributes {
    id: string
  }

  class UserCompanyUserGroup extends Model<UserCompanyUserGroupAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly user: Pick<IUser, 'id' | 'firstName' | 'lastName' | 'email'>

    static associate (models: any): any {
      UserCompanyUserGroup.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IUserCompanyUserGroup {
      return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        user: this.user
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
