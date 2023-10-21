import { Model } from 'sequelize'
import type { ISalutation } from '../types'

const SalutationModel = (sequelize: any, DataTypes: any): any => {
  interface SalutationAttributes {
    id: string
    title: string
  }

  class Salutation extends Model<SalutationAttributes> {
    private readonly id: string
    private readonly title: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): ISalutation {
      return {
        id: this.id,
        title: this.title,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  Salutation.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Salutation'
  })

  return Salutation
}

module.exports = SalutationModel
