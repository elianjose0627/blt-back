import { Model } from 'sequelize'
import type {
  IPackingSlip,
  ICompany,
  ICampaign,
  IUser,
  OrderLineRequest,
  ShippingAddressRequest,
  BillingAddressRequest,
  Nullable
} from '../types'

const PackingSlipModel = (sequelize: any, DataTypes: any): any => {
  interface PackingSlipAttributes {
    id: string
    postedOrderId: string
    packingSlipNumber: number
    trackingId: Nullable<string>
    costCenter: string | null
    externalOrderNumber: number
    externalProjectNumber: number
    dueDate: Date
    deliveryDate: Date
    documentDate: Date
    isEmailSent: boolean
    orderLineRequests: OrderLineRequest[]
    shippingAddressRequests: ShippingAddressRequest[]
    billingAddressRequests: BillingAddressRequest[]
  }

  class PackingSlip extends Model<PackingSlipAttributes> {
    private readonly id: string
    private readonly postedOrderId: string
    private readonly packingSlipNumber: number
    private readonly trackingId: Nullable<string>
    private readonly costCenter: string | null
    private readonly externalOrderNumber: string
    private readonly externalProjectNumber: string
    private readonly dueDate: Date
    private readonly deliveryDate: Date
    private readonly documentDate: Date
    private readonly isEmailSent: boolean
    private readonly orderLineRequests: OrderLineRequest[]
    private readonly shippingAddressRequests: ShippingAddressRequest[]
    private readonly billingAddressRequests: BillingAddressRequest[]
    private readonly company: ICompany
    private readonly campaign: ICampaign
    private readonly owner: IUser
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      PackingSlip.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      PackingSlip.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
      PackingSlip.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IPackingSlip {
      return {
        id: this.id,
        postedOrderId: this.postedOrderId,
        packingSlipNumber: this.packingSlipNumber,
        trackingId: this.trackingId,
        costCenter: this.costCenter,
        externalOrderNumber: this.externalOrderNumber,
        externalProjectNumber: this.externalProjectNumber,
        dueDate: this.dueDate,
        deliveryDate: this.deliveryDate,
        documentDate: this.documentDate,
        isEmailSent: this.isEmailSent,
        orderLineRequests: this.orderLineRequests,
        shippingAddressRequests: this.shippingAddressRequests,
        billingAddressRequests: this.billingAddressRequests,
        company: this.company,
        campaign: this.campaign,
        owner: this.owner,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  PackingSlip.init({
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
    packingSlipNumber: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      autoIncrement: true
    },
    trackingId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    costCenter: {
      type: DataTypes.STRING,
      allowNull: true
    },
    externalOrderNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    externalProjectNumber: {
      type: DataTypes.STRING,
      allowNull: false
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
    isEmailSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    modelName: 'PackingSlip'
  })

  return PackingSlip
}

module.exports = PackingSlipModel
