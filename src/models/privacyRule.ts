import { Model } from 'sequelize'
import type { IPrivacyRule, Module, Role } from '../types'

const PrivacyManagerModel = (sequelize: any, DataTypes: any): any => {
  interface PrivacyManagerAttributes {
    id: string
    module: Module
    role: Role
    isEnabled: boolean
  }

  class PrivacyRule extends Model<PrivacyManagerAttributes> {
    private readonly id: string
    private readonly module: Module
    private readonly role: Role
    private readonly isEnabled: boolean
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      PrivacyRule.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IPrivacyRule {
      return {
        id: this.id,
        module: this.module,
        role: this.role,
        isEnabled: this.isEnabled,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  PrivacyRule.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'PrivacyRule'
  })

  return PrivacyRule
}

module.exports = PrivacyManagerModel
