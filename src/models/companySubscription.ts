import { Model } from 'sequelize'
import type { ICompanySubscription, SubscriptionPaymentStatus, SubscriptionPlan } from '../types'

const CompanySubscription = (sequelize: any, DataTypes: any): any => {
  interface CompanySubscriptionAttributes {
    id: string
    email: string
    plan: SubscriptionPlan
    startDate: Date
    endDate: Date
    paymentStatus: SubscriptionPaymentStatus
    description: string
    price: number
    discount: number
    vat: number
    autoRenew: boolean
  }

  class CompanySubscription extends Model<CompanySubscriptionAttributes> {
    private readonly id: string
    private readonly email: string
    private readonly plan: SubscriptionPlan
    private readonly startDate: Date
    private readonly endDate: Date
    private readonly paymentStatus: SubscriptionPaymentStatus
    private readonly description: string
    private readonly price: number
    private readonly discount: number
    private readonly vat: number
    private readonly autoRenew: boolean
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      CompanySubscription.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICompanySubscription {
      return {
        id: this.id,
        email: this.email,
        plan: this.plan,
        startDate: this.startDate,
        endDate: this.endDate,
        paymentStatus: this.paymentStatus,
        description: this.description,
        price: this.price,
        discount: this.discount,
        vat: this.vat,
        autoRenew: this.autoRenew,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CompanySubscription.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.00
    },
    discount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.00
    },
    vat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.00
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CompanySubscription'
  })

  return CompanySubscription
}

module.exports = CompanySubscription
