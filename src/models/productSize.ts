import { Model } from 'sequelize'
import type { IProductSize } from '../types'

const ProductSizeModel = (sequelize: any, DataTypes: any): any => {
  interface ProductMaterialAttributes {
    id: string
    name: string
  }

  class ProductSize extends Model<ProductMaterialAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IProductSize {
      return {
        id: this.id,
        name: this.name,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  ProductSize.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductSize'
  })

  return ProductSize
}

module.exports = ProductSizeModel
