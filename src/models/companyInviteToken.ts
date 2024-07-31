import { Model } from 'sequelize'
import type { Role } from '../types'

const CompanyInviteTokenModel = (sequelize: any, DataTypes: any): any => {
  interface CompanyInviteTokenAttributes {
    id: string
    inviteToken: string
    role: Role
  }

  class CompanyInviteToken extends Model<CompanyInviteTokenAttributes> {
    static associate (models: any): any {
      CompanyInviteToken.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }
  };

  CompanyInviteToken.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    inviteToken: {
      type: DataTypes.UUID,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CompanyInviteToken'
  })

  return CompanyInviteToken
}

module.exports = CompanyInviteTokenModel
