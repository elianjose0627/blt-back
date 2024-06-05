import { Model } from 'sequelize'
import type { IUser, IUserInProductAccessControlGroup } from '../types'

const UserProductAccessControlGroupModel = (sequelize: any, DataTypes: any): any => {
  interface UserProductAccessControlGroupAttributes {
    id: string
  }

  class UserProductAccessControlGroup extends Model<UserProductAccessControlGroupAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly user: Pick<IUser, 'id' | 'firstName' | 'lastName' | 'email'>

    static associate (models: any): any {
      UserProductAccessControlGroup.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IUserInProductAccessControlGroup {
      return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        user: this.user
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
