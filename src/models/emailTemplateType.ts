import { Model } from 'sequelize'

const EmailTemplateTypeModel = (sequelize: any, DataTypes: any): any => {
  interface EmailTemplateTypeAttributes {
    id: string
    name: string
    description: string
  }

  class EmailTemplateType extends Model<EmailTemplateTypeAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly description: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      EmailTemplateType.hasMany(models.EmailTemplate, {
        foreignKey: 'emailTemplateTypeId',
        onDelete: 'CASCADE'
      })
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
