import { Model } from 'sequelize'
import type { ICompany, ICompanyUserGroup, IProductAccessControlGroup, IUser } from '../types'

const ProductAccessControlGroupModel = (sequelize: any, DataTypes: any): any => {
  interface ProductAccessControlGroupAttributes {
    id: string
    name: string
    description: string
  }

  class ProductAccessControlGroup extends Model<ProductAccessControlGroupAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly description: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany | null
    private readonly users: IUser[]
    private readonly companies: ICompany[]
    private readonly companyUserGroups: ICompanyUserGroup[]

    static associate (models: any): any {
      ProductAccessControlGroup.belongsToMany(models.User, {
        foreignKey: 'productAccessControlGroupId',
        through: models.UserProductAccessControlGroup,
        as: 'users'
      })
      ProductAccessControlGroup.belongsToMany(models.ProductCategoryTag, {
        foreignKey: 'productAccessControlGroupId',
        through: models.ProductCategoryTagProductAccessControlGroup,
        as: 'productCategoryTags'
      })
      ProductAccessControlGroup.belongsToMany(models.Company, {
        foreignKey: 'productAccessControlGroupId',
        through: models.CompanyProductAccessControlGroup,
        as: 'companies'
      })
      ProductAccessControlGroup.belongsToMany(models.CompanyUserGroup, {
        foreignKey: 'productAccessControlGroupId',
        through: models.CompanyUserGroupProductAccessControlGroup,
        as: 'companyUserGroups'
      })
      ProductAccessControlGroup.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): Omit<IProductAccessControlGroup, 'productCategoryTags'> {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company,
        users: this.users,
        companies: this.companies,
        companyUserGroups: this.companyUserGroups
      }
    }
  };

  ProductAccessControlGroup.init({
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
    modelName: 'ProductAccessControlGroup'
  })

  return ProductAccessControlGroup
}

module.exports = ProductAccessControlGroupModel
