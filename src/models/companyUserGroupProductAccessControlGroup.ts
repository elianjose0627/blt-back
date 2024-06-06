import { Model } from 'sequelize'
import type { ICompanyUserGroupInProductAccessControlGroup, ICompanyUserGroup } from '../types'

const CompanyUserGroupProductAccessControlGroupModel = (sequelize: any, DataTypes: any): any => {
  interface CompanyUserGroupProductAccessControlGroupAttributes {
    id: string
  }

  class CompanyUserGroupProductAccessControlGroup extends Model<CompanyUserGroupProductAccessControlGroupAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly companyUserGroup: Pick<ICompanyUserGroup, 'id' | 'name' & { company: { id: string, name: string, domain: string }}>

    static associate (models: any): any {
      CompanyUserGroupProductAccessControlGroup.belongsTo(models.CompanyUserGroup, {
        foreignKey: 'companyUserGroupId',
        as: 'companyUserGroup',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICompanyUserGroupInProductAccessControlGroup {
      return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        companyUserGroup: this.companyUserGroup
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
