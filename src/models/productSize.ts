import { Model } from 'sequelize'
import type { IProductSize } from '../types'

const ProductSizeModel = (sequelize: any, DataTypes: any): any => {
  interface ProductSizeAttributes {
    id: string
    name: string
    type: string
    sortIndex: number
  }

  class ProductSize extends Model<ProductSizeAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly type: string
    private readonly sortIndex: number
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IProductSize {
      return {
        id: this.id,
        name: this.name,
        type: this.type,
        sortIndex: this.sortIndex,
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
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sortIndex: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductSize'
  })

  return ProductSize
}

module.exports = ProductSizeModel
