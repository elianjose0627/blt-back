import { Model } from 'sequelize'
import type { ISupplierProductPrintDataProduct } from '../types'

const SupplierProductPrintDataProductModel = (sequelize: any, DataTypes: any): any => {
  interface SupplierProductPrintDataProductAttributes {
    id: string
    masterCode: string
    masterId: string
    itemColorNumbers: string[]
    printManipulation: string
    printTemplate: string
  }

  class SupplierProductPrintDataProduct extends Model<SupplierProductPrintDataProductAttributes> {
    private readonly id: string
    private readonly masterCode: string
    private readonly masterId: string
    private readonly itemColorNumbers: string[]
    private readonly printManipulation: string
    private readonly printTemplate: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      SupplierProductPrintDataProduct.hasMany(models.SupplierProductPrintDataProductPrintingPosition, {
        foreignKey: 'supplierProductPrintDataProductId',
        as: 'printDataProductPrintingPositions',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ISupplierProductPrintDataProduct {
      return {
        id: this.id,
        masterCode: this.masterCode,
        masterId: this.masterId,
        itemColorNumbers: this.itemColorNumbers,
        printManipulation: this.printManipulation,
        printTemplate: this.printTemplate,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  SupplierProductPrintDataProduct.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    masterCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    masterId: {
      type: DataTypes.DATE,
      allowNull: true
    },
    itemColorNumbers: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    printManipulation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    printTemplate: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SupplierProductPrintDataProduct'
  })

  return SupplierProductPrintDataProduct
}

module.exports = SupplierProductPrintDataProductModel
