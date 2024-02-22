import { Model } from 'sequelize'
import type { IMaintenanceMode } from '../types'

const MaintenanceModeModel = (sequelize: any, DataTypes: any): any => {
  interface MaintenanceModeAttributes {
    id: string
    isActive: boolean
    reason: string
    startDate: Date
    endDate: Date
  }

  class MaintenanceMode extends Model<MaintenanceModeAttributes> {
    private readonly id: string
    private readonly isActive: boolean
    private readonly reason: string
    private readonly startDate: Date
    private readonly endDate: Date
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IMaintenanceMode {
      return {
        id: this.id,
        isActive: this.isActive,
        reason: this.reason,
        startDate: this.startDate,
        endDate: this.endDate,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  MaintenanceMode.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'MaintenanceMode'
  })

  return MaintenanceMode
}

module.exports = MaintenanceModeModel
