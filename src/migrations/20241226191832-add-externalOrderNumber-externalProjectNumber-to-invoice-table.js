'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.addColumn('Invoices', 'externalOrderNumber', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Invoices', 'externalProjectNumber', {
        type: Sequelize.STRING,
        allowNull: true
      })
    ])
  },

  async down (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.removeColumn('Invoices', 'externalOrderNumber'),
      queryInterface.removeColumn('Invoices', 'externalProjectNumber')
    ])
  }
}
