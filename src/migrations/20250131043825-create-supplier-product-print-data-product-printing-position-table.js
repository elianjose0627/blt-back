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
        allowNull: true
      },
      maxPrintSizeHeight: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      maxPrintSizeWidth: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      rotation: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      printPositionType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      printingTechniques: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      points: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      images: {
        type: Sequelize.JSONB,
        allowNull: true
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
