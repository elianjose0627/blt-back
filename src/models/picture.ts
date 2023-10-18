import { Model } from 'sequelize'
import type { IPicture } from '../types'

const PictureModel = (sequelize: any, DataTypes: any): any => {
  interface PictureAttributes {
    id: string
    url: string
    filename: string
    size: number
    mimeType: string
  }

  class Picture extends Model<PictureAttributes> {
    private readonly id: string
    private readonly url: string
    private readonly filename: string
    private readonly size: number
    private readonly mimeType: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      Picture.belongsTo(models.Bundle, {
        foreignKey: 'bundleId',
        as: 'bundle',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IPicture {
      return {
        id: this.id,
        url: this.url,
        filename: this.filename,
        size: this.size,
        mimeType: this.mimeType,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  Picture.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    filename: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Picture'
  })

  return Picture
}

module.exports = PictureModel
