import { Model } from 'sequelize'
import { ICompany, IProduct, NetRetailPrice, ProductType } from '../types'

const ProductModel = (sequelize: any, DataTypes: any): any => {
  interface ProductAttributes {
    id: string
    jfsku: string
    name: string
    merchantSku: string
    productGroup: string
    type: ProductType
    netRetailPrice: NetRetailPrice
  }

  class Product extends Model<ProductAttributes> {
    private readonly id: string
    private readonly jfsku: string
    private readonly name: string
    private readonly merchantSku: string
    private readonly productGroup: string
    private readonly type: ProductType
    private readonly netRetailPrice: NetRetailPrice
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany

    static associate (models: any): any {
      Product.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IProduct {
      return {
        id: this.id,
        jfsku: this.jfsku,
        name: this.name,
        merchantSku: this.merchantSku,
        productGroup: this.productGroup,
        type: this.type,
        netRetailPrice: this.netRetailPrice,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company
      }
    }
  };

  Product.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    jfsku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    merchantSku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    productGroup: {
      type: DataTypes.STRING,
      allowNull: true
    },
    netRetailPrice: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        amount: 0,
        currency: 'EUR',
        discount: 0
      }
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Product'
  })

  return Product
}

module.exports = ProductModel
