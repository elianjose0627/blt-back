import { Model } from 'sequelize'
import { CampaignStatus, CampaignType, IBundle, ICampaign, ICompany } from '../types'

const CampaignModel = (sequelize: any, DataTypes: any): any => {
  interface CampaignAttributes {
    id: string
    name: string
    status: CampaignStatus
    type: CampaignType
  }

  class Campaign extends Model<CampaignAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly status: CampaignStatus
    private readonly type: CampaignType
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany
    private readonly bundles: IBundle

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
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company,
        bundles: this.bundles
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
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Campaign'
  })

  return Campaign
}

module.exports = CampaignModel
