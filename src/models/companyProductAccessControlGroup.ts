import { Model } from 'sequelize'
import type { ICompany, ICompanyProductAccessControlGroup } from '../types'

const CompanyProductAccessControlGroupModel = (sequelize: any, DataTypes: any): any => {
  interface CompanyProductAccessControlGroupAttributes {
    id: string
  }

  class CompanyProductAccessControlGroup extends Model<CompanyProductAccessControlGroupAttributes> {
    private readonly id: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: Pick<ICompany, 'id' | 'name' | 'domain' | 'email'>

    static associate (models: any): any {
      CompanyProductAccessControlGroup.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICompanyProductAccessControlGroup {
      return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company
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
