import { Model } from 'sequelize'
import type { ISupplierProductVariant } from '../types'

const SupplierProductVariantModel = (sequelize: any, DataTypes: any): any => {
  interface SupplierProductVariantAttributes {
    id: string
    supplierProductId: string
    variantId: string
    sku: string
    releaseDate: Date
    discontinuedDate: Date
    productPropositionCategory: string
    categoryLevel1: string
    categoryLevel2: string
    categoryLevel3: string
    colorDescription: string
    colorGroup: string
    plcStatus: string
    plcStatusDescription: string
    gtin: string
    colorCode: string
    pmsColor: string
  }

  class SupplierProductVariant extends Model<SupplierProductVariantAttributes> {
    private readonly id: string
    private readonly supplierProductId: string
    private readonly variantId: string
    private readonly sku: string
    private readonly releaseDate: Date
    private readonly discontinuedDate: Date
    private readonly productPropositionCategory: string
    private readonly categoryLevel1: string
    private readonly categoryLevel2: string
    private readonly categoryLevel3: string
    private readonly colorDescription: string
    private readonly colorGroup: string
    private readonly plcStatus: string
    private readonly plcStatusDescription: string
    private readonly gtin: string
    private readonly colorCode: string
    private readonly pmsColor: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      SupplierProductVariant.belongsTo(models.SupplierProduct, {
        foreignKey: 'supplierProductId',
        as: 'supplierProduct',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ISupplierProductVariant {
      return {
        id: this.id,
        supplierProductId: this.supplierProductId,
        variantId: this.variantId,
        sku: this.sku,
        releaseDate: this.releaseDate,
        discontinuedDate: this.discontinuedDate,
        productPropositionCategory: this.productPropositionCategory,
        categoryLevel1: this.categoryLevel1,
        categoryLevel2: this.categoryLevel2,
        categoryLevel3: this.categoryLevel3,
        colorDescription: this.colorDescription,
        colorGroup: this.colorGroup,
        plcStatus: this.plcStatus,
        plcStatusDescription: this.plcStatusDescription,
        gtin: this.gtin,
        colorCode: this.colorCode,
        pmsColor: this.pmsColor,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  SupplierProductVariant.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    supplierProductId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'SupplierProducts', key: 'id' }
    },
    variantId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    discontinuedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    productPropositionCategory: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoryLevel1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoryLevel2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoryLevel3: {
      type: DataTypes.STRING,
      allowNull: true
    },
    colorDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    colorGroup: {
      type: DataTypes.STRING,
      allowNull: true
    },
    plcStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    plcStatusDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gtin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    colorCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pmsColor: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SupplierProductVariant'
  })

  return SupplierProductVariant
}

module.exports = SupplierProductVariantModel
