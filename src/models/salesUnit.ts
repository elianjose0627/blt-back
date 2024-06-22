import { Model } from 'sequelize'
import type { ISalesUnit } from '../types'

const SalesUnitModel = (sequelize: any, DataTypes: any): any => {
  interface SalesUnitAttributes {
    id: string
    publicId: string
    name: string
    unit: number
  }

  class SalesUnit extends Model<SalesUnitAttributes> {
    private readonly id: string
    private readonly publicId: string
    private readonly name: string
    private readonly unit: number
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): ISalesUnit {
      return {
        id: this.id,
        publicId: this.publicId,
        name: this.name,
        unit: this.unit,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  SalesUnit.init({
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
    unit: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SalesUnit'
  })

  return SalesUnit
}

module.exports = SalesUnitModel
