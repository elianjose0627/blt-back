import { Model } from 'sequelize'
import type { ITitle } from '../types'

const TitleModel = (sequelize: any, DataTypes: any): any => {
  interface TitleAttributes {
    id: string
    name: string
  }

  class Title extends Model<TitleAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): ITitle {
      return {
        id: this.id,
        name: this.name,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  Title.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Title'
  })

  return Title
}

module.exports = TitleModel
