import { Model } from 'sequelize'
import type { IProductColor } from '../types'

const ProductColorModel = (sequelize: any, DataTypes: any): any => {
  interface ProductColorAttributes {
    id: string
    name: string
    hexCode: string
    rgb: string
  }

  class ProductColor extends Model<ProductColorAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly hexCode: string
    private readonly rgb: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IProductColor {
      return {
        id: this.id,
        name: this.name,
        hexCode: this.hexCode,
        rgb: this.rgb,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  ProductColor.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hexCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      }
    },
    rgb: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^rgb\(\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?\)$/
      }
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductColor'
  })

  return ProductColor
}

module.exports = ProductColorModel
