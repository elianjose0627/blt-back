import { Model } from 'sequelize'
import bcrypt from 'bcrypt'
import type { IApiKey, Nullable, ApiKeyPermission } from '../types'

const ApiKeyModel = (sequelize: any, DataTypes: any): any => {
  interface ApiKeyAttributes {
    id: string
    secretKey: string
    isEnabled: boolean
    description: Nullable<string>
    validFrom: Date
    validTo: Nullable<Date>
    revokedAt: Nullable<Date>
    permissions: ApiKeyPermission[]
  }

  class ApiKey extends Model<ApiKeyAttributes> {
    private readonly id: string
    private readonly isEnabled: boolean
    private readonly validFrom: Date
    private readonly validTo: Nullable<Date>
    private readonly revokedAt: Nullable<Date>
    private readonly description: Nullable<string>
    private readonly permissions: ApiKeyPermission[]
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      ApiKey.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IApiKey {
      return {
        id: this.id,
        isEnabled: this.isEnabled,
        validFrom: this.validFrom,
        validTo: this.validTo,
        revokedAt: this.revokedAt,
        description: this.description,
        permissions: this.permissions,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  ApiKey.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    secretKey: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    validTo: {
      type: DataTypes.DATE,
      allowNull: true
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'ApiKey'
  })

  ApiKey.beforeSave(async (apiKey: any) => {
    if (apiKey.changed('secretKey') === true) {
      apiKey.secretKey = await bcrypt.hash(apiKey.secretKey, 10)
    }
  })

  return ApiKey
}

module.exports = ApiKeyModel
