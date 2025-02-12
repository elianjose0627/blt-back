import { Model } from 'sequelize'
import type { IProductStockNotification, TimeFrequencyUnit } from '../types'

const ProductStockNotificationModel = (sequelize: any, DataTypes: any): any => {
  interface ProductStockNotificationAttributes {
    id: string
    threshold: number
    recipients: string[]
    frequency: number
    frequencyUnit: TimeFrequencyUnit
    quantity: number
    lastSentAt: Date | null
    isEnabled: boolean
  }

  class ProductStockNotification extends Model<ProductStockNotificationAttributes> {
    private readonly id: string
    private readonly threshold: number
    private readonly recipients: string[]
    private readonly frequency: number
    private readonly frequencyUnit: TimeFrequencyUnit
    private readonly quantity: number
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly lastSentAt: Date | null
    private readonly isEnabled: boolean

    static associate (models: any): any {
      ProductStockNotification.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IProductStockNotification {
      return {
        id: this.id,
        threshold: this.threshold,
        recipients: this.recipients,
        frequency: this.frequency,
        frequencyUnit: this.frequencyUnit,
        quantity: this.quantity,
        lastSentAt: this.lastSentAt,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        isEnabled: this.isEnabled
      }
    }
  };

  ProductStockNotification.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    threshold: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recipients: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false
    },
    frequency: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    frequencyUnit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'month'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lastSentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductStockNotification',
    tableName: 'ProductStockNotifications'
  })

  return ProductStockNotification
}

module.exports = ProductStockNotificationModel
