import { Model } from 'sequelize'
import type { IProductCategoryTag } from '../types'

const ProductCategoryTagModel = (sequelize: any, DataTypes: any): any => {
  interface ProductAttributes {
    id: string
    name: string
  }

  class ProductCategoryTag extends Model<ProductAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      ProductCategoryTag.belongsTo(models.ProductCategory, {
        foreignKey: 'productCategoryId',
        as: 'productCategory',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IProductCategoryTag {
      return {
        id: this.id,
        name: this.name,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  ProductCategoryTag.init({
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
    modelName: 'ProductCategoryTag'
  })

  return ProductCategoryTag
}

module.exports = ProductCategoryTagModel
