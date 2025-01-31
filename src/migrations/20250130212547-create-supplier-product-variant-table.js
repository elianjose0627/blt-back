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
        allowNull: false
      },
      discontinuedDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      productPropositionCategory: {
        type: Sequelize.STRING,
        allowNull: false
      },
      categoryLevel1: {
        type: Sequelize.STRING,
        allowNull: false
      },
      categoryLevel2: {
        type: Sequelize.STRING,
        allowNull: false
      },
      categoryLevel3: {
        type: Sequelize.STRING,
        allowNull: false
      },
      colorDescription: {
        type: Sequelize.STRING,
        allowNull: false
      },
      colorGroup: {
        type: Sequelize.STRING,
        allowNull: false
      },
      plcStatus: {
        type: Sequelize.STRING,
        allowNull: false
      },
      plcStatusDescription: {
        type: Sequelize.STRING,
        allowNull: false
      },
      gtin: {
        type: Sequelize.STRING,
        allowNull: false
      },
      colorCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pmsColor: {
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
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SupplierProductVariants')
  }
}
