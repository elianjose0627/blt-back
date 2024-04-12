'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('JtlShippingMethods', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      shippingMethodId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fulfillerId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shippingType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      carrierCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      carrierName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      trackingUrlSchema: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cutoffTime: {
        type: Sequelize.STRING,
        allowNull: true
      },
      note: {
        type: Sequelize.STRING,
        allowNull: true
      },
      modificationInfo: {
        type: Sequelize.JSON,
        allowNull: true
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
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('JtlShippingMethods')
  }
}
