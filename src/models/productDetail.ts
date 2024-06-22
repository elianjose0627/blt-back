import { Model } from 'sequelize'

const ProductDetailModel = (sequelize: any, DataTypes: any): any => {
  interface ProductDetailAttributes {
    id: string
    metadata: object
  }

  class ProductDetail extends Model<ProductDetailAttributes> {
    static associate (models: any): any {

    }
  };

  ProductDetail.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ProductDetail'
  })

  return ProductDetail
}

module.exports = ProductDetailModel
