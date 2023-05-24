import { Model } from 'sequelize'

const BundleItemModel = (sequelize: any, DataTypes: any): any => {
  interface BundleItemAttributes {
    id: string
    jfsku: string
    merchantSku: string
    name: string
    description: string
  }

  class BundleItem extends Model<BundleItemAttributes> {
    static associate (models: any): any {
      BundleItem.belongsTo(models.Bundle, {
        foreignKey: 'bundleId',
        as: 'bundle',
        onDelete: 'CASCADE'
      })
    }
  };

  BundleItem.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    jfsku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    merchantSku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'BundleItem'
  })

  return BundleItem
}

module.exports = BundleItemModel
