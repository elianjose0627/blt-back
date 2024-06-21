import { Model } from 'sequelize'
import type { IProduct, IProductProductCategory } from '../types'

const ProductProductCategoryModel = (sequelize: any, DataTypes: any): any => {
  interface ProductProductCategoryAttributes {
    id: string
  }

  class ProductProductCategory extends Model<ProductProductCategoryAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly product: Pick<IProduct, 'id' | 'name'>

    static associate (models: any): any {
      ProductProductCategory.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IProductProductCategory {
      return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        product: this.product
      }
    }
  };

  ProductProductCategory.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductProductCategory'
  })

  return ProductProductCategory
}

module.exports = ProductProductCategoryModel
