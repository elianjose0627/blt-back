import { Model } from 'sequelize'
import { ICompany } from '../types'

const ShippingAddressModel = (sequelize: any, DataTypes: any): any => {
  interface ShippingAddressAttributes {
    id: string
    customerId: number
    company: string
    email: string
  }

  class ShippingAddress extends Model<ShippingAddressAttributes> {
    private readonly id: string
    private readonly customerId: number
    private readonly company: string
    private readonly email: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): ICompany {
      return {
        id: this.id,
        customerId: this.customerId,
        company: this.company,
        email: this.email,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  ShippingAddress.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ShippingAddress'
  })

  return ShippingAddress
}

module.exports = ShippingAddressModel
