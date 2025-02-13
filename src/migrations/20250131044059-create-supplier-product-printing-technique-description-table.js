'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SupplierProductPrintingTechniqueDescriptions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      printingTechniqueDescriptionId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      name: {
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
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SupplierProductPrintingTechniqueDescriptions')
  }
}
