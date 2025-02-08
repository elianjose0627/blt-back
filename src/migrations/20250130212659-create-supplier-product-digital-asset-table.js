'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SupplierProductDigitalAssets', {
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
      supplierProductVariantId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'SupplierProductVariants',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      urlHighress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      subtype: {
        type: Sequelize.STRING,
        allowNull: true
      },
      for: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('SupplierProductDigitalAssets')
  }
}
