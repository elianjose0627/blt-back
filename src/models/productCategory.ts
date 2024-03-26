import { Model } from 'sequelize'
import type { IProductCategory, MediaData, Nullable } from '../types'

const ProductCategoryModel = (sequelize: any, DataTypes: any): any => {
  interface ProductAttributes {
    id: string
    name: string
    description: Nullable<string>
    picture: Nullable<MediaData>
  }

  class ProductCategory extends Model<ProductAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly description: Nullable<string>
    private readonly picture: Nullable<MediaData>
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IProductCategory {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        picture: this.picture,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  ProductCategory.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    picture: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductCategory'
  })

  return ProductCategory
}

module.exports = ProductCategoryModel
