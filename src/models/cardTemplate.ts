import { Model } from 'sequelize'
import type { ICardTemplate } from '../types'

const CardTemplateModel = (sequelize: any, DataTypes: any): any => {
  interface CardTemplateAttributes {
    id: string
    name: string
    description: string
    isDraft: boolean
    front: string
    back: string
    frontOrientation: string
    backOrientation: string
    articleId: string | null
    isBarcodeEnabled: boolean
  }

  class CardTemplate extends Model<CardTemplateAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly description: string
    private readonly front: string
    private readonly back: string
    private readonly frontOrientation: string
    private readonly backOrientation: string
    private readonly isDraft: boolean
    private readonly articleId: string | null
    private readonly isBarcodeEnabled: boolean
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      CardTemplate.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICardTemplate {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        front: this.front,
        back: this.back,
        frontOrientation: this.frontOrientation,
        backOrientation: this.backOrientation,
        isDraft: this.isDraft,
        articleId: this.articleId,
        isBarcodeEnabled: this.isBarcodeEnabled,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CardTemplate.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isDraft: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    front: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    back: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    frontOrientation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    backOrientation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    articleId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isBarcodeEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CardTemplate'
  })

  return CardTemplate
}

module.exports = CardTemplateModel
