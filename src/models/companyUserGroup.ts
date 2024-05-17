import { Model } from 'sequelize'
import type { ICompany, IUser, ICompanyUserGroup } from '../types'

const CompanyUserGroupModel = (sequelize: any, DataTypes: any): any => {
  interface CompanyUserGroupAttributes {
    id: string
    name: string
    description: string
  }

  class CompanyUserGroup extends Model<CompanyUserGroupAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly description: string
    private readonly company: ICompany
    private readonly users: IUser[]
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      CompanyUserGroup.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      CompanyUserGroup.belongsToMany(models.User, {
        foreignKey: 'companyUserGroupId',
        through: models.UserCompanyUserGroup,
        as: 'users'
      })
      CompanyUserGroup.belongsToMany(models.ProductAccessControlGroup, {
        foreignKey: 'companyUserGroupId',
        through: models.CompanyUserGroupProductAccessControlGroup,
        as: 'companyUserGroups'
      })
    }

    toJSONFor (): ICompanyUserGroup {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        company: this.company,
        users: this.users,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CompanyUserGroup.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CompanyUserGroup'
  })

  return CompanyUserGroup
}

module.exports = CompanyUserGroupModel
