import { Model } from 'sequelize'
import { IRecipient } from '../types'

const RecipientModel = (sequelize: any, DataTypes: any): any => {
  interface RecipientAttributes {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    country: string
    city: string
    street: string
    zip: string
  }

  class Recipient extends Model<RecipientAttributes> {
    private readonly id: string
    private readonly firstName: string
    private readonly lastName: string
    private readonly email: string
    private readonly phone: string
    private readonly country: string
    private readonly city: string
    private readonly street: string
    private readonly zip: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      Recipient.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'recipient',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IRecipient {
      return {
        id: this.id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        country: this.country,
        city: this.city,
        street: this.street,
        zip: this.zip,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  Recipient.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    street: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Recipient'
  })

  return Recipient
}

module.exports = RecipientModel
