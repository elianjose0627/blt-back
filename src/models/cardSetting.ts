import { Model } from 'sequelize'
import type { ICardSetting } from '../types'

const CardSettingModel = (sequelize: any, DataTypes: any): any => {
  interface CardSettingAttributes {
    id: string
    isEnabled: boolean
    isFrontSelectable: boolean
    isRotationEnabled: boolean
    isBackEditable: boolean
    isAutoProcessingEnabled: boolean
    defaultBack: string
    defaultFront: string
    exportOrientation: 'portrait' | 'landscape'
    exportSides: 'both' | 'front' | 'back'
    supplierEmail: string
    articleId: string
  }

  class CardSetting extends Model<CardSettingAttributes> {
    private readonly id: string
    private readonly isEnabled: boolean
    private readonly isFrontSelectable: boolean
    private readonly isRotationEnabled: boolean
    private readonly isBackEditable: boolean
    private readonly isAutoProcessingEnabled: boolean
    private readonly defaultBack: string
    private readonly defaultFront: string
    private readonly exportOrientation: 'portrait' | 'landscape'
    private readonly exportSides: 'both' | 'front' | 'back'
    private readonly supplierEmail: string
    private readonly articleId: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      CardSetting.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICardSetting {
      return {
        id: this.id,
        isEnabled: this.isEnabled,
        isFrontSelectable: this.isFrontSelectable,
        isRotationEnabled: this.isRotationEnabled,
        isBackEditable: this.isBackEditable,
        isAutoProcessingEnabled: this.isAutoProcessingEnabled,
        defaultBack: this.defaultBack,
        defaultFront: this.defaultFront,
        exportOrientation: this.exportOrientation,
        exportSides: this.exportSides,
        supplierEmail: this.supplierEmail,
        articleId: this.articleId,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CardSetting.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isFrontSelectable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isRotationEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isBackEditable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isAutoProcessingEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    defaultBack: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    defaultFront: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    exportOrientation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    exportSides: {
      type: DataTypes.STRING,
      allowNull: true
    },
    supplierEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    articleId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CardSetting'
  })

  return CardSetting
}

module.exports = CardSettingModel
