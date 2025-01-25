import { Model } from 'sequelize'
import type { IPendingOrder, OrderLineRequest, ShippingAddressRequest, PaymentInformationRequest, ICompany, Nullable, BillingAddressRequest, IUser, ICampaign } from '../types'

const PendingOrderModel = (sequelize: any, DataTypes: any): any => {
  interface PendingOrderAttributes {
    id: string
    customerId: string
    userId: string
    campaignId: string
    companyId: string
    platform: number
    language: number
    currency: string
    orderNo: string
    inetorderno: number
    shippingId: number
    shipped: Date
    deliverydate: Date
    note: string
    description: string
    costCenter: string
    paymentType: number
    paymentTarget: number
    discount: number
    orderStatus: number
    quantity: number
    createdBy: string
    updatedBy: string
    createdByFullName: string
    orderLineRequests: OrderLineRequest[]
    shippingAddressRequests: ShippingAddressRequest[]
    billingAddressRequests: BillingAddressRequest[]
    paymentInformationRequests: PaymentInformationRequest[]
    isPosted: boolean
    postedOrderId: Nullable<string>
    isGreetingCardSent: boolean
    created: Date
    isOrderConfirmationGenerated: boolean
    isInvoiceGenerated: boolean
    isQueued: boolean
    jtlId: number
    jtlNumber: string
    isPackingSlipGenerated: boolean
  }

  class PendingOrder extends Model<PendingOrderAttributes> {
    private readonly id: string
    private readonly customerId: string
    private readonly platform: number
    private readonly language: number
    private readonly currency: string
    private readonly orderNo: string
    private readonly inetorderno: number
    private readonly shippingId: number
    private readonly shipped: Date
    private readonly deliverydate: Date
    private readonly note: string
    private readonly description: string
    private readonly costCenter: string
    private readonly paymentType: number
    private readonly paymentTarget: number
    private readonly discount: number
    private readonly orderStatus: number
    private readonly quantity: number
    private readonly createdBy: string
    private readonly updatedBy: string
    private readonly createdByFullName: string
    private readonly orderLineRequests: OrderLineRequest[]
    private readonly shippingAddressRequests: ShippingAddressRequest[]
    private readonly billingAddressRequests: BillingAddressRequest[]
    private readonly paymentInformationRequests: PaymentInformationRequest[]
    private readonly isPosted: boolean
    private readonly postedOrderId: Nullable<string>
    private readonly isGreetingCardSent: boolean
    private readonly created: Date
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany
    private readonly isOrderConfirmationGenerated: boolean
    private readonly isInvoiceGenerated: boolean
    private readonly isQueued: boolean
    private readonly jtlId: number
    private readonly jtlNumber: string
    private readonly owner: IUser
    private readonly isPackingSlipGenerated: boolean
    private readonly campaign: ICampaign

    static associate (models: any): any {
      PendingOrder.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      PendingOrder.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
      PendingOrder.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IPendingOrder {
      return {
        id: this.id,
        customerId: this.customerId,
        platform: this.platform,
        language: this.language,
        currency: this.currency,
        orderNo: this.orderNo,
        inetorderno: this.inetorderno,
        shippingId: this.shippingId,
        shipped: this.shipped,
        deliverydate: this.deliverydate,
        note: this.note,
        description: this.description,
        costCenter: this.costCenter,
        paymentType: this.paymentType,
        paymentTarget: this.paymentTarget,
        discount: this.discount,
        orderStatus: this.orderStatus,
        quantity: this.quantity,
        createdBy: this.createdBy,
        updatedBy: this.updatedBy,
        createdByFullName: this.createdByFullName,
        orderLineRequests: this.orderLineRequests,
        shippingAddressRequests: this.shippingAddressRequests,
        billingAddressRequests: this.billingAddressRequests,
        paymentInformationRequests: this.paymentInformationRequests,
        isPosted: this.isPosted,
        postedOrderId: this.postedOrderId,
        isGreetingCardSent: this.isGreetingCardSent,
        created: this.created,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company,
        isOrderConfirmationGenerated: this.isOrderConfirmationGenerated,
        isInvoiceGenerated: this.isInvoiceGenerated,
        isQueued: this.isQueued,
        jtlId: this.jtlId,
        jtlNumber: this.jtlNumber,
        owner: this.owner,
        isPackingSlipGenerated: this.isPackingSlipGenerated,
        campaign: this.campaign
      }
    }
  };

  PendingOrder.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    campaignId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    companyId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    platform: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    language: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false
    },
    inetorderno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shipped: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliverydate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    costCenter: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentType: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    paymentTarget: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    discount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    orderStatus: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    quantity: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 1
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdByFullName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderLineRequests: {
      type: DataTypes.JSON,
      allowNull: false
    },
    shippingAddressRequests: {
      type: DataTypes.JSON,
      allowNull: true
    },
    billingAddressRequests: {
      type: DataTypes.JSON,
      allowNull: true
    },
    paymentInformationRequests: {
      type: DataTypes.JSON,
      allowNull: true
    },
    isPosted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    postedOrderId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isGreetingCardSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created: {
      allowNull: false,
      type: DataTypes.DATE
    },
    isOrderConfirmationGenerated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isInvoiceGenerated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isQueued: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    jtlId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    jtlNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isPackingSlipGenerated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'PendingOrder'
  })

  return PendingOrder
}

module.exports = PendingOrderModel
