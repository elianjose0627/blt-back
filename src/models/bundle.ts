import { Model } from 'sequelize'
import type { IBundle, ICampaign, IPicture, ISpecifications } from '../types'

const BundleModel = (sequelize: any, DataTypes: any): any => {
  interface BundleAttributes {
    id: string
    jfsku: string
    merchantSku: string
    name: string
    description: string
    price: number
    isLocked: boolean
    isBillOfMaterials: boolean
    shippingMethodType: number
    specifications: ISpecifications
  }

  class Bundle extends Model<BundleAttributes> {
    private readonly id: string
    private readonly jfsku: string
    private readonly merchantSku: string
    private readonly name: string
    private readonly description: string
    private readonly price: number
    private readonly isLocked: boolean
    private readonly isBillOfMaterials: boolean
    private readonly shippingMethodType: number
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly campaign: ICampaign
    private readonly specifications: ISpecifications
    private readonly pictures: IPicture[]

    static associate (models: any): any {
      Bundle.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
      Bundle.hasMany(models.Picture, {
        foreignKey: 'bundleId',
        as: 'pictures',
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
        isLocked: this.isLocked,
        isBillOfMaterials: this.isBillOfMaterials,
        shippingMethodType: this.shippingMethodType,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        campaign: this.campaign,
        specifications: this.specifications,
        pictures: this.pictures
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
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isBillOfMaterials: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    shippingMethodType: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Bundle'
  })

  return Bundle
}

module.exports = BundleModel
