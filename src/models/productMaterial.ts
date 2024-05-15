import { Model } from 'sequelize'
import type { IProductMaterial } from '../types'

const ProductMaterialModel = (sequelize: any, DataTypes: any): any => {
  interface ProductMaterialAttributes {
    id: string
    name: string
  }

  class ProductMaterial extends Model<ProductMaterialAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IProductMaterial {
      return {
        id: this.id,
        name: this.name,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  ProductMaterial.init({
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
    modelName: 'ProductMaterial'
  })

  return ProductMaterial
}

module.exports = ProductMaterialModel
