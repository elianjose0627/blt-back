import { Model } from 'sequelize'

const ShippingMethodModel = (sequelize: any, DataTypes: any): any => {
  interface ShippingMethodAttributes {
    id: string
    name: string
    shippingType: number
    isDropShipping: boolean
    insuranceValue: number
  }

  class ShippingMethod extends Model<ShippingMethodAttributes> {
    static associate (models: any): any {

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
