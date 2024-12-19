import { Model } from 'sequelize'
import type {
  IAccessPermission, IAddress, ICompany, ICompanySubscription,
  ICompanyUserGroup, IProductAccessControlGroup, ISecondaryDomain, IShopHeader, IUser, MediaData, Nullable, Theme
} from '../types'

const CompanyModel = (sequelize: any, DataTypes: any): any => {
  interface CompanyAttributes {
    id: string
    customerId: number
    name: string
    suffix: string
    email: string
    phone: string
    vat: string
    domain: string
    isDomainVerified: boolean
    domainVerificationCode: { value: string, createdAt: Date }
    theme: Nullable<Theme>
    logo: Nullable<MediaData>
    shopHeader: Nullable<IShopHeader>
  }

  class Company extends Model<CompanyAttributes> {
    private readonly id: string
    private readonly customerId: number
    private readonly name: string
    private readonly suffix: string
    private readonly email: string
    private readonly phone: string
    private readonly vat: string
    private readonly domain: string
    private readonly isDomainVerified: boolean
    private readonly domainVerificationCode: { value: string, createdAt: Date }
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly owner: IUser
    private readonly addresses: IAddress[]
    private readonly secondaryDomains: ISecondaryDomain[]
    private readonly accessPermissions: IAccessPermission[]
    private readonly theme: Nullable<Theme>
    private readonly logo: Nullable<MediaData>
    private readonly subscriptions: ICompanySubscription[]
    private readonly productAccessControlGroups: IProductAccessControlGroup[]
    private readonly companyUserGroups: ICompanyUserGroup[]
    private readonly shopHeader: Nullable<IShopHeader>

    static associate (models: any): any {
      Company.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.User, {
        foreignKey: 'companyId',
        as: 'employees',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.Address, {
        foreignKey: 'companyId',
        as: 'addresses',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.Campaign, {
        foreignKey: 'companyId',
        as: 'campaigns',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.CostCenter, {
        foreignKey: 'companyId',
        as: 'costCenters',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.Product, {
        foreignKey: 'companyId',
        as: 'products',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.SecondaryDomain, {
        foreignKey: 'companyId',
        as: 'secondaryDomains',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.LegalText, {
        foreignKey: 'companyId',
        as: 'legalTexts',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.PrivacyRule, {
        foreignKey: 'companyId',
        as: 'privacyRules',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.AccessPermission, {
        foreignKey: 'companyId',
        as: 'accessPermissions',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.CompanySubscription, {
        foreignKey: 'companyId',
        as: 'subscriptions',
        onDelete: 'CASCADE'
      })
      Company.belongsToMany(models.ProductAccessControlGroup, {
        foreignKey: 'companyId',
        through: models.CompanyProductAccessControlGroup,
        as: 'productAccessControlGroups'
      })
      Company.hasMany(models.CompanyUserGroup, {
        foreignKey: 'companyId',
        as: 'companyUserGroups',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.ProductAccessControlGroup, {
        foreignKey: 'companyId',
        as: 'companyProductAccessControlGroups',
        onDelete: 'CASCADE'
      })
      Company.hasMany(models.CompanyInviteToken, {
        foreignKey: 'companyId',
        as: 'companyInviteTokens',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICompany {
      return {
        id: this.id,
        customerId: this.customerId,
        name: this.name,
        suffix: this.suffix,
        email: this.email,
        phone: this.phone,
        vat: this.vat,
        domain: this.domain,
        isDomainVerified: this.isDomainVerified,
        domainVerificationCode: this.domainVerificationCode,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        owner: this.owner,
        addresses: this.addresses,
        secondaryDomains: this.secondaryDomains,
        accessPermissions: this.accessPermissions,
        theme: this.theme,
        logo: this.logo,
        subscriptions: this.subscriptions,
        productAccessControlGroups: this.productAccessControlGroups,
        companyUserGroups: this.companyUserGroups,
        shopHeader: this.shopHeader
      }
    }
  };

  Company.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    customerId: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    suffix: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vat: {
      type: DataTypes.STRING,
      allowNull: true
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isDomainVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    domainVerificationCode: {
      type: DataTypes.JSON,
      defaultValue: {
        createdAt: null,
        value: null
      }
    },
    theme: {
      type: DataTypes.JSON,
      defaultValue: null
    },
    logo: {
      type: DataTypes.JSON,
      defaultValue: null
    },
    shopHeader: {
      type: DataTypes.JSON,
      defaultValue: null
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Company'
  })

  Company.beforeSave(async (company: any) => {
    if (company.changed('domain') === true) {
      company.isDomainVerified = false
      company.domainVerificationCode.value = null
      company.domainVerificationCode.createdAt = null
    }
  })

  return Company
}

module.exports = CompanyModel
