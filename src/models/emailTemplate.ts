import { Model } from 'sequelize'
import type { IEmailTemplate, IEmailTemplateType } from '../types'

const EmailTemplateModel = (sequelize: any, DataTypes: any): any => {
  interface EmailTemplateAttributes {
    id: string
    subject: string
    template: object
    isDefault: boolean
  }

  class EmailTemplate extends Model<EmailTemplateAttributes> {
    private readonly id: string
    private readonly subject: string
    private readonly template: string
    private readonly emailTemplateType: IEmailTemplateType
    private readonly isDefault: boolean
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      EmailTemplate.belongsTo(models.EmailTemplateType, {
        foreignKey: 'emailTemplateTypeId',
        as: 'emailTemplateType',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IEmailTemplate {
      return {
        id: this.id,
        subject: this.subject,
        template: this.template,
        emailTemplateType: this.emailTemplateType,
        isDefault: this.isDefault,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  EmailTemplate.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    template: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'EmailTemplate'
  })

  return EmailTemplate
}

module.exports = EmailTemplateModel
