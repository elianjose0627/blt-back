'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SupplierProductPriceLists', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      // supplierProductVariantId: {
      //   type: Sequelize.UUID,
      //   allowNull: false,
      //   references: {
      //     model: 'SupplierProductVariants',
      //     key: 'id'
      //   },
      //   onDelete: 'CASCADE'
      // },
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
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'EUR'
      },
      validUntil: {
        type: Sequelize.DATE,
        allowNull: false
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
