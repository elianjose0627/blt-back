import { Model } from 'sequelize'
import type { IJtlShippingMethod, ModificationInfo } from '../types'

const JtlShippingMethodModel = (sequelize: any, DataTypes: any): any => {
  interface JtlShippingMethodAttributes {
    id: string
    shippingMethodId: string
    name: string
    fulfillerId: string
    shippingType: string
    trackingUrlSchema: string
    carrierCode: string
    carrierName: string
    cutoffTime: string
    note: string
    modificationInfo: ModificationInfo
  }

  class JtlShippingMethod extends Model<JtlShippingMethodAttributes> {
    private readonly id: string
    private readonly shippingMethodId: string
    private readonly name: string
    private readonly fulfillerId: string
    private readonly shippingType: string
    private readonly trackingUrlSchema: string
    private readonly carrierCode: string
    private readonly carrierName: string
    private readonly cutoffTime: string
    private readonly note: string
    private readonly modificationInfo: ModificationInfo
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IJtlShippingMethod {
      return {
        id: this.id,
        shippingMethodId: this.shippingMethodId,
        name: this.name,
        fulfillerId: this.fulfillerId,
        shippingType: this.shippingType,
        trackingUrlSchema: this.trackingUrlSchema,
        carrierCode: this.carrierCode,
        carrierName: this.carrierName,
        cutoffTime: this.cutoffTime,
        note: this.note,
        modificationInfo: this.modificationInfo,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  JtlShippingMethod.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    shippingMethodId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fulfillerId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    carrierCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    carrierName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    trackingUrlSchema: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cutoffTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true
    },
    modificationInfo: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'JtlShippingMethod'
  })

  return JtlShippingMethod
}

module.exports = JtlShippingMethodModel
