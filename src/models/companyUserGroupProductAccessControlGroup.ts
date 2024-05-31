import { Model } from 'sequelize'
import type { ICompanyUserGroupInProductAccessControlGroup } from '../types'

const CompanyUserGroupProductAccessControlGroupModel = (sequelize: any, DataTypes: any): any => {
  interface CompanyUserGroupProductAccessControlGroupAttributes {
    id: string
  }

  class CompanyUserGroupProductAccessControlGroup extends Model<CompanyUserGroupProductAccessControlGroupAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): ICompanyUserGroupInProductAccessControlGroup {
      return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CompanyUserGroupProductAccessControlGroup.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CompanyUserGroupProductAccessControlGroup'
  })

  return CompanyUserGroupProductAccessControlGroup
}

module.exports = CompanyUserGroupProductAccessControlGroupModel
