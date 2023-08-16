import { Model } from 'sequelize'
import { ICardTemplate } from '../types'

const CardTemplateModel = (sequelize: any, DataTypes: any): any => {
  interface CardTemplateAttributes {
    id: string
    name: string
    description: string
    isDraft: boolean
    front: string
    back: string
  }

  class CardTemplate extends Model<CardTemplateAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly description: string
    private readonly front: string
    private readonly back: string
    private readonly isDraft: boolean
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
        isDraft: this.isDraft,
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
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CardTemplate'
  })

  return CardTemplate
}

module.exports = CardTemplateModel
