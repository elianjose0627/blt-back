import { Model } from 'sequelize'
import type { IEmailTemplateType } from '../types'

const EmailTemplateTypeModel = (sequelize: any, DataTypes: any): any => {
  interface EmailTemplateTypeAttributes {
    id: string
    name: string
    type: string
    description: string
  }

  class EmailTemplateType extends Model<EmailTemplateTypeAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly type: string
    private readonly description: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      EmailTemplateType.hasMany(models.EmailTemplate, {
        foreignKey: 'emailTemplateTypeId',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IEmailTemplateType {
      return {
        id: this.id,
        name: this.name,
        type: this.type,
        description: this.description,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  EmailTemplateType.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'EmailTemplateType'
  })

  return EmailTemplateType
}

module.exports = EmailTemplateTypeModel
