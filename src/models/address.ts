import { Model } from 'sequelize'
import type { AddressType, IAddress, ICompany } from '../types'

const AddressModel = (sequelize: any, DataTypes: any): any => {
  interface AddressAttributes {
    id: string
    companyName: string
    salutation: string
    firstName: string
    lastName: string
    email: string
    costCenter: string
    country: string
    city: string
    street: string
    zip: string
    phone: string
    addressAddition: string
    vat: string
    type: AddressType
  }

  class Address extends Model<AddressAttributes> {
    private readonly id: string
    private readonly companyName: string
    private readonly salutation: string
    private readonly firstName: string
    private readonly lastName: string
    private readonly email: string
    private readonly costCenter: string
    private readonly country: string
    private readonly city: string
    private readonly street: string
    private readonly zip: string
    private readonly phone: string
    private readonly addressAddition: string
    private readonly vat: string
    private readonly type: AddressType
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany

    static associate (models: any): any {
      Address.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
        onDelete: 'CASCADE'
      })
      Address.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IAddress {
      return {
        id: this.id,
        companyName: this.companyName,
        salutation: this.salutation,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        costCenter: this.costCenter,
        country: this.country,
        city: this.city,
        street: this.street,
        zip: this.zip,
        phone: this.phone,
        addressAddition: this.addressAddition,
        vat: this.vat,
        type: this.type,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company
      }
    }
  };

  Address.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    salutation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
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
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    addressAddition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vat: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    costCenter: {
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
