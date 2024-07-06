'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Stocks', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      jfsku: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      merchantSku: {
        allowNull: true,
        type: Sequelize.STRING
      },
      stockLevel: {
        allowNull: false,
        type: Sequelize.DOUBLE,
        defaultValue: 0.00
      },
      stockLevelAnnounced: {
        allowNull: false,
        type: Sequelize.DOUBLE,
        defaultValue: 0.00
      },
      stockLevelReserved: {
        allowNull: false,
        type: Sequelize.DOUBLE,
        defaultValue: 0.00
      },
      stockLevelBlocked: {
        allowNull: false,
        type: Sequelize.DOUBLE,
        defaultValue: 0.00
      },
      fulfillerTimestamp: {
        allowNull: false,
        type: Sequelize.DATE
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
      productId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Products',
          key: 'id'
        }
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Stocks')
  }
}
