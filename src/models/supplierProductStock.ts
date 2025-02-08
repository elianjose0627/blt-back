import { Model } from 'sequelize'
import type { ISupplierProductStock } from '../types'

const SupplierProductStockModel = (sequelize: any, DataTypes: any): any => {
  interface SupplierProductStockAttributes {
    id: string
    sku: string
    firstArrivalDate: Date
    quantity: number
    firstArrivalQuantity: number
    nextArrivalDate: Date
    nextArrivalQuantity: number
  }

  class SupplierProductStock extends Model<SupplierProductStockAttributes> {
    private readonly id: string
    private readonly sku: string
    private readonly firstArrivalDate: Date
    private readonly quantity: number
    private readonly firstArrivalQuantity: number
    private readonly nextArrivalDate: Date
    private readonly nextArrivalQuantity: number
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any { }

    toJSONFor (): ISupplierProductStock {
      return {
        id: this.id,
        sku: this.sku,
        firstArrivalDate: this.firstArrivalDate,
        quantity: this.quantity,
        firstArrivalQuantity: this.firstArrivalQuantity,
        nextArrivalDate: this.nextArrivalDate,
        nextArrivalQuantity: this.nextArrivalQuantity,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  SupplierProductStock.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstArrivalDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    firstArrivalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nextArrivalDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextArrivalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SupplierProductStock'
  })

  return SupplierProductStock
}

module.exports = SupplierProductStockModel
