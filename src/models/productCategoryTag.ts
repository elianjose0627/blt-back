import { Model } from 'sequelize'
import type { IProductCategoryTag } from '../types'

const ProductCategoryTagModel = (sequelize: any, DataTypes: any): any => {
  interface ProductCategoryTagAttributes {
    id: string
    name: string
    type: string
  }

  class ProductCategoryTag extends Model<ProductCategoryTagAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly type: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      ProductCategoryTag.belongsTo(models.ProductCategory, {
        foreignKey: 'productCategoryId',
        as: 'productCategory',
        onDelete: 'CASCADE'
      })
      ProductCategoryTag.hasMany(models.ProductTag, {
        foreignKey: 'productCategoryTagId',
        as: 'relatedProducts',
        onDelete: 'CASCADE'
      })
      ProductCategoryTag.belongsToMany(models.ProductAccessControlGroup, {
        foreignKey: 'productCategoryTagId',
        through: models.ProductCategoryTagProductAccessControlGroup,
        as: 'productAccessControlGroups'
      })
    }

    toJSONFor (): IProductCategoryTag {
      return {
        id: this.id,
        name: this.name,
        type: this.type,
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
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'category'
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductCategoryTag'
  })

  return ProductCategoryTag
}

module.exports = ProductCategoryTagModel
