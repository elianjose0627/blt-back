import { Model } from 'sequelize'
import type { ISupplierProduct } from '../types'

const SupplierProductModel = (sequelize: any, DataTypes: any): any => {
  interface SupplierProductAttributes {
    id: string
    masterCode: string
    masterId: string
    typeOfProducts: string
    commodityCode: string
    numberOfPrintPositions: string
    countryOfOrigin: string
    brand: string
    productName: string
    categoryCode: string
    productClass: string
    dimensions: string
    length: number
    lengthUnit: string
    width: number
    widthUnit: string
    height: number
    heightUnit: string
    volume: number
    volumeUnit: string
    grossWeight: number
    grossWeightUnit: string
    netWeight: number
    netWeightUnit: string
    innerCartonQuantity: number
    outerCartonQuantity: number
    cartonLength: number
    cartonLengthUnit: string
    cartonWidth: number
    cartonWidthUnit: string
    cartonHeight: number
    cartonHeightUnit: string
    cartonVolume: number
    cartonVolumeUnit: string
    cartonGrossWeight: number
    cartonGrossWeightUnit: string
    timestamp: Date
    shortDescription: string
    longDescription: string
    material: string
    printable: string
  }

  class SupplierProduct extends Model<SupplierProductAttributes> {
    private readonly id: string
    private readonly masterCode: string
    private readonly masterId: string
    private readonly typeOfProducts: string
    private readonly commodityCode: string
    private readonly numberOfPrintPositions: string
    private readonly countryOfOrigin: string
    private readonly brand: string
    private readonly productName: string
    private readonly categoryCode: string
    private readonly productClass: string
    private readonly dimensions: string
    private readonly length: number
    private readonly lengthUnit: string
    private readonly width: number
    private readonly widthUnit: string
    private readonly height: number
    private readonly heightUnit: string
    private readonly volume: number
    private readonly volumeUnit: string
    private readonly grossWeight: number
    private readonly grossWeightUnit: string
    private readonly netWeight: number
    private readonly netWeightUnit: string
    private readonly innerCartonQuantity: number
    private readonly outerCartonQuantity: number
    private readonly cartonLength: number
    private readonly cartonLengthUnit: string
    private readonly cartonWidth: number
    private readonly cartonWidthUnit: string
    private readonly cartonHeight: number
    private readonly cartonHeightUnit: string
    private readonly cartonVolume: number
    private readonly cartonVolumeUnit: string
    private readonly cartonGrossWeight: number
    private readonly cartonGrossWeightUnit: string
    private readonly timestamp: Date
    private readonly shortDescription: string
    private readonly longDescription: string
    private readonly material: string
    private readonly printable: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      SupplierProduct.hasMany(models.SupplierProductDigitalAsset, {
        foreignKey: 'supplierProductId',
        as: 'digitalAssets',
        onDelete: 'CASCADE'
      })

      SupplierProduct.hasMany(models.SupplierProductVariant, {
        foreignKey: 'supplierProductId',
        as: 'variants',
        onDelete: 'CASCADE'
      })

      // SupplierProduct.hasOne(models.SupplierProductStock, {
      //   foreignKey: 'supplierProductId',
      //   as: 'stock',
      //   onDelete: 'CASCADE'
      // })
    }

    toJSONFor (): ISupplierProduct {
      return {
        id: this.id,
        masterCode: this.masterCode,
        masterId: this.masterId,
        typeOfProducts: this.typeOfProducts,
        commodityCode: this.commodityCode,
        numberOfPrintPositions: this.numberOfPrintPositions,
        countryOfOrigin: this.countryOfOrigin,
        brand: this.brand,
        productName: this.productName,
        categoryCode: this.categoryCode,
        productClass: this.productClass,
        dimensions: this.dimensions,
        length: this.length,
        lengthUnit: this.lengthUnit,
        width: this.width,
        widthUnit: this.widthUnit,
        height: this.height,
        heightUnit: this.heightUnit,
        volume: this.volume,
        volumeUnit: this.volumeUnit,
        grossWeight: this.grossWeight,
        grossWeightUnit: this.grossWeightUnit,
        netWeight: this.netWeight,
        netWeightUnit: this.netWeightUnit,
        innerCartonQuantity: this.innerCartonQuantity,
        outerCartonQuantity: this.outerCartonQuantity,
        cartonLength: this.cartonLength,
        cartonLengthUnit: this.cartonLengthUnit,
        cartonWidth: this.cartonWidth,
        cartonWidthUnit: this.cartonWidthUnit,
        cartonHeight: this.cartonHeight,
        cartonHeightUnit: this.cartonHeightUnit,
        cartonVolume: this.cartonVolume,
        cartonVolumeUnit: this.cartonVolumeUnit,
        cartonGrossWeight: this.cartonGrossWeight,
        cartonGrossWeightUnit: this.cartonGrossWeightUnit,
        timestamp: this.timestamp,
        shortDescription: this.shortDescription,
        longDescription: this.longDescription,
        material: this.material,
        printable: this.printable,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  SupplierProduct.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    masterCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    masterId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    typeOfProducts: {
      type: DataTypes.STRING,
      allowNull: false
    },
    commodityCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numberOfPrintPositions: {
      type: DataTypes.STRING,
      allowNull: false
    },
    countryOfOrigin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    categoryCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productClass: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dimensions: {
      type: DataTypes.STRING,
      allowNull: false
    },
    length: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    lengthUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    width: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    widthUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    heightUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    volume: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    volumeUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    grossWeight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    grossWeightUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    netWeight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    netWeightUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    innerCartonQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    outerCartonQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cartonLength: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cartonLengthUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cartonWidth: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cartonWidthUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cartonHeight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cartonHeightUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cartonVolume: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cartonVolumeUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cartonGrossWeight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cartonGrossWeightUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    material: {
      type: DataTypes.STRING,
      allowNull: false
    },
    printable: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SupplierProduct'
  })

  return SupplierProduct
}

module.exports = SupplierProductModel
