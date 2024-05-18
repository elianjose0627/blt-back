'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Addresses', 'firstName', {
        allowNull: true,
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('Addresses', 'lastName', {
        allowNull: true,
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('Addresses', 'salutation', {
        allowNull: true,
        type: Sequelize.STRING
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Addresses', 'firstName'),
      queryInterface.removeColumn('Addresses', 'lastName'),
      queryInterface.removeColumn('Addresses', 'salutation')
    ])
  }
}
