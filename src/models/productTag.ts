import { Model } from 'sequelize'
import type { IProductCategoryTag, IProductTag } from '../types'

const ProductTagModel = (sequelize: any, DataTypes: any): any => {
  interface ProductTagAttributes {
    id: string
  }

  class ProductTag extends Model<ProductTagAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly productCategoryTag: IProductCategoryTag

    static associate (models: any): any {
      ProductTag.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product',
        onDelete: 'CASCADE'
      })
      ProductTag.belongsTo(models.ProductCategoryTag, {
        foreignKey: 'productCategoryTagId',
        as: 'productCategoryTag',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IProductTag {
      return {
        id: this.id,
        productCategoryTag: this.productCategoryTag,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  ProductTag.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductTag'
  })

  return ProductTag
}

module.exports = ProductTagModel
