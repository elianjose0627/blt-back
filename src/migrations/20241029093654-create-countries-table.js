'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Countries', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      nameGerman: {
        allowNull: false,
        type: Sequelize.STRING
      },
      alpha2Code: {
        allowNull: false,
        type: Sequelize.STRING
      },
      alpha3Code: {
        allowNull: false,
        type: Sequelize.STRING
      },
      numeric: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      shippingBaseFee: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      shippingPerBundle: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.dropTable('Countries')
  }
}
