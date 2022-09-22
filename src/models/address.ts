import { Model } from 'sequelize'
import { IAddress } from '../types'

const AddressModel = (sequelize: any, DataTypes: any): any => {
  interface AddressAttributes {
    id: string
    country: string
    city: string
    street: string
    zip: string
  }

  class Address extends Model<AddressAttributes> {
    private readonly id: string
    private readonly country: string
    private readonly city: string
    private readonly street: string
    private readonly zip: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    // private readonly owner: IUser

    static associate (models: any): any {
      Address.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
        onDelete: 'CASCADE'
      })
      Address.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'companyAddress',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IAddress {
      return {
        id: this.id,
        country: this.country,
        city: this.city,
        street: this.street,
        zip: this.zip,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  Address.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
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
    modelName: 'Address'
  })

  return Address
}

module.exports = AddressModel
