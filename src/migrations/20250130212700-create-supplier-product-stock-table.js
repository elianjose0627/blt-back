'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SupplierProductStocks', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      supplierProductId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'SupplierProducts',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
        allowNull: false
      },
      firstArrivalQuantity: {
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
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SupplierProductStocks')
  }
}
