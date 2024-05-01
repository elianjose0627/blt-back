import { Model } from 'sequelize'
import type { IProductGraduatedPrice } from '../types'

const ProductGraduatedPriceModel = (sequelize: any, DataTypes: any): any => {
  interface ProductGraduatedPriceAttributes {
    id: string
    firstUnit: number
    lastUnit: number
    price: number
  }

  class ProductGraduatedPrice extends Model<ProductGraduatedPriceAttributes> {
    private readonly id: string
    private readonly firstUnit: number
    private readonly lastUnit: number
    private readonly price: number
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IProductGraduatedPrice {
      return {
        id: this.id,
        firstUnit: this.firstUnit,
        lastUnit: this.lastUnit,
        price: this.price,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  ProductGraduatedPrice.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    firstUnit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lastUnit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductGraduatedPrice'
  })

  return ProductGraduatedPrice
}

module.exports = ProductGraduatedPriceModel
