import { Model } from 'sequelize'
import bcrypt from 'bcrypt'
import capitalize from '../utils/capitalize'
import type { LoginTime, MediaData, INotifications, Nullable, Role, IUser, ICompany, IAddress, IProductAccessControlGroup, ICompanyUserGroup } from '../types'
import * as userRoles from '../utils/userRoles'

const UserModel = (sequelize: any, DataTypes: any): any => {
  interface UserAttributes {
    id: string
    salutation: string
    firstName: string
    lastName: string
    username: string
    email: string
    phone: string
    location: any
    photo: Nullable<MediaData>
    role: Role
    isActive: boolean
    isVerified: boolean
    isGhost: boolean
    logoutTime: Date
    notifications: INotifications
    loginTime: Nullable<LoginTime>
    password: string
    otp: any
    hireDate: Nullable<Date>
    startDate: Nullable<Date>
    birthDate: Nullable<Date>
    releaseDate: Nullable<Date>
  }
  class User extends Model<UserAttributes> {
    private readonly id: string
    private readonly salutation: string
    private readonly firstName: string
    private readonly lastName: string
    private readonly username: string
    private readonly email: string
    private readonly phone: string
    private readonly location: any
    private readonly photo: Nullable<MediaData>
    private readonly role: Role
    private readonly isActive: boolean
    private readonly isVerified: boolean
    private readonly isGhost: boolean
    private readonly logoutTime: Nullable<Date>
    private readonly notifications: INotifications
    private readonly loginTime: LoginTime
    private readonly password: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly hireDate: Nullable<Date>
    private readonly startDate: Nullable<Date>
    private readonly birthDate: Nullable<Date>
    private readonly releaseDate: Nullable<Date>
    private readonly company: ICompany
    private readonly addresses: IAddress[]
    private readonly productAccessControlGroups: IProductAccessControlGroup[]
    private readonly companyUserGroups: ICompanyUserGroup[]

    static associate (models: any): any {
      User.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      User.hasOne(models.Company, {
        foreignKey: 'userId',
        onDelete: 'CASCADE'
      })
      User.hasMany(models.Address, {
        foreignKey: 'userId',
        as: 'addresses',
        onDelete: 'CASCADE'
      })
      User.belongsToMany(models.ProductAccessControlGroup, {
        foreignKey: 'userId',
        through: models.UserProductAccessControlGroup,
        as: 'productAccessControlGroups'
      })
      User.belongsToMany(models.CompanyUserGroup, {
        foreignKey: 'userId',
        through: models.UserCompanyUserGroup,
        as: 'companyUserGroups'
      })
      User.hasMany(models.ApiKey, {
        foreignKey: 'userId',
        as: 'apiKeys',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IUser {
      return {
        id: this.id,
        salutation: this.salutation,
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
        email: this.email,
        phone: this.phone,
        location: this.location,
        photo: this.photo,
        role: this.role,
        isActive: this.isActive,
        isVerified: this.isVerified,
        isGhost: this.isGhost,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        logoutTime: this.logoutTime,
        notifications: this.notifications,
        loginTime: this.loginTime,
        hireDate: this.hireDate,
        startDate: this.startDate,
        birthDate: this.birthDate,
        releaseDate: this.releaseDate,
        company: this.company,
        addresses: this.addresses,
        productAccessControlGroups: this.productAccessControlGroups,
        companyUserGroups: this.companyUserGroups
      }
    }

    async comparePassword (password: string, cb: any): Promise<any> {
      const match = await bcrypt.compare(password, this.password)
      if (match) {
        return cb(match)
      }
      return cb(undefined)
    }
  };

  User.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    salutation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true
    },
    photo: {
      allowNull: true,
      type: DataTypes.JSON
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: userRoles.USER
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isGhost: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    otp: {
      type: DataTypes.JSON,
      defaultValue: {
        createdAt: null,
        value: null
      }
    },
    logoutTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notifications: {
      type: DataTypes.JSON,
      defaultValue: {
        isEnabled: true
      }
    },
    loginTime: {
      type: DataTypes.JSON,
      defaultValue: {
        lastSuccessful: null,
        lastFailed: null,
        failed: 0
      }
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'User'
  })

  User.beforeSave(async (user: any) => {
    if (user.changed('password') === true) {
      user.password = await bcrypt.hash(user.password, 10)
    }
    user.firstName = capitalize(user.firstName)
    user.lastName = capitalize(user.lastName)
  })

  return User
}

module.exports = UserModel
