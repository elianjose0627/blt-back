'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SupplierProductPriceLists', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: true
      },
      variantId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'EUR'
      },
      validUntil: {
        type: Sequelize.DATE,
        allowNull: true
      },
      scale: {
        type: Sequelize.JSONB,
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
        type: Sequelize.DATE,
        allowNull: true
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SupplierProductPriceLists')
  }
}
