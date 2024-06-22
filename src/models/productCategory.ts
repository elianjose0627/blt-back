import { Model } from 'sequelize'
import type { IProductCategory, IProductCategoryTag, MediaData, Nullable } from '../types'

const ProductCategoryModel = (sequelize: any, DataTypes: any): any => {
  interface ProductCategoryAttributes {
    id: string
    name: string
    description: Nullable<string>
    picture: Nullable<MediaData>
  }

  class ProductCategory extends Model<ProductCategoryAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly description: Nullable<string>
    private readonly picture: Nullable<MediaData>
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly productCategoryTags: IProductCategoryTag[]

    static associate (models: any): any {
      ProductCategory.hasMany(models.ProductCategoryTag, {
        foreignKey: 'productCategoryId',
        as: 'productCategoryTags',
        onDelete: 'CASCADE'
      })
      ProductCategory.belongsToMany(models.Product, {
        foreignKey: 'productCategoryId',
        through: models.ProductProductCategory,
        as: 'products'
      })
    }

    toJSONFor (): IProductCategory {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        picture: this.picture,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        productCategoryTags: this.productCategoryTags
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
