import { Model } from 'sequelize'
import type { ICompany, IProduct, IProductCategory, IProductCategoryTag, IProductColor, IProductGraduatedPrice, IProductMaterial, IProductPicture, IProductSize, NetRetailPrice, ProductType } from '../types'

const ProductModel = (sequelize: any, DataTypes: any): any => {
  interface ProductAttributes {
    id: string
    jfsku: string
    name: string
    description: string
    merchantSku: string
    productGroup: string
    type: ProductType
    netRetailPrice: NetRetailPrice
    pictures: IProductPicture[]
    isVisible: boolean
    isParent: boolean
  }

  class Product extends Model<ProductAttributes> {
    private readonly id: string
    private readonly jfsku: string
    private readonly name: string
    private readonly description: string
    private readonly merchantSku: string
    private readonly productGroup: string
    private readonly type: ProductType
    private readonly netRetailPrice: NetRetailPrice
    private readonly pictures: IProductPicture[]
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany
    private readonly productCategory: IProductCategory
    private readonly productTags: IProductCategoryTag[]
    private readonly isParent: boolean
    private readonly children: IProduct[]
    private readonly graduatedPrices: IProductGraduatedPrice[]
    private readonly productColor: IProductColor
    private readonly productMaterial: IProductMaterial
    private readonly productSize: IProductSize

    static associate (models: any): any {
      Product.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      Product.belongsTo(models.ProductCategory, {
        foreignKey: 'productCategoryId',
        as: 'productCategory',
        onDelete: 'SET NULL'
      })
      Product.hasMany(models.ProductTag, {
        foreignKey: 'productId',
        as: 'productTags',
        onDelete: 'CASCADE'
      })
      Product.hasMany(models.Product, {
        foreignKey: 'parentId',
        as: 'children',
        onDelete: 'CASCADE'
      })
      Product.hasMany(models.ProductGraduatedPrice, {
        foreignKey: 'productId',
        as: 'graduatedPrices',
        onDelete: 'CASCADE'
      })
      Product.belongsTo(models.ProductColor, {
        foreignKey: 'productColorId',
        as: 'productColor',
        onDelete: 'SET NULL'
      })
      Product.belongsTo(models.ProductMaterial, {
        foreignKey: 'productMaterialId',
        as: 'productMaterial',
        onDelete: 'SET NULL'
      })
      Product.belongsTo(models.ProductSize, {
        foreignKey: 'productSizeId',
        as: 'productSize',
        onDelete: 'SET NULL'
      })
    }

    toJSONFor (): IProduct {
      return {
        id: this.id,
        jfsku: this.jfsku,
        name: this.name,
        description: this.description,
        merchantSku: this.merchantSku,
        productGroup: this.productGroup,
        type: this.type,
        netRetailPrice: this.netRetailPrice,
        pictures: this.pictures,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company,
        productCategory: this.productCategory,
        productTags: this.productTags,
        isParent: this.isParent,
        children: this.children,
        graduatedPrices: this.graduatedPrices,
        productColor: this.productColor,
        productMaterial: this.productMaterial,
        productSize: this.productSize
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
    },
    pictures: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isParent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Product'
  })

  return Product
}

module.exports = ProductModel
