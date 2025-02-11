import { Model } from 'sequelize'
import type { IProductCustomisation, IProductCustomisationChat, IUser, MediaData, Nullable } from '../types'

const ProductCustomisationChatModel = (sequelize: any, DataTypes: any): any => {
  interface ProductCustomisationChatAttributes {
    id: string
    message: string
    attachment: Nullable<MediaData>
  }

  class ProductCustomisationChat extends Model<ProductCustomisationChatAttributes> {
    private readonly id: string
    private readonly message: string
    private readonly attachment: Nullable<MediaData>
    private readonly owner: IUser
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly productCustomisation: IProductCustomisation

    static associate (models: any): any {
      ProductCustomisationChat.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
        onDelete: 'CASCADE'
      })

      ProductCustomisationChat.belongsTo(models.User, {
        foreignKey: 'productCustomisationId',
        as: 'productCustomisation',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IProductCustomisationChat {
      return {
        id: this.id,
        message: this.message,
        attachment: this.attachment,
        owner: this.owner,
        productCustomisation: this.productCustomisation,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  ProductCustomisationChat.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    attachment: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductCustomisationChat'
  })

  return ProductCustomisationChat
}

module.exports = ProductCustomisationChatModel
