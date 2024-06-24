import { Model } from 'sequelize'
import type { ITaxRate } from '../types'

const TaxRateModel = (sequelize: any, DataTypes: any): any => {
  interface TaxRateAttributes {
    id: string
    publicId: string
    name: string
    countryCode: string
    zone: string
    rate: number
  }

  class TaxRate extends Model<TaxRateAttributes> {
    private readonly id: string
    private readonly publicId: string
    private readonly name: string
    private readonly countryCode: string
    private readonly zone: string
    private readonly rate: number
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): ITaxRate {
      return {
        id: this.id,
        publicId: this.publicId,
        name: this.name,
        countryCode: this.countryCode,
        zone: this.zone,
        rate: this.rate,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  TaxRate.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    publicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    countryCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'TaxRate'
  })

  return TaxRate
}

module.exports = TaxRateModel
