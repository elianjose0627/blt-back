import { Model } from 'sequelize'
import type { IStock, Nullable } from '../types'

const StockModel = (sequelize: any, DataTypes: any): any => {
  interface StockAttributes {
    id: string
    jfsku: string
    merchantSku: Nullable<string>
    stockLevel: number
    stockLevelAnnounced: number
    stockLevelReserved: number
    stockLevelBlocked: number
    fulfillerTimestamp: Date
  }

  class Stock extends Model<StockAttributes> {
    private readonly id: string
    private readonly jfsku: string
    private readonly merchantSku: Nullable<string>
    private readonly stockLevel: number
    private readonly stockLevelAnnounced: number
    private readonly stockLevelReserved: number
    private readonly stockLevelBlocked: number
    private readonly fulfillerTimestamp: Date
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IStock {
      return {
        id: this.id,
        jfsku: this.jfsku,
        merchantSku: this.merchantSku,
        stockLevel: this.stockLevel,
        stockLevelAnnounced: this.stockLevelAnnounced,
        stockLevelReserved: this.stockLevelReserved,
        stockLevelBlocked: this.stockLevelBlocked,
        fulfillerTimestamp: this.fulfillerTimestamp,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  Stock.init({
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
    modelName: 'Stock'
  })

  return Stock
}

module.exports = StockModel
