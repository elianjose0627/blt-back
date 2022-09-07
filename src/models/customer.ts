import { Model } from 'sequelize'
import { ICustomer, IUser } from '../types'

const CustomerModel = (sequelize: any, DataTypes: any): any => {
  interface CustomerAttributes {
    id: string
    internalCustomerId: number
  }

  class Customer extends Model<CustomerAttributes> {
    private readonly id: string
    private readonly internalCustomerId: number
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly customer: IUser

    static associate (models: any): any {
      Customer.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'customer',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICustomer {
      return {
        id: this.id,
        internalCustomerId: this.internalCustomerId,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        customer: this.customer
      }
    }
  };

  Customer.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    internalCustomerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  }, {
    sequelize,
    paranoid: true,
    modelName: 'Customer'
  })

  return Customer
}

module.exports = CustomerModel
