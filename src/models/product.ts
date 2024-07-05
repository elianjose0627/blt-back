import { Model } from 'sequelize'
import type {
  ICompany, IProduct, IProductCategory,
  IProductTag, IProductColor, IProductGraduatedPrice,
  IProductMaterial, IProductPicture, IProductSize,
  NetRetailPrice, ProductType, Nullable,
  IMassUnit, ISalesUnit, ITaxRate,
  IProductDetail,
  IStock
} from '../types'

const ProductModel = (sequelize: any, DataTypes: any): any => {
  interface ProductAttributes {
    id: string
    jfsku: Nullable<string>
    name: string
    description: string
    merchantSku: string
    productGroup: string
    type: ProductType
    netRetailPrice: NetRetailPrice
    pictures: IProductPicture[]
    isVisible: boolean
    isParent: boolean
    recommendedNetSalePrice: number
    shippingWeight: number
    weight: number
    barcode: Nullable<string>
    upc: Nullable<string>
    taric: Nullable<string>
    originCountry: Nullable<string>
    bestBeforeDate: boolean
    serialNumberTracking: boolean
    width: number
    height: number
    length: number
    isMetadataSynced: boolean
    isExceedStockEnabled: boolean
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
    private readonly productCategories: IProductCategory[]
    private readonly productTags: IProductTag[]
    private readonly isParent: boolean
    private readonly children: IProduct[]
    private readonly graduatedPrices: IProductGraduatedPrice[]
    private readonly productColor: IProductColor
    private readonly productMaterial: IProductMaterial
    private readonly productSize: IProductSize
    private readonly recommendedNetSalePrice: number
    private readonly shippingWeight: number
    private readonly weight: number
    private readonly barcode: Nullable<string>
    private readonly upc: Nullable<string>
    private readonly taric: Nullable<string>
    private readonly originCountry: Nullable<string>
    private readonly bestBeforeDate: boolean
    private readonly serialNumberTracking: boolean
    private readonly width: number
    private readonly height: number
    private readonly productLength: number
    private readonly massUnit: IMassUnit
    private readonly salesUnit: ISalesUnit
    private readonly taxRate: ITaxRate
    private readonly metadata: IProductDetail
    private readonly isMetadataSynced: boolean
    private readonly isExceedStockEnabled: boolean
    private readonly stock: IStock

    static associate (models: any): any {
      Product.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      Product.belongsToMany(models.ProductCategory, {
        foreignKey: 'productId',
        through: models.ProductProductCategory,
        as: 'productCategories'
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
      Product.belongsTo(models.MassUnit, {
        foreignKey: 'massUnitId',
        as: 'massUnit',
        onDelete: 'SET NULL'
      })
      Product.belongsTo(models.SalesUnit, {
        foreignKey: 'salesUnitId',
        as: 'salesUnit',
        onDelete: 'SET NULL'
      })
      Product.belongsTo(models.TaxRate, {
        foreignKey: 'taxRateId',
        as: 'taxRate',
        onDelete: 'SET NULL'
      })
      Product.belongsTo(models.ProductDetail, {
        foreignKey: 'productDetailId',
        as: 'metadata',
        onDelete: 'SET NULL'
      })
      Product.hasOne(models.Stock, {
        foreignKey: 'productId',
        onDelete: 'CASCADE',
        as: 'stock'
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
        company: this.company,
        productCategories: this.productCategories,
        productTags: this.productTags,
        isParent: this.isParent,
        children: this.children,
        graduatedPrices: this.graduatedPrices,
        productColor: this.productColor,
        productMaterial: this.productMaterial,
        productSize: this.productSize,
        recommendedNetSalePrice: this.recommendedNetSalePrice,
        shippingWeight: this.shippingWeight,
        weight: this.weight,
        barcode: this.barcode,
        upc: this.upc,
        taric: this.taric,
        originCountry: this.originCountry,
        bestBeforeDate: this.bestBeforeDate,
        serialNumberTracking: this.serialNumberTracking,
        width: this.width,
        height: this.height,
        length: this.productLength,
        massUnit: this.massUnit,
        salesUnit: this.salesUnit,
        taxRate: this.taxRate,
        metadata: this.metadata,
        isMetadataSynced: this.isMetadataSynced,
        isExceedStockEnabled: this.isExceedStockEnabled,
        stock: this.stock,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
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
      allowNull: true
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
    },
    recommendedNetSalePrice: {
      allowNull: false,
      defaultValue: 0.00,
      type: DataTypes.DOUBLE
    },
    shippingWeight: {
      allowNull: false,
      defaultValue: 0.00,
      type: DataTypes.DOUBLE
    },
    weight: {
      allowNull: false,
      defaultValue: 0.00,
      type: DataTypes.DOUBLE
    },
    barcode: {
      allowNull: true,
      type: DataTypes.STRING
    },
    upc: {
      allowNull: true,
      type: DataTypes.STRING
    },
    taric: {
      allowNull: true,
      type: DataTypes.STRING
    },
    originCountry: {
      allowNull: true,
      type: DataTypes.STRING
    },
    bestBeforeDate: {
      defaultValue: false,
      type: DataTypes.BOOLEAN
    },
    serialNumberTracking: {
      defaultValue: false,
      type: DataTypes.BOOLEAN
    },
    width: {
      allowNull: false,
      defaultValue: 0.00,
      type: DataTypes.DOUBLE
    },
    height: {
      allowNull: false,
      defaultValue: 0.00,
      type: DataTypes.DOUBLE
    },
    length: {
      allowNull: false,
      defaultValue: 0.00,
      type: DataTypes.DOUBLE
    },
    isMetadataSynced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isExceedStockEnabled: {
      allowNull: false,
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
