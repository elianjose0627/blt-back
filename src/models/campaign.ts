import { Model } from 'sequelize'
import { CampaignStatus, CampaignType, ICampaign, ICompany } from '../types'

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
    isNoteEnabled: boolean
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
    private readonly isNoteEnabled: boolean
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany

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
        isNoteEnabled: this.isNoteEnabled,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company
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
    isNoteEnabled: {
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
