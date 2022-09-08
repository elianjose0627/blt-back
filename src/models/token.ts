import { Model } from 'sequelize'
import { IToken } from '../types'

const TokenModel = (sequelize: any, DataTypes: any): any => {
  interface TokenAttributes {
    id: string
    accessToken: string
    refreshToken: string
  }

  class Token extends Model<TokenAttributes> {
    private readonly id: string
    private readonly accessToken: string
    private readonly refreshToken: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IToken {
      return {
        id: this.id,
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  Token.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Token'
  })

  return Token
}

module.exports = TokenModel
