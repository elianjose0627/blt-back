import { Model } from 'sequelize'
import type { AddressType, IAddress, ICampaign } from '../types'

const CampaignAddressModel = (sequelize: any, DataTypes: any): any => {
  interface CampaignAddressAttributes {
    id: string
    companyName: string
    email: string
    costCenter: string
    country: string
    city: string
    street: string
    zip: string
    phone: string
    addressAddition: string
    vat: string
    type: AddressType
  }

  class CampaignAddress extends Model<CampaignAddressAttributes> {
    private readonly id: string
    private readonly companyName: string
    private readonly email: string
    private readonly costCenter: string
    private readonly country: string
    private readonly city: string
    private readonly street: string
    private readonly zip: string
    private readonly phone: string
    private readonly addressAddition: string
    private readonly vat: string
    private readonly type: AddressType
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly campaign: ICampaign

    static associate (models: any): any {
      CampaignAddress.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IAddress {
      return {
        id: this.id,
        companyName: this.companyName,
        email: this.email,
        costCenter: this.costCenter,
        country: this.country,
        city: this.city,
        street: this.street,
        zip: this.zip,
        phone: this.phone,
        addressAddition: this.addressAddition,
        vat: this.vat,
        type: this.type,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        campaign: this.campaign
      }
    }
  };

  CampaignAddress.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    costCenter: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    street: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    addressAddition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vat: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CampaignAddress'
  })

  return CampaignAddress
}

module.exports = CampaignAddressModel
