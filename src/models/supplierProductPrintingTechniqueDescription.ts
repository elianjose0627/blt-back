import { Model } from 'sequelize'
import type { ISupplierProductPrintingTechniqueDescription } from '../types'

const SupplierProductPrintingTechniqueDescriptionModel = (sequelize: any, DataTypes: any): any => {
  interface SupplierProductPrintingTechniqueDescriptionAttributes {
    id: string
    printingTechniqueDescriptionId: string
    name: object
  }

  class SupplierProductPrintingTechniqueDescription extends Model<SupplierProductPrintingTechniqueDescriptionAttributes> {
    private readonly id: string
    private readonly printingTechniqueDescriptionId: string
    private readonly name: object
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): ISupplierProductPrintingTechniqueDescription {
      return {
        id: this.id,
        printingTechniqueDescriptionId: this.printingTechniqueDescriptionId,
        name: this.name,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  SupplierProductPrintingTechniqueDescription.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    printingTechniqueDescriptionId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    name: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SupplierProductPrintingTechniqueDescription'
  })

  return SupplierProductPrintingTechniqueDescription
}

module.exports = SupplierProductPrintingTechniqueDescriptionModel
