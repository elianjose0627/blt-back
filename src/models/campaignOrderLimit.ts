import { Model } from 'sequelize'
import type { ICampaignOrderLimit, Role } from '../types'

const CampaignOrderLimitModel = (sequelize: any, DataTypes: any): any => {
  interface CampaignOrderLimitAttributes {
    id: string
    limit: number
    role: Role
  }

  class CampaignOrderLimit extends Model<CampaignOrderLimitAttributes> {
    private readonly id: string
    private readonly limit: number
    private readonly role: Role
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      CampaignOrderLimit.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICampaignOrderLimit {
      return {
        id: this.id,
        limit: this.limit,
        role: this.role,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CampaignOrderLimit.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    limit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CampaignOrderLimit'
  })

  return CampaignOrderLimit
}

module.exports = CampaignOrderLimitModel
