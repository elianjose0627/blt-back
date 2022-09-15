import { Model } from 'sequelize'
import { ICompany } from '../types'

const CompanyModel = (sequelize: any, DataTypes: any): any => {
  interface CompanyAttributes {
    id: string
    customerId: number
    name: string
    email: string
    phone: string
    vat: string
  }

  class Company extends Model<CompanyAttributes> {
    private readonly id: string
    private readonly customerId: number
    private readonly name: string
    private readonly email: string
    private readonly phone: string
    private readonly vat: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      Company.hasMany(models.User, {
        foreignKey: 'companyId',
        as: 'employees',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICompany {
      return {
        id: this.id,
        customerId: this.customerId,
        name: this.name,
        email: this.email,
        phone: this.phone,
        vat: this.vat,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
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
      type: DataTypes.INTEGER,
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
