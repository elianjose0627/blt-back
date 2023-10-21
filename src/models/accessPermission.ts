import { Model } from 'sequelize'
import type { IAccessPermission, ICompany, Module, Permission, Role } from '../types'

const AccessPermissionModel = (sequelize: any, DataTypes: any): any => {
  interface AccessPermissionAttributes {
    id: string
    name: string
    role: Role
    module: Module
    permission: Permission
    isEnabled: boolean
  }

  class AccessPermission extends Model<AccessPermissionAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly role: Role
    private readonly module: Module
    private readonly permission: Permission
    private readonly isEnabled: boolean
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany

    static associate (models: any): any {
      AccessPermission.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IAccessPermission {
      return {
        id: this.id,
        name: this.name,
        role: this.role,
        module: this.module,
        permission: this.permission,
        isEnabled: this.isEnabled,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company
      }
    }
  };

  AccessPermission.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permission: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'AccessPermission'
  })

  return AccessPermission
}

module.exports = AccessPermissionModel
