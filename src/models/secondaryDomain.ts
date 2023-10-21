import { Model } from 'sequelize'
import type { ISecondaryDomain } from '../types'

const SecondaryDomainModel = (sequelize: any, DataTypes: any): any => {
  interface SecondaryDomainAttributes {
    id: string
    name: string
    isVerified: boolean
  }

  class SecondaryDomain extends Model<SecondaryDomainAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly isVerified: boolean
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      SecondaryDomain.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ISecondaryDomain {
      return {
        id: this.id,
        name: this.name,
        isVerified: this.isVerified,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  SecondaryDomain.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SecondaryDomain'
  })

  return SecondaryDomain
}

module.exports = SecondaryDomainModel
