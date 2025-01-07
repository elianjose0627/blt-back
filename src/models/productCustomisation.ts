import { Model } from 'sequelize'
import type { IPhoto, IProduct, IProductCustomisation, IUser, ProductCustomisationType } from '../types'

const ProductCustomisationModel = (sequelize: any, DataTypes: any): any => {
  interface ProductCustomisationAttributes {
    id: string
    customisationType: ProductCustomisationType
    customisationDetail: object
    price: number
    available: boolean
    photo: IPhoto[]
  }

  class ProductCustomisation extends Model<ProductCustomisationAttributes> {
    private readonly id: string
    private readonly customisationType: ProductCustomisationType
    private readonly customisationDetail: object
    private readonly price: number
    private readonly available: boolean
    private readonly photo: IPhoto[]
    private readonly owner: IUser
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly product: IProduct

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
    }

    toJSONFor (): IProductCustomisation {
      return {
        id: this.id,
        customisationType: this.customisationType,
        customisationDetail: this.customisationDetail,
        price: this.price,
        available: this.available,
        photo: this.photo,
        owner: this.owner,
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
    photo: {
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
