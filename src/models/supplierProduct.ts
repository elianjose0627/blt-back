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
      allowNull: true
    },
    masterId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    typeOfProducts: {
      type: DataTypes.STRING,
      allowNull: true
    },
    commodityCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    numberOfPrintPositions: {
      type: DataTypes.STRING,
      allowNull: true
    },
    countryOfOrigin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoryCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    productClass: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dimensions: {
      type: DataTypes.STRING,
      allowNull: true
    },
    length: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    lengthUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    width: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    widthUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    heightUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    volume: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    volumeUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    grossWeight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    grossWeightUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    netWeight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    netWeightUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    innerCartonQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    outerCartonQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cartonLength: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    cartonLengthUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cartonWidth: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    cartonWidthUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cartonHeight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    cartonHeightUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cartonVolume: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    cartonVolumeUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cartonGrossWeight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    cartonGrossWeightUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    material: {
      type: DataTypes.STRING,
      allowNull: true
    },
    printable: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SupplierProduct'
  })

  return SupplierProduct
}

module.exports = SupplierProductModel
