import { Model } from 'sequelize'
import { IShipment } from '../types'

const ShipmentModel = (sequelize: any, DataTypes: any): any => {
  interface ShipmentAttributes {
    id: string
    trackingId: string
    statusCode: string
    data: object
  }

  class Shipment extends Model<ShipmentAttributes> {
    private readonly id: string
    private readonly trackingId: string
    private readonly statusCode: string
    private readonly data: object
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IShipment {
      return {
        id: this.id,
        trackingId: this.trackingId,
        statusCode: this.statusCode,
        data: this.data,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  Shipment.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    trackingId: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    statusCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Shipment'
  })

  return Shipment
}

module.exports = ShipmentModel
