'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SupplierProductStocks', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstArrivalDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      firstArrivalQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      nextArrivalDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      nextArrivalQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SupplierProductStocks')
  }
}
