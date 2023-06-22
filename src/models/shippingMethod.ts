import { Model } from 'sequelize'
import { IShippingMethod } from '../types'

const ShippingMethodModel = (sequelize: any, DataTypes: any): any => {
  interface ShippingMethodAttributes {
    id: string
    name: string
    shippingType: number
    isDropShipping: boolean
    insuranceValue: number
  }

  class ShippingMethod extends Model<ShippingMethodAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly shippingType: number
    private readonly isDropShipping: boolean
    private readonly insuranceValue: number
    private readonly createdAt: Date
    private readonly updatedAt: Date
    static associate (models: any): any {

    }

    toJSONFor (): IShippingMethod {
      return {
        id: this.id,
        name: this.name,
        shippingType: this.shippingType,
        isDropShipping: this.isDropShipping,
        insuranceValue: this.insuranceValue,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  ShippingMethod.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING
    },
    shippingType: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isDropShipping: {
      type: DataTypes.INTEGER,
      defaultValue: false
    },
    insuranceValue: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ShippingMethod'
  })

  return ShippingMethod
}

module.exports = ShippingMethodModel
