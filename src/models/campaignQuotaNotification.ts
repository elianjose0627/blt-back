import { Model } from 'sequelize'
import type { ICampaignQuotaNotification } from '../types'

const CampaignQuotaNotificationModel = (sequelize: any, DataTypes: any): any => {
  interface CampaignQuotaNotificationAttributes {
    id: string
    threshold: number
    recipients: string[]
  }

  class CampaignQuotaNotification extends Model<CampaignQuotaNotificationAttributes> {
    private readonly id: string
    private readonly threshold: number
    private readonly recipients: string[]
    private readonly createdAt: Date
    private readonly updatedAt: Date

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
