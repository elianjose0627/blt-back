'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Addresses', 'type', {
        type: Sequelize.STRING,
        defaultValue: null
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Addresses', 'type')
    ])
  }
}
