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
    isEnabled: boolean
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
    private readonly isEnabled: boolean

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
        updatedAt: this.updatedAt,
        isEnabled: this.isEnabled
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
      defaultValue: 'month'
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
    modelName: 'CampaignQuotaNotification',
    tableName: 'CampaignQuotaNotifications'
  })

  return CampaignQuotaNotification
}

module.exports = CampaignQuotaNotificationModel
