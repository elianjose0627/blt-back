import { Model } from 'sequelize'
import type { Nullable } from '../types'

const BundleStockModel = (sequelize: any, DataTypes: any): any => {
  interface BundleStockAttributes {
    id: string
    jfsku: string
    merchantSku: Nullable<string>
    stockLevel: number
    stockLevelAnnounced: number
    stockLevelReserved: number
    stockLevelBlocked: number
    fulfillerTimestamp: Date
  }

  class BundleStock extends Model<BundleStockAttributes> {
    static associate (models: any): any {

    }
  };

  BundleStock.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    jfsku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    merchantSku: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    stockLevel: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.00
    },
    stockLevelAnnounced: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.00
    },
    stockLevelReserved: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.00
    },
    stockLevelBlocked: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.00
    },
    fulfillerTimestamp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'BundleStock'
  })

  return BundleStock
}

module.exports = BundleStockModel
