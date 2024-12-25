import { Model } from 'sequelize'
import type {
  IOrderConfirmation,
  ICompany,
  ICampaign,
  IUser,
  OrderLineRequest,
  ShippingAddressRequest,
  BillingAddressRequest
} from '../types'

const OrderConfirmationModel = (sequelize: any, DataTypes: any): any => {
  interface OrderConfirmationAttributes {
    id: string
    postedOrderId: string
    orderConfirmationNumber: number
    costCenter: string | null
    externalOrderNumber: string
    externalProjectNumber: string
    taxRate: number
    discountRate: number
    totalVat: number
    totalNet: number
    totalGross: number
    totalDiscount: number
    totalShipping: number
    amountPaid: number
    currency: string
    isEmailSent: boolean
    dueDate: Date
    deliveryDate: Date
    documentDate: Date
    orderLineRequests: OrderLineRequest[]
    shippingAddressRequests: ShippingAddressRequest[]
    billingAddressRequests: BillingAddressRequest[]
  }

  class OrderConfirmation extends Model<OrderConfirmationAttributes> {
    private readonly id: string
    private readonly postedOrderId: string
    private readonly orderConfirmationNumber: number
    private readonly costCenter: string | null
    private readonly externalOrderNumber: string
    private readonly externalProjectNumber: string
    private readonly taxRate: number
    private readonly discountRate: number
    private readonly totalVat: number
    private readonly totalNet: number
    private readonly totalGross: number
    private readonly totalDiscount: number
    private readonly totalShipping: number
    private readonly amountPaid: number
    private readonly currency: string
    private readonly isEmailSent: boolean
    private readonly dueDate: Date
    private readonly deliveryDate: Date
    private readonly documentDate: Date
    private readonly orderLineRequests: OrderLineRequest[]
    private readonly shippingAddressRequests: ShippingAddressRequest[]
    private readonly billingAddressRequests: BillingAddressRequest[]
    private readonly company: ICompany
    private readonly campaign: ICampaign
    private readonly owner: IUser
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      OrderConfirmation.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      OrderConfirmation.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
      OrderConfirmation.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IOrderConfirmation {
      return {
        id: this.id,
        postedOrderId: this.postedOrderId,
        orderConfirmationNumber: this.orderConfirmationNumber,
        externalOrderNumber: this.externalOrderNumber,
        externalProjectNumber: this.externalProjectNumber,
        taxRate: this.taxRate,
        discountRate: this.discountRate,
        totalVat: this.totalVat,
        totalNet: this.totalNet,
        totalGross: this.totalGross,
        totalDiscount: this.totalDiscount,
        totalShipping: this.totalShipping,
        currency: this.currency,
        isEmailSent: this.isEmailSent,
        dueDate: this.dueDate,
        deliveryDate: this.deliveryDate,
        documentDate: this.documentDate,
        amountPaid: this.amountPaid,
        costCenter: this.costCenter,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company,
        campaign: this.campaign,
        owner: this.owner,
        orderLineRequests: this.orderLineRequests,
        shippingAddressRequests: this.shippingAddressRequests,
        billingAddressRequests: this.billingAddressRequests
      }
    }
  };

  OrderConfirmation.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    postedOrderId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    orderConfirmationNumber: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      autoIncrement: true
    },
    externalOrderNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    externalProjectNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    taxRate: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    discountRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalVat: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalNet: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalGross: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalDiscount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalShipping: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    amountPaid: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'EUR'
    },
    isEmailSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    },
    documentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    },
    costCenter: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderLineRequests: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    shippingAddressRequests: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    billingAddressRequests: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'OrderConfirmation'
  })

  return OrderConfirmation
}

module.exports = OrderConfirmationModel
