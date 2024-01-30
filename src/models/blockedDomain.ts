import { Model } from 'sequelize'
import type { IBlockedDomain } from '../types'

const BlockedDomainModel = (sequelize: any, DataTypes: any): any => {
  interface BlockedDomainAttributes {
    id: string
    domain: string
  }

  class BlockedDomain extends Model<BlockedDomainAttributes> {
    private readonly id: string
    private readonly domain: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): IBlockedDomain {
      return {
        id: this.id,
        domain: this.domain,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  BlockedDomain.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'BlockedDomain'
  })

  return BlockedDomain
}

module.exports = BlockedDomainModel
