'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SupplierProductVariants', {
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
      variantId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: true
      },
      releaseDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      discontinuedDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      productPropositionCategory: {
        type: Sequelize.STRING,
        allowNull: true
      },
      categoryLevel1: {
        type: Sequelize.STRING,
        allowNull: true
      },
      categoryLevel2: {
        type: Sequelize.STRING,
        allowNull: true
      },
      categoryLevel3: {
        type: Sequelize.STRING,
        allowNull: true
      },
      colorDescription: {
        type: Sequelize.STRING,
        allowNull: true
      },
      colorGroup: {
        type: Sequelize.STRING,
        allowNull: true
      },
      plcStatus: {
        type: Sequelize.STRING,
        allowNull: true
      },
      plcStatusDescription: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gtin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      colorCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pmsColor: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('SupplierProductVariants')
  }
}
