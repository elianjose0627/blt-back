import { Model } from 'sequelize'
import type { Attribute, ICompany, IOrder, IShipment, Item, ModificationInfo, Nullable, SenderAddress, ShippingAddress } from '../types'

const OrderModel = (sequelize: any, DataTypes: any): any => {
  interface OrderAttributes {
    id: string
    outboundId: string
    fulfillerId: string
    merchantOutboundNumber: string
    warehouseId: string
    status: string
    shippingAddress: ShippingAddress
    items: Item[]
    senderAddress: SenderAddress
    attributes: Attribute[]
    priority: number
    currency: string
    externalNote: string
    internalNote: string
    salesChannel: string
    desiredDeliveryDate: string
    shippingMethodId: string
    shippingType: string
    shippingFee: number
    orderValue: number
    createdByFullName: Nullable<string>
    shipped: Nullable<Date>
    deliveryDate: Nullable<Date>
    createdAtByUser: Nullable<Date>
    modificationInfo: Nullable<ModificationInfo>
    trackingId: Nullable<string>
  }

  class Order extends Model<OrderAttributes> {
    private readonly id: string
    private readonly outboundId: string
    private readonly fulfillerId: string
    private readonly merchantOutboundNumber: string
    private readonly warehouseId: string
    private readonly status: string
    private readonly shippingAddress: ShippingAddress
    private readonly items: Item[]
    private readonly senderAddress: SenderAddress
    private readonly attributes: Attribute[]
    private readonly priority: number
    private readonly currency: string
    private readonly externalNote: string
    private readonly internalNote: string
    private readonly salesChannel: string
    private readonly desiredDeliveryDate: string
    private readonly shippingMethodId: string
    private readonly shippingType: string
    private readonly shippingFee: number
    private readonly orderValue: number
    private readonly createdByFullName: Nullable<string>
    private readonly shipped: Nullable<Date>
    private readonly deliveryDate: Nullable<Date>
    private readonly createdAtByUser: Nullable<Date>
    private readonly modificationInfo: Nullable<ModificationInfo>
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany
    private readonly shipments: IShipment[]
    private readonly trackingId: Nullable<string>

    static associate (models: any): any {
      Order.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      Order.hasMany(models.Shipment, {
        foreignKey: 'orderId',
        as: 'shipments'
      })
    }

    toJSONFor (): IOrder {
      return {
        id: this.id,
        outboundId: this.outboundId,
        fulfillerId: this.fulfillerId,
        merchantOutboundNumber: this.merchantOutboundNumber,
        warehouseId: this.warehouseId,
        status: this.status,
        shippingAddress: this.shippingAddress,
        items: this.items,
        senderAddress: this.senderAddress,
        attributes: this.attributes,
        priority: this.priority,
        currency: this.currency,
        externalNote: this.externalNote,
        internalNote: this.internalNote,
        salesChannel: this.salesChannel,
        desiredDeliveryDate: this.desiredDeliveryDate,
        shippingMethodId: this.shippingMethodId,
        shippingType: this.shippingType,
        shippingFee: this.shippingFee,
        orderValue: this.orderValue,
        createdByFullName: this.createdByFullName,
        shipped: this.shipped,
        deliveryDate: this.deliveryDate,
        createdAtByUser: this.createdAtByUser,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        modificationInfo: this.modificationInfo,
        company: this.company,
        shipments: this.shipments,
        trackingId: this.trackingId
      }
    }
  };

  Order.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    outboundId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fulfillerId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    merchantOutboundNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    warehouseId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingAddress: {
      type: DataTypes.JSON,
      allowNull: false
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    senderAddress: {
      type: DataTypes.JSON,
      allowNull: false
    },
    attributes: {
      type: DataTypes.JSON,
      allowNull: true
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true
    },
    externalNote: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    internalNote: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    salesChannel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    desiredDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    shippingMethodId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shippingType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shippingFee: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    orderValue: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    createdByFullName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shipped: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAtByUser: {
      type: DataTypes.DATE,
      allowNull: true
    },
    modificationInfo: {
      type: DataTypes.JSON,
      allowNull: true
    },
    trackingId: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Order'
  })

  return Order
}

module.exports = OrderModel
