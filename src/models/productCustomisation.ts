import { Model } from 'sequelize'
import type { MediaData, IProduct, IProductCustomisation, IUser, ICompany, IProductCustomisationChat, ProductCustomisationType } from '../types'

const ProductCustomisationModel = (sequelize: any, DataTypes: any): any => {
  interface ProductCustomisationAttributes {
    id: string
    customisationType: ProductCustomisationType
    customisationDetail: string
    price: number
    available: boolean
    isApproved: boolean
    designStatus: string
    color: string
    photos: MediaData[]
  }

  class ProductCustomisation extends Model<ProductCustomisationAttributes> {
    private readonly id: string
    private readonly customisationType: ProductCustomisationType
    private readonly customisationDetail: string
    private readonly price: number
    private readonly available: boolean
    private readonly isApproved: boolean
    private readonly designStatus: string
    private readonly color: string
    private readonly photos: MediaData[]
    private readonly owner: IUser
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly product: IProduct
    private readonly company: ICompany
    private readonly chats: IProductCustomisationChat[]

    static associate (models: any): any {
      ProductCustomisation.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product',
        onDelete: 'CASCADE'
      })
      ProductCustomisation.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
        onDelete: 'CASCADE'
      })
      ProductCustomisation.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      ProductCustomisation.hasMany(models.ProductCustomisationChat, {
        foreignKey: 'productCustomisationId',
        as: 'chats',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IProductCustomisation {
      return {
        id: this.id,
        customisationType: this.customisationType,
        customisationDetail: this.customisationDetail,
        price: this.price,
        available: this.available,
        isApproved: this.isApproved,
        designStatus: this.designStatus,
        color: this.color,
        photos: this.photos,
        company: this.company,
        owner: this.owner,
        chats: this.chats,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        product: this.product
      }
    }
  };

  ProductCustomisation.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    customisationType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customisationDetail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    designStatus: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    photos: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductCustomisation'
  })

  return ProductCustomisation
}

module.exports = ProductCustomisationModel
