import { Model } from 'sequelize'
import type { IProductCategoryTagProductAccessControlGroup } from '../types'

const ProductCategoryTagProductAccessControlGroupModel = (sequelize: any, DataTypes: any): any => {
  interface ProductCategoryTagProductAccessControlGroupAttributes {
    id: string
  }

  class ProductCategoryTagProductAccessControlGroup extends Model<ProductCategoryTagProductAccessControlGroupAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IProductCategoryTagProductAccessControlGroup {
      return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
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
