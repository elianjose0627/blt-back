import { Model } from 'sequelize'

const CountryModel = (sequelize: any, DataTypes: any): any => {
  interface CountryAttributes {
    id: string
    name: string
    nameGerman: string
    alpha2Code: string
    alpha3Code: string
    numeric: number
    shippingBaseFee: number
    shippingPerBundle: number
  }

  class Country extends Model<CountryAttributes> {
    static associate (models: any): any {

    }
  }

  Country.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nameGerman: {
      type: DataTypes.STRING,
      allowNull: false
    },
    alpha2Code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    alpha3Code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numeric: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shippingBaseFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    shippingPerBundle: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Country'
  })

  return Country
}

module.exports = CountryModel
