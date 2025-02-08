'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SupplierProductPrintDataProductPrintingPositions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      positionId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      printSizeUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      maxPrintSizeHeight: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      maxPrintSizeWidth: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      rotation: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      printPositionType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      printingTechniques: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      points: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      images: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      supplierProductPrintDataProductId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'SupplierProductPrintDataProducts', key: 'id' },
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('SupplierProductPrintDataProductPrintingPositions')
  }
}
