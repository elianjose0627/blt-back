import { Model } from 'sequelize'
import { IBundleItem } from '../types'

const BundleItemModel = (sequelize: any, DataTypes: any): any => {
  interface BundleItemAttributes {
    id: string
    jfsku: string
    merchantSku: string
    name: string
    description: string
  }

  class BundleItem extends Model<BundleItemAttributes> {
    private readonly id: string
    private readonly jfsku: string
    private readonly merchantSku: string
    private readonly name: string
    private readonly description: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      BundleItem.belongsTo(models.Bundle, {
        foreignKey: 'bundleId',
        as: 'bundle',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IBundleItem {
      return {
        id: this.id,
        jfsku: this.jfsku,
        merchantSku: this.merchantSku,
        name: this.name,
        description: this.description,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  BundleItem.init({
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
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'BundleItem'
  })

  return BundleItem
}

module.exports = BundleItemModel
