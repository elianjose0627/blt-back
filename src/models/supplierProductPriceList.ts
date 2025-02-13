import { Model } from 'sequelize'
import type { ISupplierProductPriceList, ISupplierProductPriceListScale } from '../types'

const SupplierProductPriceListModel = (sequelize: any, DataTypes: any): any => {
  interface SupplierProductPriceListAttributes {
    id: string
    sku: string
    variantId: string
    price: number
    currency: string
    validUntil: Date
    scale: ISupplierProductPriceListScale[]
  }

  class SupplierProductPriceList extends Model<SupplierProductPriceListAttributes> {
    private readonly id: string
    private readonly sku: string
    private readonly variantId: string
    private readonly price: number
    private readonly currency: string
    private readonly validUntil: Date
    private readonly scale: ISupplierProductPriceListScale[]
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      SupplierProductPriceList.belongsTo(models.SupplierProduct, {
        foreignKey: 'supplierProductId',
        as: 'supplierProduct',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ISupplierProductPriceList {
      return {
        id: this.id,
        sku: this.sku,
        variantId: this.variantId,
        price: this.price,
        currency: this.currency,
        validUntil: this.validUntil,
        scale: this.scale,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  SupplierProductPriceList.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    variantId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'EUR'
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scale: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SupplierProductPriceList'
  })

  return SupplierProductPriceList
}

module.exports = SupplierProductPriceListModel
