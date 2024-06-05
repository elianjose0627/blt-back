import { Model } from 'sequelize'
import type { IProductCategoryTag, IProductCategoryTagInProductAccessControlGroup } from '../types'

const ProductCategoryTagProductAccessControlGroupModel = (sequelize: any, DataTypes: any): any => {
  interface ProductCategoryTagProductAccessControlGroupAttributes {
    id: string
  }

  class ProductCategoryTagProductAccessControlGroup extends Model<ProductCategoryTagProductAccessControlGroupAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly productCategoryTag: Pick<IProductCategoryTag, 'id' | 'name' | 'type'> & { productCategory: { id: string, name: string }}

    static associate (models: any): any {
      ProductCategoryTagProductAccessControlGroup.belongsTo(models.ProductCategoryTag, {
        foreignKey: 'productCategoryTagId',
        as: 'productCategoryTag',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IProductCategoryTagInProductAccessControlGroup {
      return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        productCategoryTag: this.productCategoryTag
      }
    }
  };

  ProductCategoryTagProductAccessControlGroup.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductCategoryTagProductAccessControlGroup'
  })

  return ProductCategoryTagProductAccessControlGroup
}

module.exports = ProductCategoryTagProductAccessControlGroupModel
