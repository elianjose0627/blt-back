import { Model } from 'sequelize'
import type { IMassUnit } from '../types'

const MassUnitModel = (sequelize: any, DataTypes: any): any => {
  interface MassUnitAttributes {
    id: string
    publicId: string
    name: string
    code: string
    displayCode: string
    referenceMassUnit: number
    referenceMassUnitFactor: number
  }

  class MassUnit extends Model<MassUnitAttributes> {
    private readonly id: string
    private readonly publicId: string
    private readonly name: string
    private readonly code: string
    private readonly displayCode: string
    private readonly referenceMassUnit: number
    private readonly referenceMassUnitFactor: number
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IMassUnit {
      return {
        id: this.id,
        publicId: this.publicId,
        name: this.name,
        code: this.code,
        displayCode: this.displayCode,
        referenceMassUnit: this.referenceMassUnit,
        referenceMassUnitFactor: this.referenceMassUnitFactor,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  MassUnit.init({
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
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    displayCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referenceMassUnit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    referenceMassUnitFactor: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0.0
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'MassUnit'
  })

  return MassUnit
}

module.exports = MassUnitModel
