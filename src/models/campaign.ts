import { Model } from 'sequelize'
import type { CampaignStatus, CampaignType, IAddress, ICampaign, ICampaignOrderLimit, ICampaignShippingDestination, ICardSetting, ICardTemplate, ICompany, Nullable } from '../types'

const CampaignModel = (sequelize: any, DataTypes: any): any => {
  interface CampaignAttributes {
    id: string
    name: string
    status: CampaignStatus
    type: CampaignType
    description: string
    quota: number
    usedQuota: number
    correctionQuota: number
    lastQuotaResetDate: Date
    isQuotaEnabled: boolean
    isExceedQuotaEnabled: boolean
    isExceedStockEnabled: boolean
    isNoteEnabled: boolean
    isActive: boolean
    isHidden: boolean
    isBulkCreateEnabled: boolean
    shippingMethodType: Nullable<number>
    shippingMethodIsDropShipping: boolean
    includeStartDate: boolean
  }

  class Campaign extends Model<CampaignAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly status: CampaignStatus
    private readonly type: CampaignType
    private readonly description: string
    private readonly quota: number
    private readonly usedQuota: number
    private readonly correctionQuota: number
    private readonly lastQuotaResetDate: Date
    private readonly isQuotaEnabled: boolean
    private readonly isExceedQuotaEnabled: boolean
    private readonly isExceedStockEnabled: boolean
    private readonly isNoteEnabled: boolean
    private readonly isActive: boolean
    private readonly isHidden: boolean
    private readonly isBulkCreateEnabled: boolean
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany
    private readonly cardTemplates: ICardTemplate[]
    private readonly cardSetting: ICardSetting
    private readonly campaignShippingDestinations: ICampaignShippingDestination[]
    private readonly campaignOrderLimits: ICampaignOrderLimit[]
    private readonly campaignAddresses: IAddress[]
    private readonly shippingMethodType: Nullable<number>
    private readonly shippingMethodIsDropShipping: boolean
    private readonly includeStartDate: boolean

    static associate (models: any): any {
      Campaign.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      Campaign.hasMany(models.Recipient, {
        foreignKey: 'campaignId',
        as: 'recipients',
        onDelete: 'CASCADE'
      })
      Campaign.hasMany(models.Bundle, {
        foreignKey: 'campaignId',
        as: 'bundles',
        onDelete: 'CASCADE'
      })
      Campaign.hasMany(models.CardTemplate, {
        foreignKey: 'campaignId',
        as: 'cardTemplates',
        onDelete: 'CASCADE'
      })
      Campaign.hasOne(models.CardSetting, {
        foreignKey: 'campaignId',
        as: 'cardSetting',
        onDelete: 'CASCADE'
      })
      Campaign.hasMany(models.CampaignOrderLimit, {
        foreignKey: 'campaignId',
        as: 'campaignOrderLimits',
        onDelete: 'CASCADE'
      })
      Campaign.hasMany(models.CampaignShippingDestination, {
        foreignKey: 'campaignId',
        as: 'campaignShippingDestinations',
        onDelete: 'CASCADE'
      })
      Campaign.hasMany(models.CampaignAddress, {
        foreignKey: 'campaignId',
        as: 'campaignAddresses',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICampaign {
      return {
        id: this.id,
        name: this.name,
        status: this.status,
        type: this.type,
        description: this.description,
        quota: this.quota,
        usedQuota: this.usedQuota,
        correctionQuota: this.correctionQuota,
        lastQuotaResetDate: this.lastQuotaResetDate,
        isQuotaEnabled: this.isQuotaEnabled,
        isExceedQuotaEnabled: this.isExceedQuotaEnabled,
        isExceedStockEnabled: this.isExceedStockEnabled,
        isNoteEnabled: this.isNoteEnabled,
        isActive: this.isActive,
        isHidden: this.isHidden,
        isBulkCreateEnabled: this.isBulkCreateEnabled,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company,
        cardTemplates: this.cardTemplates,
        cardSetting: this.cardSetting,
        campaignShippingDestinations: this.campaignShippingDestinations,
        campaignOrderLimits: this.campaignOrderLimits,
        campaignAddresses: this.campaignAddresses,
        shippingMethodType: this.shippingMethodType,
        shippingMethodIsDropShipping: this.shippingMethodIsDropShipping,
        includeStartDate: this.includeStartDate
      }
    }
  };

  Campaign.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quota: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    usedQuota: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    correctionQuota: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastQuotaResetDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isQuotaEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isExceedQuotaEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isExceedStockEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isNoteEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isBulkCreateEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    shippingMethodType: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    shippingMethodIsDropShipping: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    includeStartDate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Campaign'
  })

  return Campaign
}

module.exports = CampaignModel
