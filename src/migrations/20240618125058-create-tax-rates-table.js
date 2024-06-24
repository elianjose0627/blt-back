'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TaxRates', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      publicId: {
        allowNull: false,
        unique: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      zone: {
        allowNull: true,
        type: Sequelize.STRING
      },
      countryCode: {
        allowNull: true,
        type: Sequelize.STRING
      },
      rate: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.00
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TaxRates')
  }
}
