import { Model } from 'sequelize'
import type { ILegalText } from '../types'

const LegalTextModel = (sequelize: any, DataTypes: any): any => {
  interface LegalTextAttributes {
    id: string
    type: 'privacy' | 'terms'
    template: object
  }

  class LegalText extends Model<LegalTextAttributes> {
    private readonly id: string
    private readonly type: 'privacy' | 'terms'
    private readonly template: object
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      LegalText.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ILegalText {
      return {
        id: this.id,
        type: this.type,
        template: this.template,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  LegalText.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    template: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'LegalText'
  })

  return LegalText
}

module.exports = LegalTextModel
