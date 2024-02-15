'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Addresses', 'email', {
        type: Sequelize.STRING,
        defaultValue: null
      }),
      queryInterface.addColumn('Addresses', 'costCenter', {
        type: Sequelize.STRING,
        defaultValue: null
      }),
      queryInterface.addColumn('Addresses', 'companyName', {
        type: Sequelize.STRING,
        defaultValue: null
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Addresses', 'email'),
      queryInterface.removeColumn('Addresses', 'costCenter'),
      queryInterface.removeColumn('Addresses', 'companyName')
    ])
  }
}
