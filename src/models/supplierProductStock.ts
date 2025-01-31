import { Model } from 'sequelize'
import type { ISupplierProductStock } from '../types'

const SupplierProductStockModel = (sequelize: any, DataTypes: any): any => {
  interface SupplierProductStockAttributes {
    id: string
    supplierProductId: string
    sku: string
    firstArrivalDate: Date
    quantity: number
    firstArrivalQuantity: number
  }

  class SupplierProductStock extends Model<SupplierProductStockAttributes> {
    private readonly id: string
    private readonly supplierProductId: string
    private readonly sku: string
    private readonly firstArrivalDate: Date
    private readonly quantity: number
    private readonly firstArrivalQuantity: number
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      SupplierProductStock.belongsTo(models.SupplierProduct, {
        foreignKey: 'supplierProductId',
        as: 'supplierProduct',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ISupplierProductStock {
      return {
        id: this.id,
        supplierProductId: this.supplierProductId,
        sku: this.sku,
        firstArrivalDate: this.firstArrivalDate,
        quantity: this.quantity,
        firstArrivalQuantity: this.firstArrivalQuantity,
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
    supplierProductId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'SupplierProducts', key: 'id' }
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
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SupplierProductStock'
  })

  return SupplierProductStock
}

module.exports = SupplierProductStockModel
