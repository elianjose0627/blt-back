import { Model } from 'sequelize'
import { IItem } from '../types'

const ItemModel = (sequelize: any, DataTypes: any): any => {
  interface ItemAttributes {
    id: string
    jfsku: string
    merchantSku: string
    name: string
  }

  class Item extends Model<ItemAttributes> {
    private readonly id: string
    private readonly jfsku: string
    private readonly merchantSku: string
    private readonly name: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      Item.belongsTo(models.Bundle, {
        foreignKey: 'bundleId',
        as: 'bundle',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IItem {
      return {
        id: this.id,
        jfsku: this.jfsku,
        merchantSku: this.merchantSku,
        name: this.name,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  Item.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    jfsku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    merchantSku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Item'
  })

  return Item
}

module.exports = ItemModel
