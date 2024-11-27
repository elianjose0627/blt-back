import { Model } from 'sequelize'
import type { ICampaignQuotaNotification, TimeFrequencyUnit } from '../types'

const CampaignQuotaNotificationModel = (sequelize: any, DataTypes: any): any => {
  interface CampaignQuotaNotificationAttributes {
    id: string
    threshold: number
    recipients: string[]
    frequency: number
    frequencyUnit: TimeFrequencyUnit
    lastSentAt: Date | null
  }

  class CampaignQuotaNotification extends Model<CampaignQuotaNotificationAttributes> {
    private readonly id: string
    private readonly threshold: number
    private readonly recipients: string[]
    private readonly frequency: number
    private readonly frequencyUnit: TimeFrequencyUnit
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly lastSentAt: Date | null

    static associate (models: any): any {
      CampaignQuotaNotification.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICampaignQuotaNotification {
      return {
        id: this.id,
        threshold: this.threshold,
        recipients: this.recipients,
        frequency: this.frequency,
        frequencyUnit: this.frequencyUnit,
        lastSentAt: this.lastSentAt,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CampaignQuotaNotification.init({
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
      defaultValue: 'day'
    },
    lastSentAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CampaignQuotaNotification',
    tableName: 'CampaignQuotaNotifications'
  })

  return CampaignQuotaNotification
}

module.exports = CampaignQuotaNotificationModel
