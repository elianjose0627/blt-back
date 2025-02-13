import { Model } from 'sequelize'
import type { ISupplierProductDigitalAsset } from '../types'

const SupplierProductDigitalAssetModel = (sequelize: any, DataTypes: any): any => {
  interface SupplierProductDigitalAssetAttributes {
    id: string
    supplierProductId: string
    supplierProductVariantId: string
    url: string
    urlHighress: string
    type: string
    subtype: string
    for: string
  }

  class SupplierProductDigitalAsset extends Model<SupplierProductDigitalAssetAttributes> {
    private readonly id: string
    private readonly supplierProductId: string
    private readonly supplierProductVariantId: string
    private readonly url: string
    private readonly urlHighress: string
    private readonly type: string
    private readonly subtype: string
    private readonly for: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      SupplierProductDigitalAsset.belongsTo(models.SupplierProduct, {
        foreignKey: 'supplierProductId',
        as: 'supplierProduct',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ISupplierProductDigitalAsset {
      return {
        id: this.id,
        supplierProductId: this.supplierProductId,
        supplierProductVariantId: this.supplierProductVariantId,
        url: this.url,
        urlHighress: this.urlHighress,
        type: this.type,
        subtype: this.subtype,
        for: this.for,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  SupplierProductDigitalAsset.init({
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
    supplierProductVariantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'SupplierProductVariants', key: 'id' }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    urlHighress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subtype: {
      type: DataTypes.STRING,
      allowNull: true
    },
    for: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SupplierProductDigitalAsset'
  })

  return SupplierProductDigitalAsset
}

module.exports = SupplierProductDigitalAssetModel
