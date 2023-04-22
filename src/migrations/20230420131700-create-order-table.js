'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      outboundId: {
        allowNull: false,
        type: Sequelize.STRING
      },
      fulfillerId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      merchantOutboundNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      warehouseId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shippingAddress: {
        type: Sequelize.JSON,
        allowNull: false
      },
      items: {
        type: Sequelize.JSON,
        allowNull: true
      },
      senderAddress: {
        type: Sequelize.JSON,
        allowNull: false
      },
      attributes: {
        type: Sequelize.JSON,
        allowNull: true
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false
      },
      externalNote: {
        type: Sequelize.STRING,
        allowNull: false
      },
      salesChannel: {
        type: Sequelize.STRING,
        allowNull: false
      },
      desiredDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      shippingMethodId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shippingType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shippingFee: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      orderValue: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      companyId: {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Companies',
          key: 'id',
          as: 'companyId'
        }
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Orders')
  }
}
