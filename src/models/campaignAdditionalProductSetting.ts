import { Model } from 'sequelize'
import type { ICampaignAdditionalProductSetting, Role } from '../types'

const CampaignAdditionalProductSettingModel = (sequelize: any, DataTypes: any): any => {
  interface CampaignAdditionalProductSettingAttributes {
    id: string
    role: Role
    isSelectEnabled: boolean
  }

  class CampaignAdditionalProductSetting extends Model<CampaignAdditionalProductSettingAttributes> {
    private readonly id: string
    private readonly role: Role
    private readonly isSelectEnabled: boolean
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      CampaignAdditionalProductSetting.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICampaignAdditionalProductSetting {
      return {
        id: this.id,
        role: this.role,
        isSelectEnabled: this.isSelectEnabled,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CampaignAdditionalProductSetting.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isSelectEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CampaignAdditionalProductSetting'
  })

  return CampaignAdditionalProductSetting
}

module.exports = CampaignAdditionalProductSettingModel
