import { Model } from 'sequelize'
import { Nullable } from '../types'

const StockModel = (sequelize: any, DataTypes: any): any => {
  interface StockAttributes {
    id: string
    jfsku: string
    stockLevel: number
    stockLevelAnnounced: number
    stockLevelReserved: number
    stockLevelBlocked: number
    fulfillerTimestamp: Nullable<Date>
  }

  class Stock extends Model<StockAttributes> {
    static associate (models: any): any {
      Stock.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product',
        onDelete: 'CASCADE'
      })
    }
  };

  Stock.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    jfsku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    stockLevel: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    stockLevelAnnounced: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    stockLevelReserved: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    stockLevelBlocked: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
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
