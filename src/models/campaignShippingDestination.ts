import { Model } from 'sequelize'
import type { ICampaignShippingDestination } from '../types'

const CampaignShippingDestinationModel = (sequelize: any, DataTypes: any): any => {
  interface CampaignShippingDestinationAttributes {
    id: string
    country: string
  }

  class CampaignShippingDestination extends Model<CampaignShippingDestinationAttributes> {
    private readonly id: string
    private readonly country: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      CampaignShippingDestination.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICampaignShippingDestination {
      return {
        id: this.id,
        country: this.country,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CampaignShippingDestination.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CampaignShippingDestination'
  })

  return CampaignShippingDestination
}

module.exports = CampaignShippingDestinationModel
