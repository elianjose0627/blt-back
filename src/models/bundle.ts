import { Model } from 'sequelize'
import { IBundle, ICampaign } from '../types'

const BundleModel = (sequelize: any, DataTypes: any): any => {
  interface BundleAttributes {
    id: string
    jfsku: string
    merchantSku: string
    name: string
  }

  class Bundle extends Model<BundleAttributes> {
    private readonly id: string
    private readonly jfsku: string
    private readonly merchantSku: string
    private readonly name: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly campaign: ICampaign

    static associate (models: any): any {
      Bundle.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IBundle {
      return {
        id: this.id,
        jfsku: this.jfsku,
        merchantSku: this.merchantSku,
        name: this.name,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        campaign: this.campaign
      }
    }
  };

  Bundle.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    jfsku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    merchantSku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Bundle'
  })

  return Bundle
}

module.exports = BundleModel
