import { Model } from 'sequelize'
import { IBundle, IBundleItem, ICampaign } from '../types'

const BundleModel = (sequelize: any, DataTypes: any): any => {
  interface BundleAttributes {
    id: string
    jfsku: string
    merchantSku: string
    name: string
    description: string
    price: number
  }

  class Bundle extends Model<BundleAttributes> {
    private readonly id: string
    private readonly jfsku: string
    private readonly merchantSku: string
    private readonly name: string
    private readonly description: string
    private readonly price: number
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly campaign: ICampaign
    private readonly items: IBundleItem

    static associate (models: any): any {
      Bundle.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
      Bundle.hasMany(models.BundleItem, {
        foreignKey: 'bundleId',
        as: 'items',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IBundle {
      return {
        id: this.id,
        jfsku: this.jfsku,
        merchantSku: this.merchantSku,
        name: this.name,
        description: this.description,
        price: this.price,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        campaign: this.campaign,
        items: this.items
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
      allowNull: true
    },
    merchantSku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Bundle'
  })

  return Bundle
}

module.exports = BundleModel
