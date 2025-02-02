'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SupplierProductPrintDataProducts', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      masterCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      masterId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      itemColorNumbers: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      printManipulation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      printTemplate: {
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
    await queryInterface.dropTable('SupplierProductPrintDataProducts')
  }
}
