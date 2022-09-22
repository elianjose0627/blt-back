import { Model } from 'sequelize'
import { ICompany, IUser } from '../types'

const CompanyModel = (sequelize: any, DataTypes: any): any => {
  interface CompanyAttributes {
    id: string
    name: string
    email: string
    phone: string
    vat: string
  }

  class Company extends Model<CompanyAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly email: string
    private readonly phone: string
    private readonly vat: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly owner: IUser

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
      Company.hasOne(models.Address, {
        foreignKey: 'companyId',
        as: 'address',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICompany {
      return {
        id: this.id,
        name: this.name,
        email: this.email,
        phone: this.phone,
        vat: this.vat,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        owner: this.owner
      }
    }
  };

  Company.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
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
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Company'
  })

  return Company
}

module.exports = CompanyModel
