'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Addresses', 'affiliation', {
        allowNull: true,
        type: Sequelize.STRING
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Addresses', 'affiliation')
    ])
  }
}
