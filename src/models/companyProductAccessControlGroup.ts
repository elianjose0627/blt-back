import { Model } from 'sequelize'
import type { ICompanyProductAccessControlGroup } from '../types'

const CompanyProductAccessControlGroupModel = (sequelize: any, DataTypes: any): any => {
  interface CompanyProductAccessControlGroupAttributes {
    id: string
  }

  class CompanyProductAccessControlGroup extends Model<CompanyProductAccessControlGroupAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): ICompanyProductAccessControlGroup {
      return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CompanyProductAccessControlGroup.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CompanyProductAccessControlGroup'
  })

  return CompanyProductAccessControlGroup
}

module.exports = CompanyProductAccessControlGroupModel
