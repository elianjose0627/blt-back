'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('BundleStocks', {
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
        unique: true,
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
      bundleId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Bundles',
          key: 'id'
        }
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('BundleStocks')
  }
}
