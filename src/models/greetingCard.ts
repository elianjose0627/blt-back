import { Model } from 'sequelize'
import { IGreetingCard } from '../types'

const GreetingCardModel = (sequelize: any, DataTypes: any): any => {
  interface GreetingCardAttributes {
    id: string
    articleNumber: string
    articleName: string
    url: string
    totalStock: number
    inventory: number
    availableStock: number
    jtlfpid: number
  }

  class GreetingCard extends Model<GreetingCardAttributes> {
    private readonly id: string
    private readonly articleNumber: string
    private readonly articleName: string
    private readonly url: string
    private readonly totalStock: number
    private readonly inventory: number
    private readonly availableStock: number
    private readonly jtlfpid: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      GreetingCard.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IGreetingCard {
      return {
        id: this.id,
        articleNumber: this.articleNumber,
        articleName: this.articleName,
        url: this.url,
        totalStock: this.totalStock,
        inventory: this.inventory,
        availableStock: this.availableStock,
        jtlfpid: this.jtlfpid,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  GreetingCard.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    articleNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    articleName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    totalStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    inventory: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    availableStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    jtlfpid: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'GreetingCard'
  })

  return GreetingCard
}

module.exports = GreetingCardModel
