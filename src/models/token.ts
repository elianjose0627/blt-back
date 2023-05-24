import { Model } from 'sequelize'

const TokenModel = (sequelize: any, DataTypes: any): any => {
  interface TokenAttributes {
    id: string
    accessToken: string
    refreshToken: string
  }

  class Token extends Model<TokenAttributes> {
    static associate (models: any): any {

    }
  };

  Token.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    refreshToken: {
      type: DataTypes.TEXT,
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
